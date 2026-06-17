/**
 * Expõe os endpoints HTTP de classes e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ClassesService } from "./classes.service.js";
import { AddClassStudentDto } from "./dto/add-class-student.dto.js";
import { CreateClassDto } from "./dto/create-class.dto.js";

/**
 * Controller de turmas oficiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class ClassesController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param classesService Service injetado para reutilizar regras de turmas sem duplicar validações.
     */
    constructor(private readonly classesService: ClassesService) {}

    /**
     * Recebe o pedido de criação de turmas e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de turmas criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("teacher/classes")
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateClassDto) {
        return this.classesService.createClass(request.user!, body);
    }

    /**
     * Recebe o pedido de listagem de turmas e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @returns Coleção de turmas visível para o contexto autorizado.
     */
    @Get("teacher/classes")
    listTeacher(@Req() request: AuthenticatedRequest) {
        return this.classesService.listTeacherClasses(request.user!);
    }

    /**
     * Executa a operação add student no domínio de turmas com contrato explícito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Valor de turmas no contrato esperado pelo chamador.
     */
    @Post("teacher/classes/:classId/students")
    addStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: AddClassStudentDto,
    ) {
        return this.classesService.addStudent(request.user!, classId, body);
    }

    /**
     * Recebe o pedido de listagem de turmas e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @returns Coleção de turmas visível para o contexto autorizado.
     */
    @Get("student/classes")
    listStudent(@Req() request: AuthenticatedRequest) {
        return this.classesService.listStudentClasses(request.user!);
    }
}
