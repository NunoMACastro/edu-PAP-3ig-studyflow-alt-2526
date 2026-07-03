/**
 * Implementa as regras de negócio de salas de estudo e concentra validações do domínio.
 */
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { CreateRoomShareDto } from "./dto/create-room-share.dto.js";
import { RoomShare, RoomShareDocument } from "./schemas/room-share.schema.js";
import { StudyRoomsService } from "./study-rooms.service.js";

/**
 * Fonte autorizada de salas de estudo, usada para explicar de onde vem a resposta apresentada.
 */
export type RoomShareSource = {
    shareId: string;
    title: string;
    contentText: string;
};

/**
 * Vista pública de salas de estudo, sem detalhes internos de Mongoose.
 */
type RoomShareView = {
    _id: string;
    roomId: string;
    authorStudentId: string;
    type: "NOTE" | "URL" | "MATERIAL_REF";
    title: string;
    textContent?: string;
    url?: string;
    materialId?: string;
    materialTitle?: string;
    usableByAi: boolean;
    createdAt?: Date;
};

/**
 * Serviço de partilhas dentro de salas de estudo.
 */
@Injectable()
export class RoomSharesService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param shareModel Modelo Mongoose injetado para ler e persistir salas de estudo.
     * @param materialsService Service público de materiais; valida ownership antes de devolver referência.
     * @param studyRoomsService Service injetado para reutilizar regras de salas de estudo sem duplicar validações.
     */
    constructor(
        @InjectModel(RoomShare.name)
        private readonly shareModel: Model<RoomShareDocument>,
        private readonly materialsService: MaterialsService,
        private readonly studyRoomsService: StudyRoomsService,
    ) {}

    /**
     * Cria salas de estudo depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param roomId Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de salas de estudo criado no formato público esperado pela UI ou pelo teste.
     */
    async createShare(
        actor: AuthenticatedUser,
        roomId: string,
        input: CreateRoomShareDto,
    ): Promise<RoomShareView> {
        // A partilha só é criada depois de confirmar que o aluno pertence à sala.
        await this.studyRoomsService.ensureMember(actor.id, roomId);

        const base = {
            roomId: new Types.ObjectId(roomId),
            authorStudentId: new Types.ObjectId(actor.id),
            type: input.type,
            title: input.title.trim(),
        };

        if (input.type === "NOTE") {
            const textContent = input.textContent?.trim();
            if (!textContent) throw this.invalidSharePayload();
            const share = await this.shareModel.create({
                ...base,
                textContent,
                usableByAi: true,
            });
            return this.toShareView(share.toObject());
        }

        if (input.type === "URL") {
            const url = this.parseSafeUrl(input.url);
            const copiedText = input.copiedText?.trim();
            const share = await this.shareModel.create({
                ...base,
                url,
                textContent: copiedText || undefined,
                // URLs sem texto copiado ficam visíveis, mas não entram no contexto da IA.
                usableByAi: Boolean(copiedText),
            });
            return this.toShareView(share.toObject());
        }

        const material = await this.findOwnMaterial(actor.id, input.materialId);
        const usableByAi = material.status === "READY" && Boolean(material.contentText);
        const share = await this.shareModel.create({
            ...base,
            materialId: material._id,
            materialTitle: material.title,
            textContent: usableByAi ? material.contentText : undefined,
            usableByAi,
        });
        return this.toShareView(share.toObject());
    }

    /**
     * Lista salas de estudo já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param roomId Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.
     * @returns Coleção de salas de estudo visível para o contexto autorizado.
     */
    async listRoomShares(
        actor: AuthenticatedUser,
        roomId: string,
    ): Promise<RoomShareView[]> {
        await this.studyRoomsService.ensureMember(actor.id, roomId);
        const shares = await this.shareModel
            .find({ roomId: new Types.ObjectId(roomId) })
            .sort({ createdAt: -1 })
            .lean();
        return shares.map((share) => this.toShareView(share));
    }

    /**
     * Lista fontes processáveis autorizadas para IA da sala.
     *
     * @param studentId Aluno autenticado.
     * @param roomId Sala onde membership é obrigatória.
     * @param sourceIds Filtro opcional enviado pelo aluno.
     * @returns Fontes textuais da sala.
     */
    async findUsableSharesForRoom(
        studentId: string,
        roomId: string,
        sourceIds?: string[],
    ): Promise<RoomShareSource[]> {
        // A membership é revalidada mesmo em leituras usadas internamente por IA.
        await this.studyRoomsService.ensureMember(studentId, roomId);
        const query: Record<string, unknown> = {
            roomId: new Types.ObjectId(roomId),
            usableByAi: true,
            textContent: { $exists: true, $ne: "" },
        };

        if (sourceIds && sourceIds.length > 0) {
            // IDs inválidos são rejeitados antes de montar a query Mongo.
            const validIds = sourceIds.filter((sourceId) =>
                Types.ObjectId.isValid(sourceId),
            );
            if (validIds.length === 0) {
                throw new BadRequestException({
                    code: "INVALID_SOURCE_IDS",
                    message: "Seleciona fontes válidas.",
                });
            }
            query._id = { $in: validIds.map((sourceId) => new Types.ObjectId(sourceId)) };
        }

        const shares = await this.shareModel.find(query).sort({ createdAt: -1 }).lean();
        return shares.map((share) => ({
            shareId: String(share._id),
            title: share.title,
            contentText: share.textContent!,
        }));
    }

    /**
     * Procura salas de estudo com filtros de ownership, membership ou estado para evitar leituras indevidas.
     *
     * @param studentId Identificador de student que delimita ownership, membership ou relação de domínio.
     * @param materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Entidade de salas de estudo já filtrada pelo contexto recebido.
     */
    private async findOwnMaterial(studentId: string, materialId?: string) {
        if (!materialId) {
            throw this.materialNotFound();
        }

        try {
            return await this.materialsService.findOwnedMaterialReference(
                studentId,
                materialId,
            );
        } catch {
            // Materiais de outro aluno são tratados como inexistentes para preservar privacidade.
            throw this.materialNotFound();
        }
    }

    /**
     * Converte e valida valores de salas de estudo, rejeitando entradas que poderiam quebrar segurança ou consistência.
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
                code: "INVALID_ROOM_SHARE_URL",
                message: "Indica um URL http ou https válido.",
            });
        }
    }

    /**
     * Constrói uma exceção de salas de estudo com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private invalidSharePayload(): BadRequestException {
        return new BadRequestException({
            code: "INVALID_ROOM_SHARE_PAYLOAD",
            message: "A partilha não tem conteúdo válido.",
        });
    }

    /**
     * Constrói uma exceção de salas de estudo com código previsível para API, UI e testes.
     * @returns Valor de salas de estudo no contrato esperado pelo chamador.
     */
    private materialNotFound(): NotFoundException {
        return new NotFoundException({
            code: "MATERIAL_NOT_FOUND",
            message: "Material não encontrado.",
        });
    }

    /**
     * Mapeia o documento interno de salas de estudo para uma forma pública estável e simples de consumir.
     *
     * @param share share necessário para executar to share view sem depender de estado global.
     * @returns Contrato público sem campos internos de persistência.
     */
    private toShareView(share: {
        _id: unknown;
        roomId: unknown;
        authorStudentId: unknown;
        type: "NOTE" | "URL" | "MATERIAL_REF";
        title: string;
        textContent?: string;
        url?: string;
        materialId?: unknown;
        materialTitle?: string;
        usableByAi: boolean;
        createdAt?: Date;
    }): RoomShareView {
        return {
            _id: String(share._id),
            roomId: String(share.roomId),
            authorStudentId: String(share.authorStudentId),
            type: share.type,
            title: share.title,
            textContent: share.textContent,
            url: share.url,
            materialId: share.materialId ? String(share.materialId) : undefined,
            materialTitle: share.materialTitle,
            usableByAi: share.usableByAi,
            createdAt: share.createdAt,
        };
    }
}
