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
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param subjectId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param reviewId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    async countApprovedBySubjectIds(subjectIds: string[]): Promise<number> {
        return this.countBySubjectIdsAndStatus(subjectIds, "APPROVED");
    }

    /**
     * Conta revisões IA pendentes por disciplinas já autorizadas pelo chamador.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @returns Número de revisões pendentes.
     */
    async countPendingBySubjectIds(subjectIds: string[]): Promise<number> {
        return this.countBySubjectIdsAndStatus(subjectIds, "PENDING");
    }

    /**
     * Conta revisões IA pendentes por disciplina já autorizada pelo chamador.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @returns Mapa subjectId -> número de revisões IA pendentes.
     */
    async countPendingBySubjectIdsGrouped(
        subjectIds: string[],
    ): Promise<Record<string, number>> {
        return this.countBySubjectIdsAndStatusGrouped(subjectIds, "PENDING");
    }

    /**
     * Conta revisões IA por estado sem repetir filtros de Mongoose.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @param status Estado da revisão a contar.
     * @returns Número de revisões no estado pedido.
     */
    private async countBySubjectIdsAndStatus(
        subjectIds: string[],
        status: AiContentReviewStatus,
    ): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.reviewModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status,
        });
    }

    /**
     * Conta revisões IA por estado e por disciplina sem expor conteúdo revisto.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @param status Estado da revisão a contar.
     * @returns Mapa subjectId -> número de revisões no estado pedido.
     */
    private async countBySubjectIdsAndStatusGrouped(
        subjectIds: string[],
        status: AiContentReviewStatus,
    ): Promise<Record<string, number>> {
        if (subjectIds.length === 0) return {};
        const rows = await this.reviewModel.aggregate<{
            _id: Types.ObjectId;
            count: number;
        }>([
            {
                $match: {
                    subjectId: {
                        $in: subjectIds.map((id) => new Types.ObjectId(id)),
                    },
                    status,
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
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
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
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param review Valor de review usado pela função para executar to view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
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
