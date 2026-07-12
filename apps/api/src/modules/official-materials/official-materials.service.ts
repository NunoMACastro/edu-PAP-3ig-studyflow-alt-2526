/**
 * Implementa as regras de negócio de materiais oficiais e concentra validações do domínio.
 */
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
    Optional,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { createHash } from "node:crypto";
import { Types, type ClientSession, type Connection, type Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { MaterialStorageService } from "../materials/material-storage.service.js";
import {
    materialTypeFromMime,
    validateMaterialUpload,
} from "../materials/validators/material-upload.validator.js";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto.js";
import {
    OfficialMaterial,
    OfficialMaterialDocument,
    OfficialMaterialStatus,
    OfficialMaterialType,
} from "./schemas/official-material.schema.js";

/**
 * Vista pública de materiais oficiais, sem detalhes internos de Mongoose.
 */
export type OfficialMaterialView = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    type: OfficialMaterialType;
    status: OfficialMaterialStatus;
    textContent?: string;
    sourceUrl?: string;
    activeVersionId?: string;
    contentRevision?: number;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    availableToAi?: boolean;
    createdAt?: Date;
};

export type StudentOfficialMaterialView = Omit<
    OfficialMaterialView,
    "teacherId" | "contentRevision"
> & {
    contentRevision: number;
    availableToAi: boolean;
};

/**
 * Serviço de materiais oficiais por disciplina.
 */
@Injectable()
export class OfficialMaterialsService {
    private readonly logger = new Logger(OfficialMaterialsService.name);
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param materialModel Modelo Mongoose injetado para ler e persistir materiais oficiais.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     * @param auditLogService Service injetado para registar submissões oficiais sem copiar conteúdo.
     */
    constructor(
        @InjectModel(OfficialMaterial.name)
        private readonly materialModel: Model<OfficialMaterialDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly auditLogService: AuditLogService,
        private readonly notificationsService: ContextNotificationsService,
        @Optional()
        @InjectConnection()
        private readonly connection?: Connection,
        @Optional()
        private readonly storage?: MaterialStorageService,
    ) {}

    /**
     * Cria materiais oficiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param subjectId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async createOfficialMaterial(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateOfficialMaterialDto,
    ): Promise<OfficialMaterialView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );

        const document = {
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(subject.classId),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            type: input.type,
            status: input.type === "TEXT" ? "PROCESSED" : "REFERENCE_ONLY",
            textContent:
                input.type === "TEXT"
                    ? this.cleanTextContent(input.textContent)
                    : undefined,
            sourceUrl:
                input.type === "URL" ? this.parseSafeUrl(input.sourceUrl) : undefined,
        };
        return this.runInTransaction(async (session) => {
            await this.subjectsService.reserveActiveChildMutation(
                actor.id,
                subject.classId,
                subject._id,
                session,
            );
            const material = session
                ? (await this.materialModel.create([document], { session }))[0]
                : await this.materialModel.create(document);
            const view = this.toMaterialView(material.toObject());
            const auditRecord = {
                actorId: actor.id,
                domain: "MATERIALS",
                action: "OFFICIAL_MATERIAL_CREATED",
                resourceType: "OfficialMaterial",
                resourceId: view._id,
                result: "SUCCESS",
                metadata: {
                    subjectId: String(subject._id),
                    classId: String(subject.classId),
                    type: view.type,
                    status: view.status,
                },
            } as const;
            if (session) {
                await this.auditLogService.record(auditRecord, session);
            } else {
                await this.auditLogService.record(auditRecord);
            }
            const notification = {
                classId: String(subject.classId),
                idempotencyKey: `official-material:${view._id}:available`,
                type: "OFFICIAL_MATERIAL_AVAILABLE",
                title: `Material disponível: ${view.title}`,
                body: "Está disponível um novo material oficial na disciplina.",
                targetPath: `/app/disciplinas/${String(subject._id)}/materiais`,
            } as const;
            if (session) {
                await this.notificationsService.enqueueClassEvent(
                    actor,
                    notification,
                    session,
                );
            } else {
                await this.notificationsService.enqueueClassEvent(
                    actor,
                    notification,
                );
            }

            return view;
        });
    }

    /**
     * Submete um PDF ou DOCX oficial usando o storage privado e compensável já
     * utilizado pelos materiais pessoais.
     */
    async submitOfficialFile(
        actor: AuthenticatedUser,
        subjectId: string,
        file: Express.Multer.File,
        title: string,
    ): Promise<OfficialMaterialView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const safeTitle = title?.trim() ?? "";
        if (safeTitle.length < 2 || safeTitle.length > 160) {
            throw new BadRequestException({
                code: "OFFICIAL_MATERIAL_TITLE_INVALID",
                message: "O título do material deve ter entre 2 e 160 caracteres.",
            });
        }
        const { originalName } = validateMaterialUpload(file);
        const storage = this.requireStorage();
        const safeFile = { ...file, originalname: originalName };
        const staged = await storage.stage(actor.id, safeFile);
        await storage.prepareCommit(staged);

