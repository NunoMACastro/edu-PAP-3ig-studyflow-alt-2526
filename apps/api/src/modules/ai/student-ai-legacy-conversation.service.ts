/**
 * Liga escritas dos endpoints anteriores a uma conversa de compatibilidade,
 * sem alterar os DTOs públicos nem transferir metadata para o cliente.
 */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    StudentAiConversation,
    type StudentAiConversationDocument,
} from "../student-ai-assistant/schemas/student-ai-conversation.schema.js";
import type { StudentAssistantContextKind } from "../student-ai-assistant/student-ai-assistant.types.js";

@Injectable()
export class StudentAiLegacyConversationService {
    constructor(
        @InjectModel(StudentAiConversation.name)
        private readonly conversationModel: Model<StudentAiConversationDocument>,
    ) {}

    /** Cria ou reutiliza o agrupamento interno para uma escrita legacy autorizada pelo domínio. */
    async ensure(input: {
        studentId: string;
        contextKind: StudentAssistantContextKind;
        contextId: string;
        label: string;
        secondaryLabel?: string;
    }): Promise<string> {
        const legacyGroupKey = [
            "legacy-api",
            input.contextKind,
            input.studentId,
            input.contextId,
        ].join(":");
        const now = new Date();
        const conversation = await this.conversationModel.findOneAndUpdate(
            { legacyGroupKey },
            {
                $setOnInsert: {
                    studentId: new Types.ObjectId(input.studentId),
                    contextKind: input.contextKind,
                    contextId: new Types.ObjectId(input.contextId),
                    contextLabelSnapshot: input.label,
                    contextSecondaryLabelSnapshot: input.secondaryLabel,
                    title: "Conversa da versão anterior",
                    status: "DRAFT",
                    origin: "LEGACY_API",
                    readOnly: false,
                    draftExpiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        return String(conversation._id);
    }

    /** Torna o agrupamento visível apenas depois de existir uma resposta persistida. */
    async markAnswered(conversationId: string, at = new Date()): Promise<void> {
        await this.conversationModel.updateOne(
            { _id: new Types.ObjectId(conversationId), origin: "LEGACY_API" },
            {
                $set: { status: "ACTIVE", lastMessageAt: at },
                $unset: { draftExpiresAt: 1 },
            },
        );
    }
}
