/** DTOs estritos da API unificada do Assistente de estudo. */
import { Type } from "class-transformer";
import {
    IsIn,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from "class-validator";
import { STUDENT_ASSISTANT_CONTEXT_KINDS } from "../student-ai-assistant.types.js";
import { STUDENT_ASSISTANT_ARTIFACT_TYPES } from "../student-ai-assistant.types.js";
import { AI_ARTIFACT_TARGET_KINDS } from "../../ai/ai-artifact-generation.types.js";

export class StudentAssistantContextInputDto {
    @IsIn(STUDENT_ASSISTANT_CONTEXT_KINDS)
    kind!: (typeof STUDENT_ASSISTANT_CONTEXT_KINDS)[number];

    @IsMongoId()
    id!: string;
}

export class CreateStudentAiConversationDto {
    @ValidateNested()
    @Type(() => StudentAssistantContextInputDto)
    context!: StudentAssistantContextInputDto;
}

export class UpdateStudentAiConversationDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    title?: string;

    @IsOptional()
    @IsIn(["ACTIVE", "ARCHIVED"])
    status?: "ACTIVE" | "ARCHIVED";
}

export class AskStudentAiAssistantDto {
    @IsString()
    @MinLength(4)
    @MaxLength(1000)
    question!: string;
}

export class ListStudentAiContextsDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    query?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class ListStudentAiConversationsDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;

    @IsOptional()
    @IsIn(STUDENT_ASSISTANT_CONTEXT_KINDS)
    contextKind?: (typeof STUDENT_ASSISTANT_CONTEXT_KINDS)[number];

    @IsOptional()
    @IsMongoId()
    contextId?: string;

    @IsOptional()
    @IsIn(["ACTIVE", "ARCHIVED"])
    status?: "ACTIVE" | "ARCHIVED";
}

export class ListStudentAiMessagesDto {
    @IsOptional()
    @IsMongoId()
    before?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

/** Pedido dirigido a um membro já autorizado do mesmo contexto colaborativo. */
export class CreateStudentAiForkInvitationDto {
    @IsMongoId()
    recipientId!: string;
}

/** Pesquisa paginada de destinatários elegíveis para um fork. */
export class ListStudentAiForkRecipientsDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    query?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

/** Lista apenas convites pendentes recebidos ou enviados. */
export class ListStudentAiForkInvitationsDto {
    @IsIn(["received", "sent"])
    direction!: "received" | "sent";

    @IsOptional()
    @IsMongoId()
    conversationId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class StudentAssistantArtifactTargetDto {
    @IsIn(AI_ARTIFACT_TARGET_KINDS)
    kind!: (typeof AI_ARTIFACT_TARGET_KINDS)[number];

    @IsMongoId()
    id!: string;
}

export class CreateStudentAssistantArtifactDto {
    @IsIn(STUDENT_ASSISTANT_ARTIFACT_TYPES)
    type!: (typeof STUDENT_ASSISTANT_ARTIFACT_TYPES)[number];

    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => StudentAssistantArtifactTargetDto)
    target?: StudentAssistantArtifactTargetDto;
}

export class ListStudentAssistantArtifactTargetsDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    query?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class ListStudentStudyMaterialsDto {
    @IsOptional()
    @IsIn(AI_ARTIFACT_TARGET_KINDS)
    targetKind?: (typeof AI_ARTIFACT_TARGET_KINDS)[number];

    @IsOptional()
    @IsMongoId()
    targetId?: string;

    @IsOptional()
    @IsIn(STUDENT_ASSISTANT_ARTIFACT_TYPES)
    type?: (typeof STUDENT_ASSISTANT_ARTIFACT_TYPES)[number];

    @IsOptional()
    @IsIn(["ACTIVE", "READ_ONLY_ARCHIVED"])
    state?: "ACTIVE" | "READ_ONLY_ARCHIVED";

    @IsOptional()
    @IsString()
    @MaxLength(500)
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class ListStudentAssistantArtifactsDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    before?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class ListStudentAssistantArtifactJobsDto {
    @IsOptional()
    @IsIn(["ACTIVE"])
    status?: "ACTIVE";

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    limit?: number;
}
