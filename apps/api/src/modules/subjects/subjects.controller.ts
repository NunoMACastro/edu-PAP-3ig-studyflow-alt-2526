/**
 * Expõe os endpoints HTTP de subjects e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateSubjectDto } from "./dto/create-subject.dto.js";
import { ListSubjectStatusDto } from "./dto/list-subject-status.dto.js";
import { UpdateSubjectDto } from "./dto/update-subject.dto.js";
import { UpdateSubjectStatusDto } from "./dto/update-subject-status.dto.js";
import { SubjectsService } from "./subjects.service.js";

/**
 * Controller das disciplinas oficiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class SubjectsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     */
    constructor(private readonly subjectsService: SubjectsService) {}

    /**
     * Recebe o pedido de criação de disciplinas e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de disciplinas criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("teacher/classes/:classId/subjects")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: CreateSubjectDto,
    ) {
        return this.subjectsService.createSubject(request.user!, classId, body);
    }

    /**
     * Recebe o pedido de listagem de disciplinas e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de disciplinas visível para o contexto autorizado.
     */
    @Get("teacher/classes/:classId/subjects")
    list(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.subjectsService.listTeacherClassSubjects(request.user!, classId);
    }

    /** Atualiza uma disciplina ativa pertencente à turma indicada. */
    @Patch("teacher/classes/:classId/subjects/:subjectId")
    update(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Param("subjectId") subjectId: string,
        @Body() body: UpdateSubjectDto,
    ) {
        return this.subjectsService.updateSubject(
            request.user!,
            classId,
            subjectId,
            body,
        );
    }

    /** Arquiva ou restaura uma disciplina sem apagar o histórico. */
    @Patch("teacher/classes/:classId/subjects/:subjectId/status")
    updateStatus(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Param("subjectId") subjectId: string,
        @Body() body: UpdateSubjectStatusDto,
    ) {
        return this.subjectsService.updateSubjectStatus(
            request.user!,
            classId,
            subjectId,
            body,
        );
    }

    /**
     * Recebe o pedido de listagem de disciplinas e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de disciplinas visível para o contexto autorizado.
     */
    @Get("student/classes/:classId/subjects")
    listStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Query() query: ListSubjectStatusDto,
    ) {
        return this.subjectsService.listStudentClassSubjects(
            request.user!,
            classId,
            query.status ?? "ACTIVE",
        );
    }
}
