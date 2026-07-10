/**
 * Expõe os endpoints HTTP de classes e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
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
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
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
     * Remove a associação entre um aluno e uma turma do professor autenticado.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param classId Identificador da turma que deve pertencer ao professor autenticado.
     * @param studentId Identificador do aluno a desassociar da turma.
     * @returns Turma atualizada no contrato público usado pela UI.
     */
    @Delete("teacher/classes/:classId/students/:studentId")
    removeStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Param("studentId") studentId: string,
    ) {
        return this.classesService.removeStudent(request.user!, classId, studentId);
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
