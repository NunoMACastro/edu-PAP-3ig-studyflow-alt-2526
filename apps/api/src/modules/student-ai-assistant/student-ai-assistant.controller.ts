/** Controller estrito e exclusivamente discente do Assistente de estudo. */
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Header,
    Headers,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import {
    AskStudentAiAssistantDto,
    CreateStudentAssistantArtifactDto,
    CreateStudentAiForkInvitationDto,
    CreateStudentAiConversationDto,
    ListStudentAiContextsDto,
    ListStudentAiConversationsDto,
    ListStudentAiMessagesDto,
    ListStudentAiForkInvitationsDto,
    ListStudentAiForkRecipientsDto,
    ListStudentAssistantArtifactJobsDto,
    ListStudentAssistantArtifactsDto,
    ListStudentAssistantArtifactTargetsDto,
    UpdateStudentAiConversationDto,
} from "./dto/student-ai-assistant.dto.js";
import { StudentAiAssistantService } from "./student-ai-assistant.service.js";
import { StudentAiAssistantArtifactsService } from "./student-ai-assistant-artifacts.service.js";
import { StudentAiConversationForksService } from "./student-ai-conversation-forks.service.js";
import { StudentAiContextResolverService } from "./student-ai-context-resolver.service.js";
import {
    STUDENT_ASSISTANT_CONTEXT_KINDS,
    type StudentAssistantContextKind,
} from "./student-ai-assistant.types.js";

@Controller("api/student/assistant")
@UseGuards(SessionGuard)
export class StudentAiAssistantController {
    constructor(
        private readonly assistantService: StudentAiAssistantService,
        private readonly artifactsService: StudentAiAssistantArtifactsService,
        private readonly forksService: StudentAiConversationForksService,
        private readonly contextResolver: StudentAiContextResolverService,
    ) {}

    @Get("contexts")
    @Header("Cache-Control", "private, no-store")
    listContexts(
        @Req() request: AuthenticatedRequest,
        @Query() query: ListStudentAiContextsDto,
    ) {
        return this.contextResolver.list(request.user!, query);
    }

    @Get("contexts/:kind/:contextId")
    @Header("Cache-Control", "private, no-store")
    getContext(
        @Req() request: AuthenticatedRequest,
        @Param("kind") kind: string,
        @Param("contextId") contextId: string,
    ) {
        return this.contextResolver.resolve(
            request.user!,
            this.parseKind(kind),
            contextId,
        );
    }

    @Get("conversations")
    @Header("Cache-Control", "private, no-store")
    listConversations(
        @Req() request: AuthenticatedRequest,
        @Query() query: ListStudentAiConversationsDto,
    ) {
        return this.assistantService.list(request.user!, query);
    }

    @Post("conversations")
    createConversation(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateStudentAiConversationDto,
    ) {
        return this.assistantService.create(request.user!, body);
    }

    @Get("conversations/:conversationId/fork-recipients")
    @Header("Cache-Control", "private, no-store")
    listForkRecipients(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Query() query: ListStudentAiForkRecipientsDto,
    ) {
        return this.forksService.listRecipients(request.user!, conversationId, query);
    }

    @Post("conversations/:conversationId/fork-invitations")
    createForkInvitation(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Body() body: CreateStudentAiForkInvitationDto,
    ) {
        return this.forksService.createInvitation(request.user!, conversationId, body);
    }

    @Get("fork-invitations")
    @Header("Cache-Control", "private, no-store")
    listForkInvitations(
        @Req() request: AuthenticatedRequest,
        @Query() query: ListStudentAiForkInvitationsDto,
    ) {
        return this.forksService.listInvitations(request.user!, query);
    }

    @Post("fork-invitations/:invitationId/accept")
    async acceptForkInvitation(
        @Req() request: AuthenticatedRequest,
        @Param("invitationId") invitationId: string,
    ) {
        const conversationId = await this.forksService.accept(
            request.user!,
            invitationId,
        );
        return this.assistantService.get(request.user!, conversationId);
    }

