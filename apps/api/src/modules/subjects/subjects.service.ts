/**
 * Implementa as regras de negócio de subjects e concentra validações do domínio.
 */
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { isMongoDuplicateKeyError } from "../../common/utils/mongo-error.util.js";
import { ClassesService, SchoolClassView } from "../classes/classes.service.js";
import { CreateSubjectDto } from "./dto/create-subject.dto.js";
import { Subject, SubjectDocument } from "./schemas/subject.schema.js";

/**
 * Vista pública de disciplinas, sem detalhes internos de Mongoose.
 */
export type SubjectView = {
    _id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
    description?: string;
    createdAt?: Date;
};

/**
 * Serviço de disciplinas oficiais.
 */
@Injectable()
export class SubjectsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param subjectModel Modelo Mongoose injetado para ler e persistir disciplinas.
     * @param classesService Service injetado para reutilizar regras de turmas sem duplicar validações.
     */
    constructor(
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    /**
     * Cria disciplinas depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async createSubject(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateSubjectDto,
    ): Promise<SubjectView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const normalizedName = input.name.trim();
        const existing = await this.subjectModel
            .findOne({
                classId: new Types.ObjectId(schoolClass._id),
                name: normalizedName,
            })
            .lean();
        if (existing) throw this.duplicatedName();

        try {
            const subject = await this.subjectModel.create({
                classId: new Types.ObjectId(schoolClass._id),
                teacherId: new Types.ObjectId(actor.id),
                name: normalizedName,
                code: input.code.trim().toUpperCase(),
                description: input.description?.trim(),
            });
            return this.toSubjectView(subject.toObject());
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) {
                throw this.duplicatedName();
            }
            throw error;
        }
    }

    /**
     * Lista disciplinas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de disciplinas visível para o contexto autorizado.
     */
    async listTeacherClassSubjects(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<SubjectView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const subjects = await this.subjectModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ name: 1 })
            .lean();
        return subjects.map((subject) => this.toSubjectView(subject));
    }

    /**
     * Lista disciplinas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de disciplinas visível para o contexto autorizado.
     */
    async listStudentClassSubjects(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<SubjectView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            actor.id,
            classId,
        );
        const subjects = await this.subjectModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ name: 1 })
            .lean();
        return subjects.map((subject) => this.toSubjectView(subject));
    }

    /**
     * Procura disciplinas com filtros de ownership, membership ou estado para evitar leituras indevidas.
     *
     * @param teacherId Identificador de teacher que delimita ownership, membership ou relação de domínio.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Entidade de disciplinas já filtrada pelo contexto recebido.
     */
    async findOwnedSubject(
        teacherId: string,
        subjectId: string,
    ): Promise<SubjectView> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        const subject = await this.subjectModel
            .findOne({
                _id: subjectId,
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!subject) throw this.subjectNotFound();
        return this.toSubjectView(subject);
    }

    /**
     * Obtém uma disciplina se o aluno estiver inscrito na turma respetiva.
     *
     * @param studentId Aluno autenticado.
     * @param subjectId Disciplina pedida.
     * @returns Disciplina e turma associada.
     */
    async findSubjectForStudent(
        studentId: string,
        subjectId: string,
    ): Promise<{ subject: SubjectView; schoolClass: SchoolClassView }> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        const subject = await this.subjectModel.findById(subjectId).lean();
        if (!subject) throw this.subjectNotFound();
        const subjectView = this.toSubjectView(subject);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            studentId,
            subjectView.classId,
        );
        return { subject: subjectView, schoolClass };
    }

    /**
     * Executa a operação disciplina not found no domínio de disciplinas com contrato explícito.
     *
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private subjectNotFound(): NotFoundException {
        return new NotFoundException({
            code: "SUBJECT_NOT_FOUND",
            message: "Disciplina não encontrada.",
        });
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

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    /**
     * Constrói uma exceção de disciplinas com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private duplicatedName(): ConflictException {
        return new ConflictException({
            code: "SUBJECT_NAME_DUPLICATED",
            message: "Já existe uma disciplina com esse nome nesta turma.",
        });
    }

    /**
     * Mapeia o documento interno de disciplinas para uma forma pública estável e simples de consumir.
     *
     * @param subject Valor de subject usado pela função para executar to subject view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toSubjectView(subject: {
        _id: unknown;
        classId: unknown;
        teacherId: unknown;
        name: string;
        code: string;
        description?: string;
        createdAt?: Date;
    }): SubjectView {
        return {
            _id: String(subject._id),
            classId: String(subject.classId),
            teacherId: String(subject.teacherId),
            name: subject.name,
            code: subject.code,
            description: subject.description,
            createdAt: subject.createdAt,
        };
    }
}
