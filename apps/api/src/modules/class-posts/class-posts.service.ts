/**
 * Implementa as regras de negócio de turma posts e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { CreateClassPostDto } from "./dto/create-class-post.dto.js";
import { ClassPost, ClassPostDocument, ClassPostType } from "./schemas/class-post.schema.js";

/**
 * Vista pública de publicações da turma, sem detalhes internos de Mongoose.
 */
export type ClassPostView = {
    _id: string;
    classId: string;
    teacherId: string | null;
    type: ClassPostType;
    title: string | null;
    body: string | null;
    tombstoned: boolean;
    tombstonedAt?: Date;
    createdAt?: Date;
};

/**
 * Serviço de avisos e publicações oficiais.
 */
@Injectable()
export class ClassPostsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param postModel Modelo Mongoose injetado para ler e persistir publicações da turma.
     * @param classesService Service injetado para reutilizar regras de turmas sem duplicar validações.
     */
    constructor(
        @InjectModel(ClassPost.name)
        private readonly postModel: Model<ClassPostDocument>,
        private readonly classesService: ClassesService,
    ) {}

    /**
     * Cria publicações da turma depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async createPost(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateClassPostDto,
    ): Promise<ClassPostView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const post = await this.postModel.create({
            classId: new Types.ObjectId(schoolClass._id),
            teacherId: new Types.ObjectId(actor.id),
            type: input.type,
            title: input.title.trim(),
            body: input.body.trim(),
        });
        return this.toPostView(post.toObject());
    }

    /**
     * Lista publicações da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de publicações da turma visível para o contexto autorizado.
     */
    async listTeacherPosts(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<ClassPostView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        return this.listByClass(schoolClass._id);
    }

    /**
     * Lista publicações da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de publicações da turma visível para o contexto autorizado.
     */
    async listStudentPosts(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<ClassPostView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            actor.id,
            classId,
        );
        return this.listByClass(schoolClass._id);
    }

    /**
     * Conta publicações de uma turma já validada.
     *
     * @param classId Identificador da turma.
     * @returns Número de publicações.
     */
    async countByClassId(classId: string): Promise<number> {
        return this.postModel.countDocuments({
            classId: new Types.ObjectId(classId),
        });
    }

    /**
     * Lista publicações da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de publicações da turma visível para o contexto autorizado.
     */
    private async listByClass(classId: string): Promise<ClassPostView[]> {
        const posts = await this.postModel
            .find({ classId: new Types.ObjectId(classId) })
            .sort({ createdAt: -1 })
            .lean();
        return posts.map((post) => this.toPostView(post));
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
     * Mapeia o documento interno de publicações da turma para uma forma pública estável e simples de consumir.
     *
     * @param post Valor de post usado pela função para executar to post view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toPostView(post: {
        _id: unknown;
        classId: unknown;
        teacherId?: unknown;
        type: ClassPostType;
        title?: string;
        body?: string;
        createdAt?: Date;
        tombstonedAt?: Date;
    }): ClassPostView {
        return {
            _id: String(post._id),
            classId: String(post.classId),
            teacherId: post.teacherId ? String(post.teacherId) : null,
            type: post.type,
            title: post.title ?? null,
            body: post.body ?? null,
            tombstoned: Boolean(post.tombstonedAt),
            tombstonedAt: post.tombstonedAt,
            createdAt: post.createdAt,
        };
    }
}
