/**
 * Implementa as regras de negócio de revisão docente de conteúdos IA e concentra validações do domínio.
 */
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    CreateAiContentReviewDto,
    DecideAiContentReviewDto,
} from "./dto/ai-content-review.dto.js";
import {
    AiContentReview,
    AiContentReviewDocument,
    AiContentReviewStatus,
    AiContentReviewType,
} from "./schemas/ai-content-review.schema.js";

/**
 * Vista pública de revisão docente de conteúdos IA, sem detalhes internos de Mongoose.
 */
export type AiContentReviewView = {
    _id: string;
    subjectId: string;
    materialId: string;
    teacherId: string;
    contentType: AiContentReviewType;
    contentJson: Record<string, unknown>;
    status: AiContentReviewStatus;
    teacherComment?: string;
    createdAt?: Date;
};

/**
 * Serviço de curadoria docente de conteúdos IA.
 */
@Injectable()
export class AiContentReviewsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param reviewModel Modelo Mongoose injetado para ler e persistir revisão docente de conteúdos IA.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     * @param officialMaterialsService Service injetado para reutilizar regras de materiais oficiais sem duplicar validações.
     */
    constructor(
        @InjectModel(AiContentReview.name)
        private readonly reviewModel: Model<AiContentReviewDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    /**
     * Cria revisão docente de conteúdos IA depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de revisão docente de conteúdos IA criado no formato público esperado pela UI ou pelo teste.
     */
    async create(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateAiContentReviewDto,
    ): Promise<AiContentReviewView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const material = await this.officialMaterialsService.findOwnedMaterial(
            actor.id,
            input.materialId,
        );
        if (material.subjectId !== subject._id) throw this.notFound();

        const review = await this.reviewModel.create({
            subjectId: new Types.ObjectId(subject._id),
            materialId: new Types.ObjectId(material._id),
            teacherId: new Types.ObjectId(actor.id),
            contentType: input.contentType,
            contentJson: input.contentJson,
            status: "PENDING",
        });
        return this.toView(review.toObject());
    }

    /**
     * Lista revisão docente de conteúdos IA já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de revisão docente de conteúdos IA visível para o contexto autorizado.
     */
    async listForSubject(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<AiContentReviewView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const reviews = await this.reviewModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        return reviews.map((review) => this.toView(review));
    }

    /**
     * Executa a operação decide no domínio de revisão docente de conteúdos IA com contrato explícito.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param reviewId Identificador de review que delimita ownership, membership ou relação de domínio.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Valor de revisão docente de conteúdos IA no contrato esperado pelo chamador.
     */
    async decide(
        actor: AuthenticatedUser,
        reviewId: string,
        input: DecideAiContentReviewDto,
    ): Promise<AiContentReviewView> {
        this.assertTeacher(actor);
        if (!Types.ObjectId.isValid(reviewId)) throw this.notFound();
        const review = await this.reviewModel
            .findOneAndUpdate(
                { _id: reviewId, teacherId: new Types.ObjectId(actor.id) },
                {
                    $set: {
                        status: input.status,
                        teacherComment: input.teacherComment?.trim(),
                    },
                },
                { new: true, runValidators: true },
            )
            .lean();
        if (!review) throw this.notFound();
        return this.toView(review);
    }

    /**
     * Executa a operação count approved by disciplina ids no domínio de revisão docente de conteúdos IA com contrato explícito.
     *
     * @param subjectIds Lista de identificadores de disciplina usados para filtrar o âmbito da operação.
     * @returns Valor de revisão docente de conteúdos IA no contrato esperado pelo chamador.
     */
    async countApprovedBySubjectIds(subjectIds: string[]): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.reviewModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status: "APPROVED",
        });
    }

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado que executa a operação.
     */
    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    /**
     * Constrói uma exceção de revisão docente de conteúdos IA com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "AI_CONTENT_REVIEW_NOT_FOUND",
            message: "Revisão de conteúdo não encontrada.",
        });
    }

    /**
     * Mapeia o documento interno de revisão docente de conteúdos IA para uma forma pública estável e simples de consumir.
     *
     * @param review review necessário para executar to view sem depender de estado global.
     * @returns Contrato público sem campos internos de persistência.
     */
    private toView(review: {
        _id: unknown;
        subjectId: unknown;
        materialId: unknown;
        teacherId: unknown;
        contentType: AiContentReviewType;
        contentJson: Record<string, unknown>;
        status: AiContentReviewStatus;
        teacherComment?: string;
        createdAt?: Date;
    }): AiContentReviewView {
        return {
            _id: String(review._id),
            subjectId: String(review.subjectId),
            materialId: String(review.materialId),
            teacherId: String(review.teacherId),
            contentType: review.contentType,
            contentJson: review.contentJson,
            status: review.status,
            teacherComment: review.teacherComment,
            createdAt: review.createdAt,
        };
    }
}
