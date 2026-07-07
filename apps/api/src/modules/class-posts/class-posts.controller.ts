/**
 * Expõe os endpoints HTTP de turma posts e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ClassPostsService } from "./class-posts.service.js";
import { CreateClassPostDto } from "./dto/create-class-post.dto.js";

/**
 * Controller de publicações por turma.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class ClassPostsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param classPostsService Service injetado para reutilizar regras de turma posts sem duplicar validações.
     */
    constructor(private readonly classPostsService: ClassPostsService) {}

    /**
     * Recebe o pedido de criação de publicações da turma e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de publicações da turma criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("teacher/classes/:classId/posts")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: CreateClassPostDto,
    ) {
        return this.classPostsService.createPost(request.user!, classId, body);
    }

    /**
     * Recebe o pedido de listagem de publicações da turma e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de publicações da turma visível para o contexto autorizado.
     */
    @Get("teacher/classes/:classId/posts")
    listTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.classPostsService.listTeacherPosts(request.user!, classId);
    }

    /**
     * Recebe o pedido de listagem de publicações da turma e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de publicações da turma visível para o contexto autorizado.
     */
    @Get("student/classes/:classId/posts")
    listStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.classPostsService.listStudentPosts(request.user!, classId);
    }
}
