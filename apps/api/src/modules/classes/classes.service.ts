/**
 * Implementa as regras de negócio de classes e concentra validações do domínio.
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
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { AddClassStudentDto } from "./dto/add-class-student.dto.js";
import { CreateClassDto } from "./dto/create-class.dto.js";
import { SchoolClass, SchoolClassDocument } from "./schemas/school-class.schema.js";

/**
 * Vista pública de turmas, sem detalhes internos de Mongoose.
 */
export type SchoolClassView = {
    _id: string;
    teacherId: string;
    name: string;
    code: string;
    schoolYear: string;
    studentIds: string[];
    createdAt?: Date;
};

/**
 * Serviço de turmas oficiais.
 */
@Injectable()
export class ClassesService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param classModel Modelo Mongoose injetado para ler e persistir turmas.
     * @param userModel Modelo Mongoose injetado para ler e persistir turmas.
     */
    constructor(
        @InjectModel(SchoolClass.name)
        private readonly classModel: Model<SchoolClassDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    /**
     * Cria turmas depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de turmas criado no formato público esperado pela UI ou pelo teste.
     */
    async createClass(
        actor: AuthenticatedUser,
        input: CreateClassDto,
    ): Promise<SchoolClassView> {
        this.assertTeacher(actor);
        try {
            const schoolClass = await this.classModel.create({
                teacherId: new Types.ObjectId(actor.id),
                name: input.name.trim(),
                code: input.code.trim().toUpperCase(),
                schoolYear: input.schoolYear.trim(),
                studentIds: [],
            });
            return this.toClassView(schoolClass.toObject());
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) {
                throw this.duplicatedCode();
            }
            throw error;
        }
    }

    /**
     * Lista turmas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @returns Coleção de turmas visível para o contexto autorizado.
     */
    async listTeacherClasses(actor: AuthenticatedUser): Promise<SchoolClassView[]> {
        this.assertTeacher(actor);
        const classes = await this.classModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return classes.map((schoolClass) => this.toClassView(schoolClass));
    }

    /**
     * Executa a operação add student no domínio de turmas com contrato explícito.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Valor de turmas no contrato esperado pelo chamador.
     */
    async addStudent(
        actor: AuthenticatedUser,
        classId: string,
        input: AddClassStudentDto,
    ): Promise<SchoolClassView> {
        this.assertTeacher(actor);
        await this.findOwnedClass(actor.id, classId);

        const student = await this.userModel
            .findOne({ email: input.email.trim().toLowerCase(), role: "STUDENT" })
            .lean();
        if (!student) {
            throw new NotFoundException({
                code: "CLASS_STUDENT_NOT_FOUND",
                message: "Aluno não encontrado.",
            });
        }

        const updated = await this.classModel
            .findOneAndUpdate(
                {
                    _id: classId,
                    teacherId: new Types.ObjectId(actor.id),
                },
                { $addToSet: { studentIds: student._id } },
                { new: true, runValidators: true },
            )
            .lean();

        if (!updated) throw this.classNotFound();
        return this.toClassView(updated);
    }

    /**
     * Lista turmas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @returns Coleção de turmas visível para o contexto autorizado.
     */
    async listStudentClasses(actor: AuthenticatedUser): Promise<SchoolClassView[]> {
        this.assertStudent(actor);
        const classes = await this.classModel
            .find({ studentIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return classes.map((schoolClass) => this.toClassView(schoolClass));
    }

    /**
     * Obtém turma pertencente ao professor.
     *
     * @param teacherId Professor autenticado.
     * @param classId Turma a validar.
     * @returns Turma pública.
     */
    async findOwnedClass(
        teacherId: string,
        classId: string,
    ): Promise<SchoolClassView> {
        if (!Types.ObjectId.isValid(classId)) throw this.classNotFound();
        const schoolClass = await this.classModel
            .findOne({
                _id: classId,
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!schoolClass) throw this.classNotFound();
        return this.toClassView(schoolClass);
    }

    /**
     * Confirma inscrição do aluno numa turma.
     *
     * @param studentId Aluno autenticado.
     * @param classId Turma a validar.
     * @returns Turma pública.
     */
    async ensureStudentEnrollment(
        studentId: string,
        classId: string,
    ): Promise<SchoolClassView> {
        if (!Types.ObjectId.isValid(classId)) throw this.classNotFound();
        const schoolClass = await this.classModel
            .findOne({
                _id: classId,
                studentIds: new Types.ObjectId(studentId),
            })
            .lean();
        if (!schoolClass) {
            throw new ForbiddenException({
                code: "CLASS_ENROLLMENT_REQUIRED",
                message: "Não estás inscrito nesta turma.",
            });
        }
        return this.toClassView(schoolClass);
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
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado que executa a operação.
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
     * Executa a operação turma not found no domínio de turmas com contrato explícito.
     * @returns Valor de turmas no contrato esperado pelo chamador.
     */
    private classNotFound(): NotFoundException {
        return new NotFoundException({
            code: "CLASS_NOT_FOUND",
            message: "Turma não encontrada.",
        });
    }

    /**
     * Constrói uma exceção de turmas com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private duplicatedCode(): ConflictException {
        return new ConflictException({
            code: "CLASS_CODE_DUPLICATED",
            message: "Já tens uma turma com esse código.",
        });
    }

    /**
     * Mapeia o documento interno de turmas para uma forma pública estável e simples de consumir.
     *
     * @param schoolClass school turma necessário para executar to turma view sem depender de estado global.
     * @returns Contrato público sem campos internos de persistência.
     */
    private toClassView(schoolClass: {
        _id: unknown;
        teacherId: unknown;
        name: string;
        code: string;
        schoolYear: string;
        studentIds: unknown[];
        createdAt?: Date;
    }): SchoolClassView {
        return {
            _id: String(schoolClass._id),
            teacherId: String(schoolClass.teacherId),
            name: schoolClass.name,
            code: schoolClass.code,
            schoolYear: schoolClass.schoolYear,
            studentIds: schoolClass.studentIds.map((studentId) => String(studentId)),
            createdAt: schoolClass.createdAt,
        };
    }
}