        let material: OfficialMaterialDocument;
        try {
            material = await this.runInTransaction(async (session) => {
                await this.subjectsService.reserveActiveChildMutation(
                    actor.id,
                    subject.classId,
                    subject._id,
                    session,
                );
                const document = {
                    subjectId: new Types.ObjectId(subject._id),
                    classId: new Types.ObjectId(subject.classId),
                    teacherId: new Types.ObjectId(actor.id),
                    title: safeTitle,
                    type: materialTypeFromMime(file.mimetype),
                    status: "PENDING_PROCESSING" as const,
                    storageKey: staged.storageKey,
                    storageSha256: staged.sha256,
                    originalName,
                    mimeType: file.mimetype,
                    sizeBytes: staged.sizeBytes,
                    contentRevision: 0,
                };
                return session
                    ? (await this.materialModel.create([document], { session }))[0]
                    : this.materialModel.create(document);
            });
        } catch (error) {
            await storage.abort(staged);
            throw error;
        }

        try {
            await storage.commit(staged);
        } catch {
            await this.materialModel.deleteOne({ _id: material._id });
            await storage.abort(staged);
            throw new ServiceUnavailableException({
                code: "OFFICIAL_MATERIAL_STORAGE_COMMIT_FAILED",
                message: "Não foi possível concluir o upload do material oficial.",
            });
        }

