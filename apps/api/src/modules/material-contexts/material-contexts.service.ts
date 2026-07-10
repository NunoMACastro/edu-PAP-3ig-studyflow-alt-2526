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
type MaterialContextInput = {
    scope: MaterialContextScope;
    contextId: string;
    materialId: string;
    title: string;
    source: "student" | "teacher" | "class";
    studentId?: string;
    teacherId?: string;
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
            const { subject } = await this.subjectsService.findSubjectForStudent(
                actor.id,
                subjectId,
            );
            const materials =
                await this.officialMaterialsService.findProcessedBySubject(
                    subject._id,
                );
            const contexts = await Promise.all(
                materials.map((material) =>
                    this.upsertContext({
                        scope: "OFFICIAL_SUBJECT",
                        contextId: subject._id,
                        materialId: material._id,
                        title: material.title,
                        source: "class",
                        studentId: actor.id,
                        teacherId: material.teacherId,
                    }),
                ),
            );
            return {
                context: "OFFICIAL_SUBJECT",
                subjectId: subject._id,
                materials: contexts,
                contexts,
            };
        }
        if (actor.role === "TEACHER") {
            const subject = await this.subjectsService.findOwnedSubject(
                actor.id,
                subjectId,
            );
            const materials =
                await this.officialMaterialsService.listTeacherSubjectMaterials(
                    actor,
                    subject._id,
                );
            const contexts = await Promise.all(
                materials.map((material) =>
                    this.upsertContext({
                        scope: "OFFICIAL_SUBJECT",
                        contextId: subject._id,
                        materialId: material._id,
                        title: material.title,
                        source: "teacher",
                        teacherId: actor.id,
                    }),
                ),
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
        input: MaterialContextInput,
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
                        studentId: input.studentId
                            ? new Types.ObjectId(input.studentId)
                            : undefined,
                        teacherId: input.teacherId
                            ? new Types.ObjectId(input.teacherId)
                            : undefined,
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
            studentId: context.studentId?.toString(),
            teacherId: context.teacherId?.toString(),
            createdAt: context.createdAt,
            updatedAt: context.updatedAt,
        };
    }
}
