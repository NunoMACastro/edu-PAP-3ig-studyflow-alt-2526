/**
 * Implementa as regras de negócio de material contexts e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    MaterialContext,
    MaterialContextDocument,
    MaterialContextScope,
} from "./schemas/material-context.schema.js";

/**
 * Contrato de contextos pedagógicos de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type PrivateMaterialContextInput = {
    scope: "PRIVATE_AREA";
    contextId: string;
    materialId: string;
    title: string;
    source: "student";
    studentId: string;
};

/**
 * Vista pública de contextos pedagógicos de materiais, sem detalhes internos de Mongoose.
 */
export type MaterialContextView = {
    _id: string;
    scope: MaterialContextScope;
    contextId: string;
    materialId: string;
    title: string;
    source: "student" | "teacher" | "class";
    studentId?: string;
    teacherId?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

/**
 * Serviço de separação de contextos de materiais.
 */
@Injectable()
export class MaterialContextsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param contextModel Modelo Mongoose injetado para ler e persistir contextos pedagógicos de materiais.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param officialMaterialsService Service injetado para reutilizar regras de materiais oficiais sem duplicar validações.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     */
    constructor(
        @InjectModel(MaterialContext.name)
        private readonly contextModel: Model<MaterialContextDocument>,
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Lista contextos pedagógicos de materiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @returns Coleção de contextos pedagógicos de materiais visível para o contexto autorizado.
     */
    async listPrivateArea(actor: AuthenticatedUser, studyAreaId: string) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        const materials = await this.materialsService.listByArea(
            actor.id,
            studyAreaId,
        );
        const contexts = await Promise.all(
            materials.map((material) =>
                this.upsertContext({
                    scope: "PRIVATE_AREA",
                    contextId: studyAreaId,
                    materialId: material._id,
                    title: material.title,
                    source: "student",
                    studentId: actor.id,
                }),
            ),
        );
        return {
            context: "PRIVATE_AREA",
            studyAreaId,
            materials: contexts,
            contexts,
        };
    }

    /**
     * Lista contextos pedagógicos de materiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de contextos pedagógicos de materiais visível para o contexto autorizado.
     */
    async listOfficialSubject(actor: AuthenticatedUser, subjectId: string) {
        if (actor.role === "STUDENT") {
            const { subject } =
                await this.subjectsService.findSubjectForStudentHistory(
                    actor.id,
                    subjectId,
                );
            const materials =
                await this.officialMaterialsService.findProcessedBySubject(
                    subject._id,
                );
            const contexts = materials.map((material) =>
                this.toOfficialView({
                    subjectId: subject._id,
                    materialId: material._id,
                    title: material.title,
                    source: "class",
                    createdAt: material.createdAt,
                }),
            );
            return {
                context: "OFFICIAL_SUBJECT",
                subjectId: subject._id,
                materials: contexts,
                contexts,
            };
        }
        if (actor.role === "TEACHER") {
            const subject = await this.subjectsService.findOwnedSubjectForHistory(
                actor.id,
                subjectId,
            );
            const materials =
                await this.officialMaterialsService.listTeacherSubjectMaterials(
                    actor,
                    subject._id,
                );
            const contexts = materials.map((material) =>
                this.toOfficialView({
                    subjectId: subject._id,
                    materialId: material._id,
                    title: material.title,
                    source: "teacher",
                    teacherId: actor.id,
                    createdAt: material.createdAt,
                }),
            );
            return {
                context: "OFFICIAL_SUBJECT",
                subjectId: subject._id,
                materials: contexts,
                contexts,
            };
        }
        throw new ForbiddenException({
            code: "ROLE_NOT_SUPPORTED",
            message: "Este papel não pode listar contextos de materiais.",
        });
    }

    /**
     * Executa a operação upsert context no domínio de contextos pedagógicos de materiais com contrato explícito.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    private async upsertContext(
        input: PrivateMaterialContextInput,
    ): Promise<MaterialContextView> {
        const context = await this.contextModel
            .findOneAndUpdate(
                {
                    scope: input.scope,
                    contextId: new Types.ObjectId(input.contextId),
                    materialId: new Types.ObjectId(input.materialId),
                },
                {
                    $set: {
                        title: input.title,
                        source: input.source,
                        studentId: new Types.ObjectId(input.studentId),
                    },
                    $setOnInsert: {
                        scope: input.scope,
                        contextId: new Types.ObjectId(input.contextId),
                        materialId: new Types.ObjectId(input.materialId),
                    },
                },
                { new: true, upsert: true },
            )
            .lean<MaterialContext & { _id: Types.ObjectId }>();

        return this.toView(context);
    }

    /**
     * Projeta um material oficial sem criar estado partilhado durante um GET.
     *
     * O identificador do material é estável e suficiente para a chave da UI.
     * Identidades individuais só são incluídas na vista docente; a projeção do
     * aluno não recebe `studentId` nem `teacherId`.
     */
    private toOfficialView(input: {
        subjectId: string;
        materialId: string;
        title: string;
        source: "teacher" | "class";
        teacherId?: string;
        createdAt?: Date;
    }): MaterialContextView {
        return {
            _id: input.materialId,
            scope: "OFFICIAL_SUBJECT",
            contextId: input.subjectId,
            materialId: input.materialId,
            title: input.title,
            source: input.source,
            ...(input.teacherId ? { teacherId: input.teacherId } : {}),
            createdAt: input.createdAt,
        };
    }

    /**
     * Mapeia o documento interno de contextos pedagógicos de materiais para uma forma pública estável e simples de consumir.
     *
     * @param context Valor de context usado pela função para executar to view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toView(
        context: MaterialContext & { _id: Types.ObjectId },
    ): MaterialContextView {
        return {
            _id: context._id.toString(),
            scope: context.scope,
            contextId: context.contextId.toString(),
            materialId: context.materialId.toString(),
            title: context.title,
            source: context.source,
            createdAt: context.createdAt,
            updatedAt: context.updatedAt,
        };
    }
}