        const view = this.toPublicMaterialView(this.toMaterialView(material.toObject()));
        const secondaryEvents = await Promise.allSettled([
            this.auditLogService.record({
                actorId: actor.id,
                domain: "MATERIALS",
                action: "OFFICIAL_MATERIAL_FILE_SUBMITTED",
                resourceType: "OfficialMaterial",
                resourceId: view._id,
                result: "SUCCESS",
                metadata: {
                    subjectId: subject._id,
                    classId: subject.classId,
                    type: view.type,
                    status: view.status,
                    sizeBytes: view.sizeBytes,
                },
            }),
            this.notificationsService.enqueueClassEvent(actor, {
                classId: String(subject.classId),
                idempotencyKey: `official-material:${view._id}:available`,
                type: "OFFICIAL_MATERIAL_AVAILABLE",
                title: `Material disponível: ${view.title}`,
                body: "Está disponível um novo material oficial na disciplina.",
                targetPath: `/app/disciplinas/${String(subject._id)}/materiais`,
            }),
        ]);
        if (secondaryEvents.some((result) => result.status === "rejected")) {
            this.logger.warn(
                "Upload oficial concluído com falha controlada num evento secundário.",
            );
        }
        return view;
    }

    /**
     * Lista materiais oficiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de materiais oficiais visível para o contexto autorizado.
     */
    async listTeacherSubjectMaterials(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<OfficialMaterialView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubjectForHistory(
            actor.id,
            subjectId,
        );
        const materials = await this.materialModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        return materials.map((material) =>
            this.toPublicMaterialView(this.toMaterialView(material)),
        );
    }

    /** Catálogo seguro de materiais para um aluno inscrito na disciplina. */
    async listStudentSubjectMaterials(
        actor: AuthenticatedUser,
        subjectId: string,
        cursor?: string,
        requestedLimit = 20,
    ): Promise<{
        items: StudentOfficialMaterialView[];
        nextCursor: string | null;
    }> {
        this.assertStudent(actor);
        if (cursor && !Types.ObjectId.isValid(cursor)) {
            throw new BadRequestException({
                code: "OFFICIAL_MATERIAL_CURSOR_INVALID",
                message: "Cursor de materiais inválido.",
            });
        }
        const { subject } = await this.subjectsService.findSubjectForStudentHistory(
            actor.id,
            subjectId,
        );
        const limit = Math.max(1, Math.min(50, Number(requestedLimit) || 20));
        const materials = await this.materialModel
            .find({
                subjectId: new Types.ObjectId(subject._id),
                ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}),
            })
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = materials.length > limit;
        const pageRows = hasMore ? materials.slice(0, limit) : materials;
        return {
            items: pageRows.map((material) => this.toStudentMaterialView(material)),
            nextCursor: hasMore ? String(pageRows.at(-1)?._id) : null,
        };
    }

    /** Detalhe seguro de um material da disciplina do aluno. */
    async getStudentSubjectMaterial(
        actor: AuthenticatedUser,
        subjectId: string,
        materialId: string,
    ): Promise<StudentOfficialMaterialView> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(materialId)) throw this.studentMaterialNotFound();
        const { subject } = await this.subjectsService.findSubjectForStudentHistory(
            actor.id,
            subjectId,
        );
        const material = await this.materialModel
            .findOne({
                _id: new Types.ObjectId(materialId),
                subjectId: new Types.ObjectId(subject._id),
            })
            .lean();
        if (!material) throw this.studentMaterialNotFound();
        return this.toStudentMaterialView(material);
    }

    /**
     * Resolve e lê um ficheiro depois de validar ownership ou inscrição atual.
     * A chave de storage nunca atravessa este contrato.
     */
    async readAuthorizedOfficialFile(
        actor: AuthenticatedUser,
        materialId: string,
    ): Promise<{
        type: "PDF" | "DOCX";
        originalName: string;
        mimeType: string;
        buffer: Buffer;
    }> {
        if (!Types.ObjectId.isValid(materialId)) throw this.studentMaterialNotFound();
        const material = await this.materialModel.findById(materialId).lean();
        if (
            !material ||
            !["PDF", "DOCX"].includes(material.type) ||
            !material.storageKey ||
            !material.originalName ||
            !material.mimeType
        ) {
            throw this.studentMaterialNotFound();
        }

        if (actor.role === "TEACHER") {
            if (String(material.teacherId) !== actor.id) {
                throw this.studentMaterialNotFound();
            }
        } else if (actor.role === "STUDENT") {
            await this.subjectsService.findSubjectForStudentHistory(
                actor.id,
                String(material.subjectId),
            );
        } else {
            throw this.studentMaterialNotFound();
        }

        const canonicalMime =
            material.type === "PDF"
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (material.mimeType !== canonicalMime) {
            throw this.fileUnavailable();
        }
        let buffer: Buffer;
        try {
            buffer = await this.requireStorage().read(material.storageKey);
        } catch {
            throw this.fileUnavailable();
        }
        const digest = createHash("sha256").update(buffer).digest("hex");
        if (
            buffer.byteLength === 0 ||
            (material.sizeBytes !== undefined && material.sizeBytes !== buffer.byteLength) ||
            (material.storageSha256 && material.storageSha256 !== digest)
        ) {
            throw this.fileUnavailable();
        }
        return {
            type: material.type as "PDF" | "DOCX",
            originalName: material.originalName,
            mimeType: canonicalMime,
            buffer,
        };
    }

    /**
     * Conta materiais oficiais associados a disciplinas já filtradas por outro service de domínio.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @returns Número de materiais oficiais encontrados.
     */
    async countBySubjectIds(subjectIds: string[]): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.materialModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
        });
    }

    /**
     * Conta materiais oficiais por disciplina já autorizada pelo chamador.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @returns Mapa subjectId -> número de materiais oficiais.
     */
    async countBySubjectIdsGrouped(
        subjectIds: string[],
    ): Promise<Record<string, number>> {
        if (subjectIds.length === 0) return {};
        const rows = await this.materialModel.aggregate<{
            _id: Types.ObjectId;
            count: number;
        }>([
            {
                $match: {
                    subjectId: {
                        $in: subjectIds.map((id) => new Types.ObjectId(id)),
                    },
                },
            },
            { $group: { _id: "$subjectId", count: { $sum: 1 } } },
        ]);
        return rows.reduce<Record<string, number>>((counts, row) => {
            counts[String(row._id)] = row.count;
            return counts;
        }, {});
    }

    /**
     * Lista materiais oficiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de materiais oficiais visível para o contexto autorizado.
     */
    async listProcessedForSubject(subjectId: string): Promise<OfficialMaterialView[]> {
        const materials = await this.materialModel
            .find({
                subjectId: new Types.ObjectId(subjectId),
                status: "PROCESSED",
                textContent: { $exists: true, $ne: "" },
            })
            .sort({ createdAt: -1 })
            .lean();
        return materials.map((material) => this.toMaterialView(material));
    }

    /**
     * Alias explícito para BKs MF2 que consomem materiais processados.
     *
     * @param subjectId Disciplina oficial.
     * @returns Materiais oficiais com texto processável.
     */
    async findProcessedBySubject(
        subjectId: string,
    ): Promise<OfficialMaterialView[]> {
        return this.listProcessedForSubject(subjectId);
    }

    /**
     * Obtém um material oficial validando que pertence ao professor.
     *
     * @param teacherId Professor autenticado.
     * @param materialId Material oficial.
     * @returns Material oficial público.
     */
    async findOwnedMaterial(
        teacherId: string,
        materialId: string,
    ): Promise<OfficialMaterialView> {
        if (!Types.ObjectId.isValid(materialId)) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_MATERIAL_ID",
                message: "Material oficial inválido.",
            });
        }

        const material = await this.materialModel
            .findOne({
                _id: materialId,
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!material) {
            throw new BadRequestException({
                code: "OFFICIAL_MATERIAL_NOT_FOUND",
                message: "Material oficial não encontrado.",
            });
        }
        return this.toMaterialView(material);
    }

    /** Carrega metadados internos apenas para o pipeline de indexação. */
    async findOwnedMaterialForIndexing(
        teacherId: string,
        materialId: string,
    ): Promise<OfficialMaterialView & {
        storageKey?: string;
        storageSha256?: string;
    }> {
        if (!Types.ObjectId.isValid(materialId)) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_MATERIAL_ID",
                message: "Material oficial inválido.",
            });
        }
        const material = await this.materialModel
            .findOne({
                _id: new Types.ObjectId(materialId),
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!material) {
            throw new BadRequestException({
                code: "OFFICIAL_MATERIAL_NOT_FOUND",
                message: "Material oficial não encontrado.",
            });
        }
        return {
            ...this.toMaterialView(material),
            storageKey: material.storageKey,
            storageSha256: material.storageSha256,
        };
    }

    /** Lê uma chave já resolvida do documento interno para indexação. */
    async readStoredFile(storageKey: string): Promise<Buffer> {
        return this.requireStorage().read(storageKey);
    }

    /**
     * Carrega materiais por identificador depois de o chamador ter validado o contexto.
     * Identificadores legados inválidos são ignorados para manter salas antigas legíveis.
     *
     * @param materialIds Identificadores persistidos na sala guiada.
     * @returns Materiais existentes, sem ampliar o âmbito autorizado pelo chamador.
     */
    async listByIds(materialIds: string[]): Promise<OfficialMaterialView[]> {
        const validIds = [...new Set(materialIds)].filter((id) =>
            Types.ObjectId.isValid(id),
        );
        if (validIds.length === 0) return [];
        const materials = await this.materialModel
            .find({ _id: { $in: validIds.map((id) => new Types.ObjectId(id)) } })
            .sort({ createdAt: -1 })
            .lean();
        return materials.map((material) => this.toMaterialView(material));
    }

    /**
     * Marca um material oficial como processado depois de indexação textual.
     *
     * @param teacherId Professor autenticado.
     * @param materialId Material oficial.
     * @param textContent Texto extraído.
     * @returns Nada.
     */
    async markIndexedText(
        teacherId: string,
        materialId: string,
        textContent: string,
        session?: ClientSession,
    ): Promise<void> {
        await this.materialModel.updateOne(
            {
                _id: new Types.ObjectId(materialId),
                teacherId: new Types.ObjectId(teacherId),
            },
            {
                $set: {
                    status: "PROCESSED",
                    textContent: textContent.slice(0, 20000),
                },
                $inc: { contentRevision: 1 },
            },
            session ? { session } : undefined,
        );
    }

    /**
     * Converte e valida valores de materiais oficiais, rejeitando entradas que poderiam quebrar segurança ou consistência.
     *
     * @param value Valor bruto recebido antes de normalização, parsing ou validação.
     * @returns Valor normalizado e seguro para ser usado pelo restante fluxo.
     */
    private parseSafeUrl(value?: string): string {
        try {
            const url = new URL(String(value ?? ""));
            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("invalid protocol");
            }
            return url.toString();
        } catch {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_MATERIAL_URL",
                message: "Indica um URL http ou https válido.",
            });
        }
    }

    /**
     * Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de materiais oficiais.
     *
     * @param value Valor bruto recebido antes de normalização, parsing ou validação.
     * @returns Valor normalizado e seguro para ser usado pelo restante fluxo.
     */
    private cleanTextContent(value?: string): string {
        const textContent = value?.trim() ?? "";
        if (textContent.length < 20) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_MATERIAL_TEXT",
                message: "Indica texto oficial com conteúdo suficiente.",
            });
        }
        return textContent;
    }

    /** Mantém material, auditoria e outbox na mesma unidade de commit. */
    private async runInTransaction<T>(
        operation: (session?: ClientSession) => Promise<T>,
    ): Promise<T> {
        if (!this.connection) return operation(undefined);
        return this.connection.transaction((session) => operation(session));
    }

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    private studentMaterialNotFound(): NotFoundException {
        return new NotFoundException({
            code: "OFFICIAL_MATERIAL_NOT_FOUND",
            message: "Material oficial não encontrado.",
        });
    }

    /**
     * Mapeia o documento interno de materiais oficiais para uma forma pública estável e simples de consumir.
     *
     * @param material Valor de material usado pela função para executar to material view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toMaterialView(material: {
        _id: unknown;
        subjectId: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        type: OfficialMaterialType;
        status: OfficialMaterialStatus;
        textContent?: string;
        sourceUrl?: string;
        originalName?: string;
        mimeType?: string;
        sizeBytes?: number;
        activeVersionId?: unknown;
        contentRevision?: number;
        createdAt?: Date;
    }): OfficialMaterialView {
        return {
            _id: String(material._id),
            subjectId: String(material.subjectId),
            classId: String(material.classId),
            teacherId: String(material.teacherId),
            title: material.title,
            type: material.type,
            status: material.status,
            textContent: material.textContent,
            sourceUrl: material.sourceUrl,
            originalName: material.originalName,
            mimeType: material.mimeType,
            sizeBytes: material.sizeBytes,
            activeVersionId: material.activeVersionId
                ? String(material.activeVersionId)
                : undefined,
            contentRevision: material.contentRevision ?? 0,
            availableToAi:
                material.status === "PROCESSED" &&
                Boolean(material.textContent?.trim()),
            createdAt: material.createdAt,
        };
    }

    /** Remove texto extraído de ficheiros antes de responder a controllers. */
    private toPublicMaterialView(
        material: OfficialMaterialView,
    ): OfficialMaterialView {
        return material.type === "PDF" || material.type === "DOCX"
            ? { ...material, textContent: undefined }
            : material;
    }

    /** Projeta um material já autorizado sem identidade interna do professor. */
    toStudentMaterialView(material: Parameters<OfficialMaterialsService["toMaterialView"]>[0]): StudentOfficialMaterialView {
        const { teacherId: _teacherId, ...safe } = this.toPublicMaterialView(
            this.toMaterialView(material),
        );
        return {
            ...safe,
            contentRevision: safe.contentRevision ?? 0,
            availableToAi: safe.availableToAi ?? false,
        };
    }

    private requireStorage(): MaterialStorageService {
        if (!this.storage) {
            throw new ServiceUnavailableException({
                code: "MATERIAL_STORAGE_UNAVAILABLE",
                message: "O armazenamento de materiais não está disponível.",
            });
        }
        return this.storage;
    }

    private fileUnavailable(): ServiceUnavailableException {
        return new ServiceUnavailableException({
            code: "OFFICIAL_MATERIAL_FILE_UNAVAILABLE",
            message: "O ficheiro do material não está disponível neste momento.",
        });
    }
}
