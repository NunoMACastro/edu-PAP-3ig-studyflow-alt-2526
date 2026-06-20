/**
 * Implementa as regras de negócio de testes oficiais e concentra validações do domínio.
 */
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import {
    OfficialTest,
    OfficialTestDocument,
    OfficialTestQuestion,
    OfficialTestStatus,
} from "./schemas/official-test.schema.js";

/**
 * Vista pública de testes oficiais, sem detalhes internos de Mongoose.
 */
export type OfficialTestView = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    description?: string;
    status: OfficialTestStatus;
    questions: OfficialTestQuestion[];
    createdAt?: Date;
};

/**
 * Serviço de testes oficiais por disciplina.
 */
@Injectable()
export class OfficialTestsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param testModel Modelo Mongoose injetado para ler e persistir testes oficiais.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     */
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly testModel: Model<OfficialTestDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Cria testes oficiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de testes oficiais criado no formato público esperado pela UI ou pelo teste.
     */
    async create(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateOfficialTestDto,
    ): Promise<OfficialTestView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const questions = input.questions.map((question) =>
            this.normalizeQuestion(question),
        );
        const test = await this.testModel.create({
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(subject.classId),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            description: input.description?.trim(),
            status: input.status ?? "DRAFT",
            questions,
        });
        return this.toView(test.toObject());
    }

    /**
     * Lista testes oficiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de testes oficiais visível para o contexto autorizado.
     */
    async listForTeacher(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<OfficialTestView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const tests = await this.testModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        return tests.map((test) => this.toView(test));
    }

    /**
     * Executa a operação count published by disciplina ids no domínio de testes oficiais com contrato explícito.
     *
     * @param subjectIds Lista de identificadores de disciplina usados para filtrar o âmbito da operação.
     * @returns Valor de testes oficiais no contrato esperado pelo chamador.
     */
    async countPublishedBySubjectIds(subjectIds: string[]): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.testModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status: "PUBLISHED",
        });
    }

    /**
     * Normaliza dados de testes oficiais para que validações e comparações usem sempre o mesmo formato.
     *
     * @param question Pergunta do aluno; é aparada e usada para construir contexto pedagógico controlado.
     * @returns Valor normalizado e seguro para ser usado pelo restante fluxo.
     */
    private normalizeQuestion(question: OfficialTestQuestion): OfficialTestQuestion {
        const options = question.options.map((option) => option.trim());
        if (new Set(options).size !== options.length || options.some((option) => !option)) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_TEST_OPTIONS",
                message: "Cada pergunta deve ter quatro opções distintas e preenchidas.",
            });
        }
        return {
            statement: question.statement.trim(),
            topic: question.topic?.trim(),
            options,
            correctOptionIndex: question.correctOptionIndex,
        };
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
     * Mapeia o documento interno de testes oficiais para uma forma pública estável e simples de consumir.
     *
     * @param test test necessário para executar to view sem depender de estado global.
     * @returns Contrato público sem campos internos de persistência.
     */
    private toView(test: {
        _id: unknown;
        subjectId: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        description?: string;
        status: OfficialTestStatus;
        questions: OfficialTestQuestion[];
        createdAt?: Date;
    }): OfficialTestView {
        return {
            _id: String(test._id),
            subjectId: String(test.subjectId),
            classId: String(test.classId),
            teacherId: String(test.teacherId),
            title: test.title,
            description: test.description,
            status: test.status,
            questions: test.questions,
            createdAt: test.createdAt,
        };
    }
}
