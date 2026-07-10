/**
 * Implementa as regras de negócio de turma progress e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiContentReviewsService } from "../ai-content-reviews/ai-content-reviews.service.js";
import { ClassPostsService } from "../class-posts/class-posts.service.js";
import { ClassesService } from "../classes/classes.service.js";
import { OfficialTestsService } from "../official-tests/official-tests.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { CreateClassProgressNoteDto } from "./dto/class-progress-note.dto.js";
import {
    ClassProgressNote,
    ClassProgressNoteDocument,
} from "./schemas/class-progress-note.schema.js";

/**
 * Vista pública de progresso da turma, sem detalhes internos de Mongoose.
 */
export type ClassProgressNoteView = {
    _id: string;
    classId: string;
    teacherId: string;
    title: string;
    note: string;
    difficultyTags: string[];
    createdAt?: Date;
};

export const CLASS_PROGRESS_ACTIVITY_BASIS = "ACTIVITY_SIGNALS" as const;
export const CLASS_PROGRESS_LEARNING_STATUS =
    "PENDING_RESULTS_CONTRACT" as const;

/**
 * Serviço de métricas docentes agregadas da turma.
 */
@Injectable()
export class ClassProgressService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param noteModel Modelo Mongoose injetado para ler e persistir progresso da turma.
     * @param classesService Service injetado para reutilizar regras de turmas sem duplicar validações.
     * @param postsService Service injetado para reutilizar regras de posts sem duplicar validações.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     * @param testsService Service injetado para reutilizar regras de tests sem duplicar validações.
     * @param reviewsService Service injetado para reutilizar regras de reviews sem duplicar validações.
     */
    constructor(
        @InjectModel(ClassProgressNote.name)
        private readonly noteModel: Model<ClassProgressNoteDocument>,
        private readonly classesService: ClassesService,
        private readonly postsService: ClassPostsService,
        private readonly subjectsService: SubjectsService,
        private readonly testsService: OfficialTestsService,
        private readonly reviewsService: AiContentReviewsService,
    ) {}

    /**
     * Carrega progresso da turma no formato necessário ao próximo passo do fluxo.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Entidade de progresso da turma já filtrada pelo contexto recebido.
     */
    async getClassProgress(actor: AuthenticatedUser, classId: string) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }

        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const subjects = await this.subjectsService.listTeacherClassSubjects(
            actor,
            classId,
        );
        const subjectIds = subjects.map((subject) => subject._id);
        const [publishedTestsCount, approvedAiContentCount, postCount, notes] =
            await Promise.all([
                this.testsService.countPublishedBySubjectIds(subjectIds),
                this.reviewsService.countApprovedBySubjectIds(subjectIds),
                this.postsService.countByClassId(schoolClass._id),
                this.noteModel
                    .find({ classId: new Types.ObjectId(schoolClass._id) })
                    .sort({ createdAt: -1 })
                    .lean(),
            ]);
        const difficultyTags = Array.from(
            new Set(notes.flatMap((note) => note.difficultyTags ?? [])),
        );
        const activitySignalTotal =
            publishedTestsCount + approvedAiContentCount + postCount + notes.length;
        const activityCoveragePercent = Math.min(100, activitySignalTotal * 10);

        return {
            classId: schoolClass._id,
            className: schoolClass.name,
            studentsCount: schoolClass.studentIds.length,
            subjectsCount: subjects.length,
            publishedTestsCount,
            approvedAiContentCount,
            postCount,
            noteCount: notes.length,
            learningProgressPercent: null,
            learningProgressStatus: CLASS_PROGRESS_LEARNING_STATUS,
            activitySignalTotal,
            activityCoveragePercent,
            metricsBasis: CLASS_PROGRESS_ACTIVITY_BASIS,
            difficultyTags,
            notes: notes.map((note) => this.toNoteView(note)),
            gaps: [
                "O progresso de aprendizagem por submissoes/resultados ainda nao tem contrato de dados nesta macrofase; os indicadores apresentados sao sinais de acompanhamento docente.",
            ],
        };
    }

    /**
     * Cria progresso da turma depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async createNote(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateClassProgressNoteDto,
    ): Promise<ClassProgressNoteView> {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const difficultyTags = (input.difficultyTags ?? [])
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 12);
        const note = await this.noteModel.create({
            classId: new Types.ObjectId(schoolClass._id),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            note: input.note.trim(),
            difficultyTags,
        });
        return this.toNoteView(note.toObject());
    }

    /**
     * Mapeia o documento interno de progresso da turma para uma forma pública estável e simples de consumir.
     *
     * @param note Valor de note usado pela função para executar to note view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toNoteView(note: {
        _id: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        note: string;
        difficultyTags?: string[];
        createdAt?: Date;
    }): ClassProgressNoteView {
        return {
            _id: String(note._id),
            classId: String(note.classId),
            teacherId: String(note.teacherId),
            title: note.title,
            note: note.note,
            difficultyTags: note.difficultyTags ?? [],
            createdAt: note.createdAt,
        };
    }
}
