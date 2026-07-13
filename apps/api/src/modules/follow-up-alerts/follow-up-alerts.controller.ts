/**
 * Expõe alertas docentes de acompanhamento.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { NotifyFollowUpStudentDto } from "./dto/notify-follow-up-student.dto.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

@Controller("api/follow-up-alerts")
@UseGuards(SessionGuard)
export class FollowUpAlertsController {
    /**
     * Recebe as dependências injetadas de FollowUpAlertsController para manter alertas de acompanhamento testável e separado de detalhes externos.
     *
     * @param alertsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly alertsService: FollowUpAlertsService) {}

    /**
     * Obtém o resumo seguro de acompanhamento sem disparar notificações.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Regras com preview legível para a página docente de acompanhamento.
     */
    @Get("summary")
    summary(@Req() request: AuthenticatedRequest) {
        return this.alertsService.summary(request.user!);
    }

    /**
     * Obtém o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.alertsService.list(request.user!);
    }

    /**
     * Cria o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateFollowUpAlertRuleDto) {
        return this.alertsService.create(request.user!, body);
    }

    /**
     * Lista mini-testes oficiais minimizados de um aluno da turma do professor.
     *
     * @param request Pedido autenticado; a sessão define o professor real.
     * @param classId Turma que deve pertencer ao professor.
     * @param studentId Aluno que deve estar inscrito na turma.
     * @returns Testes publicados ou encerrados sem respostas nem soluções.
     */
    @Get("classes/:classId/students/:studentId/official-tests")
    listStudentOfficialTests(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Param("studentId") studentId: string,
    ) {
        return this.alertsService.listStudentOfficialTests(
            request.user!,
            classId,
            studentId,
        );
    }

    /**
     * Envia uma notificação de acompanhamento apenas ao aluno selecionado.
     *
     * @param request Pedido autenticado; a sessão define o professor real.
     * @param classId Turma que deve pertencer ao professor.
     * @param studentId Destinatário que deve estar inscrito na turma.
     * @param body Título e mensagem validados antes de chegarem ao domínio.
     * @returns Notificação com contagens efetivas e suprimidas.
     */
    @Post("classes/:classId/students/:studentId/notify")
    notifyStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Param("studentId") studentId: string,
        @Body() body: NotifyFollowUpStudentDto,
    ) {
        return this.alertsService.notifyStudent(
            request.user!,
            classId,
            studentId,
            body,
        );
    }

    /**
     * Executa o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param id Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post(":id/run")
    run(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.alertsService.run(request.user!, id);
    }
}