    @Post("fork-invitations/:invitationId/decline")
    declineForkInvitation(
        @Req() request: AuthenticatedRequest,
        @Param("invitationId") invitationId: string,
    ) {
        return this.forksService.decline(request.user!, invitationId);
    }

    @Delete("fork-invitations/:invitationId")
    cancelForkInvitation(
        @Req() request: AuthenticatedRequest,
        @Param("invitationId") invitationId: string,
    ) {
        return this.forksService.cancel(request.user!, invitationId);
    }

    @Get("conversations/:conversationId")
    @Header("Cache-Control", "private, no-store")
    getConversation(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
    ) {
        return this.assistantService.get(request.user!, conversationId);
    }

    @Patch("conversations/:conversationId")
    updateConversation(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Body() body: UpdateStudentAiConversationDto,
    ) {
        return this.assistantService.update(request.user!, conversationId, body);
    }

    @Delete("conversations/:conversationId")
    deleteConversation(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
    ) {
        return this.assistantService.delete(request.user!, conversationId);
    }

    @Get("conversations/:conversationId/messages")
    @Header("Cache-Control", "private, no-store")
    listMessages(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Query() query: ListStudentAiMessagesDto,
    ) {
        return this.assistantService.listMessages(request.user!, conversationId, query);
    }

    @Post("conversations/:conversationId/messages")
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Body() body: AskStudentAiAssistantDto,
    ) {
        return this.assistantService.ask(request.user!, conversationId, body);
    }

    @Get("conversations/:conversationId/artifacts")
    @Header("Cache-Control", "private, no-store")
    listArtifacts(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Query() query: ListStudentAssistantArtifactsDto,
    ) {
        return this.artifactsService.list(request.user!, conversationId, query);
    }

    @Get("conversations/:conversationId/artifact-setup")
    @Header("Cache-Control", "private, no-store")
    getArtifactSetup(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
    ) {
        return this.artifactsService.setup(request.user!, conversationId);
    }

    @Get("conversations/:conversationId/artifact-targets")
    @Header("Cache-Control", "private, no-store")
    listArtifactTargets(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Query() query: ListStudentAssistantArtifactTargetsDto,
    ) {
        return this.artifactsService.listTargets(
            request.user!,
            conversationId,
            query,
        );
    }

    @Post("conversations/:conversationId/artifacts")
    async generateArtifact(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Headers("idempotency-key") idempotencyKey: string | undefined,
        @Body() body: CreateStudentAssistantArtifactDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.artifactsService.generate(
            request.user!,
            conversationId,
            body,
            idempotencyKey,
        );
        response.status(result.status === "DONE" ? 201 : result.status === "FAILED" ? 200 : 202);
        return result;
    }

    @Get("conversations/:conversationId/artifact-jobs")
    @Header("Cache-Control", "private, no-store")
    listArtifactJobs(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Query() query: ListStudentAssistantArtifactJobsDto,
    ) {
        return this.artifactsService.listJobs(request.user!, conversationId, query);
    }

    @Get("conversations/:conversationId/artifact-jobs/:jobId")
    @Header("Cache-Control", "private, no-store")
    getArtifactJob(
        @Req() request: AuthenticatedRequest,
        @Param("conversationId") conversationId: string,
        @Param("jobId") jobId: string,
    ) {
        return this.artifactsService.getJob(request.user!, conversationId, jobId);
    }

    private parseKind(kind: string): StudentAssistantContextKind {
        if (!STUDENT_ASSISTANT_CONTEXT_KINDS.includes(kind as StudentAssistantContextKind)) {
            throw new BadRequestException({
                code: "ASSISTANT_CONTEXT_INVALID",
                message: "O contexto indicado não é válido.",
            });
        }
        return kind as StudentAssistantContextKind;
    }
}
