/**
 * Expõe os endpoints HTTP de planeamento de projetos com IA e delega regras de negócio para o service.
 */
import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateProjectAiPlanDto } from "./dto/create-project-ai-plan.dto.js";
import { ProjectAiService } from "./project-ai.service.js";

/**
 * Endpoints de apoio IA gradual para projectos.
 */
@Controller("api/student/projects/:projectId/ai-plans")
@UseGuards(SessionGuard)
export class ProjectAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param projectAiService Service injetado para reutilizar regras de planeamento de projetos com IA sem duplicar validações.
     */
    constructor(private readonly projectAiService: ProjectAiService) {}

    /**
     * Recebe o pedido de criação de planeamento de projetos com IA e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param projectId Identificador de project que delimita ownership, membership ou relação de domínio.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de planeamento de projetos com IA criado no formato público esperado pela UI ou pelo teste.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("projectId") projectId: string,
        @Body() body: CreateProjectAiPlanDto,
    ) {
        return this.projectAiService.createPlan(request.user!, projectId, body);
    }
}
