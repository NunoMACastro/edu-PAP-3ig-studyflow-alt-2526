/**
 * Registry central de dados pessoais, exportação e apagamento coordenado.
 *
 * A lista é deliberadamente explícita: adicionar um model sem uma política
 * correspondente faz a validação falhar em vez de o omitir silenciosamente.
 */
import {
    Injectable,
    InternalServerErrorException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { createHash, randomUUID } from "node:crypto";
import type { ReadStream } from "node:fs";
import { chmod, mkdtemp, open, rm, stat, statfs } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Types } from "mongoose";
import type { ClientSession, Connection, Model } from "mongoose";
import {
    MaterialStorageService,
    StorageDeleteOperation,
} from "../materials/material-storage.service.js";
import {
    PersonalDataRetention,
    PersonalDataRetentionDocument,
} from "./schemas/personal-data-retention.schema.js";

export const PERSONAL_DATA_REGISTRY_VERSION = "2026-07-14.1";
export const PERSONAL_DATA_RETENTION_DAYS = 90;
const MAX_EXPORT_BYTES = 384 * 1024 * 1024;
const MIN_EXPORT_FREE_BYTES = MAX_EXPORT_BYTES + 128 * 1024 * 1024;

type RegistryPolicy =
    | "DELETE"
    | "ANONYMIZE"
    | "TOMBSTONE"
    | "RETAIN_RECEIPT_90_DAYS"
    | "RETAIN_NONPERSONAL"
    | "ACCOUNT_LIFECYCLE"
    | "GLOBAL_CONFIGURATION"
    | "INTERNAL_RETENTION";

type RegistryRule = {
    model: string;
    policy: RegistryPolicy;
    scalarFields?: readonly string[];
    membershipFields?: readonly string[];
    /** Referências de autoria a anonimizar sem eliminar o registo principal. */
    anonymizeFields?: readonly string[];
    baseFilter?: Record<string, unknown>;
    relatedMaterial?: boolean;
    tombstoneUnsetFields?: readonly string[];
    tombstoneSetFields?: Readonly<Record<string, unknown>>;
    exportOmitFields?: readonly string[];
};

const direct = (
    model: string,
    scalarFields: readonly string[],
    policy: RegistryPolicy = "DELETE",
    membershipFields: readonly string[] = [],
    baseFilter?: Record<string, unknown>,
    overrides: Partial<RegistryRule> = {},
): RegistryRule => ({
    model,
    policy,
    scalarFields,
    membershipFields,
    baseFilter,
    ...overrides,
});

/**
 * Inventário total dos models registados pela aplicação e da sua política.
 */
export const PERSONAL_DATA_REGISTRY: readonly RegistryRule[] = [
    direct("User", ["_id"], "ACCOUNT_LIFECYCLE"),
    direct("StudentProfile", ["userId"]),
    direct("StudyArea", ["userId"]),
    direct("Material", ["userId"]),
    direct("StudyEvent", ["userId"]),
    direct("StudyGoal", ["userId"]),
    direct("StudyRoutine", ["userId"]),
    direct("StudyAlertRead", ["userId"]),
    direct("NotificationPreference", ["userId"]),
    direct("AdaptiveExplanation", ["userId"]),
    direct("AiAreaProfile", ["userId"]),
    direct("AiArtifact", ["userId"]),
    direct("AiQuizAttempt", ["userId"]),
    direct("LearningProfile", ["userId"]),
    direct("QuizGenerationJob", ["userId"]),
    direct("PrivateAreaAiAnswer", ["studentId"]),
    direct("ExternalKnowledgeAiAnswer", ["studentId"]),
    direct("SourceGroundedAiAnswer", ["actorId"]),
    direct("ClassAiInteraction", ["studentId"], "DELETE", [], undefined, {
        exportOmitFields: [
            "voiceSource",
            "voiceTone",
            "voiceDetailLevel",
            "voiceRulesApplied",
        ],
    }),
    direct(
        "GuidedStudyRoomAiInteraction",
        ["studentId"],
        "DELETE",
        [],
        undefined,
        {
            exportOmitFields: [
                "voiceSource",
                "voiceTone",
                "voiceDetailLevel",
                "voiceRulesApplied",
            ],
        },
    ),
    direct("GuidedStudyRoomParticipation", ["studentId"]),
    direct("ProjectAiPlan", ["studentId"], "DELETE", [], undefined, {
        exportOmitFields: [
            "voiceSource",
            "voiceTone",
            "voiceDetailLevel",
            "voiceRulesApplied",
        ],
    }),
    direct("StudyGroupAiAnswer", ["studentId"]),
    direct("StudyGroupMessage", ["authorStudentId"], "TOMBSTONE", [], undefined, {
        tombstoneUnsetFields: ["authorStudentId", "text"],
    }),
    // Uma sessão agendada pertence ao grupo, não apenas a quem a criou. Numa
    // sala partilhada preservamos o compromisso coletivo e anonimizamos o
    // criador; numa sala exclusiva a cascata por `groupId` remove-a por inteiro.
    direct("StudyGroupSession", ["createdByStudentId"], "ANONYMIZE"),
    direct("RoomAiInteraction", ["studentId"]),
    direct("RoomShare", ["authorStudentId"], "TOMBSTONE", [], undefined, {
        relatedMaterial: true,
        tombstoneUnsetFields: [
            "authorStudentId",
            "title",
            "textContent",
            "url",
            "materialId",
            "materialTitle",
            "materialContentRevision",
        ],
        tombstoneSetFields: { usableByAi: false },
    }),
    direct("TeacherStudentChatMessage", ["authorUserId"], "TOMBSTONE", [], undefined, {
        tombstoneUnsetFields: ["authorUserId", "authorRole", "text"],
    }),
    direct("StudentSubjectChatReadState", ["studentId"]),
    direct("StudentStudyGroupChatReadState", ["studentId"]),
    direct("MaterialContext", ["studentId", "teacherId"], "DELETE", [], undefined, {
        relatedMaterial: true,
    }),
    direct("MaterialIndexJob", ["userId", "teacherId"], "DELETE", [], undefined, {
        relatedMaterial: true,
    }),
    direct("MaterialVersion", ["userId", "teacherId"], "DELETE", [], undefined, {
        relatedMaterial: true,
    }),
    {
        model: "MaterialStructure",
        policy: "DELETE",
        relatedMaterial: true,
    },
    direct("AiConsent", ["userId", "actorId"]),
    direct("AiGuardrailCheck", ["actorId"], "RETAIN_RECEIPT_90_DAYS", [], undefined, {
        exportOmitFields: ["resourceId", "reason"],
    }),
    { model: "AiQuotaDefaultPolicy", policy: "RETAIN_NONPERSONAL" },
    direct("AiQuotaPolicy", ["targetId"], "DELETE", [], { scope: "USER" }),
    direct("AiQuotaUsage", ["targetId"], "DELETE", [], { scope: "USER" }),
    direct("DataExportRequest", ["userId"]),
    direct("AccountDeletionRequest", [], "RETAIN_NONPERSONAL"),
    direct("AuditEvent", ["actorId", "resourceId"], "RETAIN_RECEIPT_90_DAYS", [], undefined, {
        exportOmitFields: ["resourceId", "metadata"],
    }),
    direct(
        "UserRoleChange",
        ["actorId", "targetUserId"],
        "RETAIN_RECEIPT_90_DAYS",
        [],
        undefined,
        { exportOmitFields: ["reason"] },
    ),
    direct("SchoolClass", ["teacherId"], "ANONYMIZE", ["studentIds"]),
    direct("ClassMembership", ["studentId"], "DELETE", [], undefined, {
        anonymizeFields: ["joinedBy", "removedBy"],
    }),
    direct("ClassLearningActivity", ["studentId"]),
    direct("StudentClassActivityState", ["studentId"]),
    direct("StudyRoom", ["ownerStudentId"], "ANONYMIZE", ["memberIds"]),
    direct("ContextNotification", ["actorId"], "ANONYMIZE", [
        "recipientIds",
        "suppressedRecipientIds",
    ]),
    direct("ContextNotificationRecipient", ["recipientId"]),
    direct("NotificationOutboxEvent", ["actorId"], "DELETE", [
        "recipientIdsSnapshot",
    ]),
    direct("Subject", ["teacherId"], "ANONYMIZE"),
    direct("ClassPost", ["teacherId"], "TOMBSTONE", [], undefined, {
        tombstoneUnsetFields: ["teacherId", "title", "body"],
    }),
    direct("ClassProgressNote", ["teacherId"], "ANONYMIZE"),
    direct("ClassProject", ["teacherId"], "ANONYMIZE"),
    direct("StudentClassProjectState", ["studentId"]),
    direct("AiContentReview", ["teacherId"]),
    direct("ApprovedAiQuizAttempt", ["studentId"]),
    direct("FollowUpAlertRule", ["teacherId"], "ANONYMIZE"),
    direct("GuidedStudyRoom", ["teacherId"], "ANONYMIZE"),
    direct("OfficialMaterial", ["teacherId"], "ANONYMIZE"),
    direct("OfficialTest", ["teacherId"], "ANONYMIZE"),
    direct("OfficialTestAttempt", ["studentId"], "DELETE", [], undefined, {
        // A chave de correção pertence ao teste, não aos dados pessoais do
        // aluno. Omiti-la impede que o export contorne o desbloqueio de soluções.
        exportOmitFields: [
            "results.correctOptionIndex",
            "results.isCorrect",
        ],
    }),
    direct("TeacherAiVoice", ["teacherId"]),
    direct("TeacherClassAiVoice", ["teacherId"]),
    direct("TeacherStudentChatThread", ["teacherId"], "ANONYMIZE"),
    direct("CurriculumNavigationLog", ["actorId"]),
    direct("UnifiedSearchLog", ["actorId"]),
    direct("StudentRecentContext", ["userId"]),
    direct("StudentAiConversation", ["studentId"]),
    direct("StudentAiArtifactGenerationSnapshot", ["userId"]),
    direct("StudentAiConversationForkInvitation", [
        "sourceStudentId",
        "recipientStudentId",
    ]),
    {
        model: "AiModelPolicy",
        policy: "GLOBAL_CONFIGURATION",
    },
    {
        model: "NotificationChannelPolicy",
        policy: "GLOBAL_CONFIGURATION",
    },
    {
        model: "PersonalDataRetention",
        policy: "RETAIN_NONPERSONAL",
    },
] as const;

type LooseRecord = Record<string, unknown> & { _id?: unknown };
type LooseModel = Model<LooseRecord>;

type SubjectContext = {
    userObjectId: Types.ObjectId;
    userId: string;
    materialIds: Types.ObjectId[];
    indexJobIds: Types.ObjectId[];
    materials: Array<{
        _id?: unknown;
        storageKey?: string;
        storageSha256?: string;
        originalName?: string;
        mimeType?: string;
        sizeBytes?: number;
    }>;
};

export type PersonalDataDeletionPlan = {
    registryVersion: string;
    subjectId: string;
    anonymousId: string;
    retentionReference: string;
    materialIds: string[];
    indexJobIds: string[];
    storageOperations: StorageDeleteOperation[];
};

export type PersonalDataDeletionResult = {
    registryVersion: string;
    affectedCounts: Record<string, number>;
    physicalFilesDeleted: number;
    physicalFilesPending: number;
    retentionExpiresAt: Date;
};

export type PersonalDataExportDownload = {
    stream: ReadStream;
    filename: string;
    contentType: "application/json";
    sizeBytes: number;
    collectionCount: number;
    recordCount: number;
    storedFileCount: number;
    cleanup: () => Promise<void>;
};

/** Escreve sequencialmente sem manter o bundle completo no heap. */
class SequentialJsonWriter {
    private position = 0;

    constructor(private readonly handle: FileHandle) {}

    async write(value: string): Promise<void> {
        const bytes = Buffer.from(value, "utf8");
        if (this.position + bytes.byteLength > MAX_EXPORT_BYTES) {
            throw new Error("A exportação excede o limite local seguro.");
        }
        let offset = 0;
        while (offset < bytes.byteLength) {
            const result = await this.handle.write(
                bytes,
                offset,
                bytes.byteLength - offset,
                this.position,
            );
            if (result.bytesWritten <= 0) {
                throw new Error("Não foi possível avançar a escrita do export RGPD.");
            }
            offset += result.bytesWritten;
            this.position += result.bytesWritten;
        }
    }
}

/**
 * Opera o registry sem assumir responsabilidade pelo User ou pelas sessões.
 */
@Injectable()
export class PersonalDataRegistryService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(PersonalDataRetention.name)
        private readonly retentionModel: Model<PersonalDataRetentionDocument>,
        private readonly storageService: MaterialStorageService,
    ) {}

    /**
     * Devolve o manifesto estável usado por auditoria, export e delete.
     */
    registryManifest() {
        return PERSONAL_DATA_REGISTRY.map((rule) => ({
            model: rule.model,
            policy: rule.policy,
        }));
    }

    /**
     * Falha se um model ligado à Connection não tiver política ou se uma regra
     * apontar para um model ausente. Assim, schema drift não reduz cobertura RGPD.
     */
    validateCoverage(): void {
        const registered = new Set(Object.keys(this.connection.models));
        const declared = new Set(PERSONAL_DATA_REGISTRY.map((rule) => rule.model));
        const missingPolicies = [...registered].filter(
            (model) => !declared.has(model),
        );
        const missingModels = [...declared].filter(
            (model) => !registered.has(model),
        );
        if (missingPolicies.length > 0 || missingModels.length > 0) {
            throw new InternalServerErrorException({
                code: "PERSONAL_DATA_REGISTRY_INCOMPLETE",
                message: "O registry de dados pessoais está incompleto.",
                missingPolicies,
                missingModels,
            });
        }
    }

    /**
     * Gera um attachment JSON completo num ficheiro temporário privado.
     *
     * As coleções são percorridas com cursor e cada ficheiro é codificado
     * individualmente. Assim, a quota total de 250 MiB nunca é duplicada no
     * heap como um único objeto/base64. O chamador tem de executar `cleanup`.
     */
    async createExportDownload(userId: string): Promise<PersonalDataExportDownload> {
        this.validateCoverage();
        const filesystem = await statfs(tmpdir());
        if (filesystem.bavail * filesystem.bsize < MIN_EXPORT_FREE_BYTES) {
            throw new ServiceUnavailableException({
                code: "PERSONAL_DATA_EXPORT_STORAGE_UNAVAILABLE",
                message: "Não existe espaço temporário suficiente para a exportação.",
            });
        }
        const context = await this.buildContext(userId);
        const exportedAt = new Date();
        const temporaryDirectory = await mkdtemp(
            join(tmpdir(), "studyflow-personal-export-"),
        );
        await chmod(temporaryDirectory, 0o700);
        const filePath = join(temporaryDirectory, "personal-data.json");
        const handle = await open(filePath, "wx", 0o600);
        let closed = false;

        const closeHandle = async () => {
            if (closed) return;
            closed = true;
            await handle.close();
        };

        try {
            const writer = new SequentialJsonWriter(handle);
            const stats = await this.writeExportJson(
                writer,
                context,
                exportedAt,
            );
            await handle.sync();
            await closeHandle();
            await chmod(filePath, 0o600);
            const fileStats = await stat(filePath);
            if (!fileStats.isFile() || (fileStats.mode & 0o777) !== 0o600) {
                throw new Error("O ficheiro temporário de exportação não é privado.");
            }

            const readHandle = await open(filePath, "r");
            // O ficheiro deixa de ter nome antes de sair deste método. O fd
            // continua legível, mas um crash fecha-o e o sistema liberta os
            // blocos sem deixar plaintext recuperável em /tmp.
            await rm(filePath);
            const stream = readHandle.createReadStream({ autoClose: true });
            let cleaned = false;
            const cleanup = async () => {
                if (cleaned) return;
                cleaned = true;
                await readHandle.close().catch(() => undefined);
                await rm(temporaryDirectory, { recursive: true, force: true });
            };

            return {
                stream,
                filename: `studyflow-personal-data-${exportedAt
                    .toISOString()
                    .slice(0, 10)}.json`,
                contentType: "application/json",
                sizeBytes: fileStats.size,
                ...stats,
                cleanup,
            };
        } catch (error) {
            await closeHandle().catch(() => undefined);
            await rm(temporaryDirectory, { recursive: true, force: true }).catch(
                () => undefined,
            );
            if (error instanceof ServiceUnavailableException) throw error;
            throw new ServiceUnavailableException({
                code: "PERSONAL_DATA_EXPORT_GENERATION_FAILED",
                message: "Não foi possível gerar a exportação de dados.",
            });
        }
    }

    /**
     * Prepara intenções de delete no filesystem sem apagar bytes. Deve ocorrer
     * antes da transação Mongo que remove os documentos.
     */
    async prepareDeletion(userId: string): Promise<PersonalDataDeletionPlan> {
        this.validateCoverage();
        const context = await this.buildContext(userId);
        const storageOperations: StorageDeleteOperation[] = [];
        try {
            for (const material of context.materials) {
                if (!material.storageKey) continue;
                storageOperations.push(
                    await this.storageService.prepareDelete(
                        userId,
                        material.storageKey,
                    ),
                );
            }
        } catch (error) {
            await Promise.allSettled(
                storageOperations.map((operation) =>
                    this.storageService.cancelDelete(operation),
                ),
            );
            throw error;
        }

        return {
            registryVersion: PERSONAL_DATA_REGISTRY_VERSION,
            subjectId: userId,
            anonymousId: new Types.ObjectId().toHexString(),
            retentionReference: randomUUID(),
            materialIds: context.materialIds.map(String),
            indexJobIds: context.indexJobIds.map(String),
            storageOperations,
        };
    }

    /**
     * Aplica a parte Mongo do plano. O chamador pode passar a ClientSession da
     * eliminação de conta; User e sessões ficam deliberadamente fora daqui.
     */
    async applyDeletion(
        plan: PersonalDataDeletionPlan,
        session?: ClientSession,
    ): Promise<
        Omit<
            PersonalDataDeletionResult,
            "physicalFilesDeleted" | "physicalFilesPending"
        >
    > {
        if (plan.registryVersion !== PERSONAL_DATA_REGISTRY_VERSION) {
            throw new InternalServerErrorException({
                code: "PERSONAL_DATA_PLAN_STALE",
                message: "O plano de eliminação deixou de ser compatível.",
            });
        }
        const context = this.contextFromPlan(plan);
        const anonymousObjectId = new Types.ObjectId(plan.anonymousId);
        const affectedCounts: Record<string, number> = {};
        const anonymizedAt = new Date();
        const retentionExpiresAt = new Date(
            anonymizedAt.getTime() +
                PERSONAL_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000,
        );

        const roomCounts = await this.applyStudyRoomDeletionPolicy(
            context,
            session,
        );
        affectedCounts.StudyRoom = roomCounts.rooms;
        affectedCounts.RoomShare = roomCounts.dependentShares;
        affectedCounts.RoomAiInteraction = roomCounts.dependentInteractions;
        affectedCounts.StudyGroupMessage = roomCounts.dependentMessages;
        affectedCounts.StudentStudyGroupChatReadState = roomCounts.dependentReadStates;
        affectedCounts.StudyGroupSession = roomCounts.dependentSessions;
        affectedCounts.StudyGroupAiAnswer = roomCounts.dependentAiAnswers;

        for (const rule of PERSONAL_DATA_REGISTRY) {
            if (
                rule.policy === "ACCOUNT_LIFECYCLE" ||
                rule.policy === "GLOBAL_CONFIGURATION" ||
                rule.policy === "INTERNAL_RETENTION" ||
                rule.policy === "RETAIN_NONPERSONAL" ||
                rule.model === "StudyRoom"
            ) {
                continue;
            }
            const model = this.getModel(rule.model);
            let count = 0;

            for (const field of rule.membershipFields ?? []) {
                if (!model.schema.path(field)) continue;
                const result = await model.updateMany(
                    this.withBaseFilter(rule, {
                        [field]: { $in: [context.userObjectId, context.userId] },
                    }),
                    { $pull: { [field]: { $in: [context.userObjectId, context.userId] } } },
                    { session },
                );
                count += result.modifiedCount ?? 0;
            }

            for (const field of rule.anonymizeFields ?? []) {
                if (!model.schema.path(field)) continue;
                const result = await model.updateMany(
                    this.withBaseFilter(rule, {
                        [field]: { $in: [context.userObjectId, context.userId] },
                    }),
                    {
                        $set: {
                            [field]: this.isStringPath(model, field)
                                ? plan.anonymousId
                                : anonymousObjectId,
                        },
                    },
                    { session },
                );
                count += result.modifiedCount ?? 0;
            }

            const filter = this.buildScalarOrRelatedFilter(rule, context);
            if (filter) {
                if (rule.policy === "ANONYMIZE") {
                    const result = await model.updateMany(
                        filter,
                        {
                            $set: this.anonymousScalarFields(
                                model,
                                rule,
                                plan.anonymousId,
                                anonymousObjectId,
                            ),
                        },
                        { session },
                    );
                    count += result.modifiedCount ?? 0;
                } else if (rule.policy === "TOMBSTONE") {
                    const unset = Object.fromEntries(
                        (rule.tombstoneUnsetFields ?? [])
                            .filter((field) => model.schema.path(field))
                            .map((field) => [field, 1]),
                    );
                    const result = await model.updateMany(
                        filter,
                        {
                            $set: {
                                ...(rule.tombstoneSetFields ?? {}),
                                tombstonedAt: anonymizedAt,
                            },
                            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
                        },
                        { session },
                    );
                    count += result.modifiedCount ?? 0;
                } else if (rule.policy === "RETAIN_RECEIPT_90_DAYS") {
                    const result = await model.updateMany(
                        filter,
                        this.retainedAnonymizationUpdate(
                            model,
                            rule,
                            plan.anonymousId,
                            anonymousObjectId,
                            anonymizedAt,
                            retentionExpiresAt,
                        ),
                        { session },
                    );
                    count += result.modifiedCount ?? 0;
                } else {
                    const result = await model.deleteMany(filter, { session });
                    count += result.deletedCount ?? 0;
                }
            }
            affectedCounts[rule.model] =
                (affectedCounts[rule.model] ?? 0) + count;
        }

        await this.retentionModel.create(
            [
                {
                    receiptReference: plan.retentionReference,
                    registryVersion: PERSONAL_DATA_REGISTRY_VERSION,
                    affectedCounts,
                    expiresAt: retentionExpiresAt,
                },
            ],
            { session },
        );

        return {
            registryVersion: PERSONAL_DATA_REGISTRY_VERSION,
            affectedCounts,
            retentionExpiresAt,
        };
    }

    /**
     * Elimina salas exclusivamente detidas pelo titular e transfere salas
     * realmente partilhadas para um membro remanescente antes de remover a
     * membership. Dependências de uma sala exclusiva são apagadas em cascata.
     */
    private async applyStudyRoomDeletionPolicy(
        context: SubjectContext,
        session?: ClientSession,
    ): Promise<{
        rooms: number;
        dependentShares: number;
        dependentInteractions: number;
        dependentMessages: number;
        dependentReadStates: number;
        dependentSessions: number;
        dependentAiAnswers: number;
    }> {
        const roomModel = this.getModel("StudyRoom");
        const ownedRooms = (await roomModel
            .find(
                {
                    ownerStudentId: {
                        $in: [context.userObjectId, context.userId],
                    },
                },
                "_id memberIds",
                { session },
            )
            .lean()) as Array<{ _id: unknown; memberIds?: unknown[] }>;
        const exclusiveRoomIds: unknown[] = [];
        let rooms = 0;

        for (const room of ownedRooms) {
            const remainingMembers = (room.memberIds ?? []).filter(
                (memberId) => String(memberId) !== context.userId,
            );
            if (remainingMembers.length === 0) {
                exclusiveRoomIds.push(room._id);
                continue;
            }
            const transfer = await roomModel.updateOne(
                { _id: room._id },
                {
                    $set: { ownerStudentId: remainingMembers[0] },
                    $pull: {
                        memberIds: {
                            $in: [context.userObjectId, context.userId],
                        },
                    },
                },
                { session },
            );
            rooms += transfer.modifiedCount ?? 0;
        }

        let dependentShares = 0;
        let dependentInteractions = 0;
        let dependentMessages = 0;
        let dependentReadStates = 0;
        let dependentSessions = 0;
        let dependentAiAnswers = 0;
        if (exclusiveRoomIds.length > 0) {
            const roomFilter = { roomId: { $in: exclusiveRoomIds } };
            const groupFilter = { groupId: { $in: exclusiveRoomIds } };
            // Operações que partilham uma ClientSession transacional têm de ser
            // sequenciais; o driver Mongo não suporta Promise.all na mesma
            // transaction e poderia produzir comportamento indefinido.
            const shares = await this.getModel("RoomShare").deleteMany(
                roomFilter,
                { session },
            );
            const interactions = await this.getModel(
                "RoomAiInteraction",
            ).deleteMany(roomFilter, { session });
            const messages = await this.getModel(
                "StudyGroupMessage",
            ).deleteMany(groupFilter, { session });
            const readStates = await this.getModel(
                "StudentStudyGroupChatReadState",
            ).deleteMany(groupFilter, { session });
            const sessions = await this.getModel(
                "StudyGroupSession",
            ).deleteMany(groupFilter, { session });
            const aiAnswers = await this.getModel(
                "StudyGroupAiAnswer",
            ).deleteMany(groupFilter, { session });
            const deletedRooms = await roomModel.deleteMany(
                { _id: { $in: exclusiveRoomIds } },
                { session },
            );
            dependentShares = shares.deletedCount ?? 0;
            dependentInteractions = interactions.deletedCount ?? 0;
            dependentMessages = messages.deletedCount ?? 0;
            dependentReadStates = readStates.deletedCount ?? 0;
            dependentSessions = sessions.deletedCount ?? 0;
            dependentAiAnswers = aiAnswers.deletedCount ?? 0;
            rooms += deletedRooms.deletedCount ?? 0;
        }

        const memberships = await roomModel.updateMany(
            {
                memberIds: { $in: [context.userObjectId, context.userId] },
            },
            {
                $pull: {
                    memberIds: { $in: [context.userObjectId, context.userId] },
                },
            },
            { session },
        );
        rooms += memberships.modifiedCount ?? 0;
        return {
            rooms,
            dependentShares,
            dependentInteractions,
            dependentMessages,
            dependentReadStates,
            dependentSessions,
            dependentAiAnswers,
        };
    }

    /** Apaga os ficheiros apenas depois do commit Mongo. */
    async finalizeDeletion(
        plan: PersonalDataDeletionPlan,
    ): Promise<{ physicalFilesDeleted: number; physicalFilesPending: number }> {
        const results = await Promise.allSettled(
            plan.storageOperations.map((operation) =>
                this.storageService.commitDelete(operation),
            ),
        );
        const physicalFilesDeleted = results.filter(
            (result) => result.status === "fulfilled",
        ).length;
        return {
            physicalFilesDeleted,
            physicalFilesPending:
                plan.storageOperations.length - physicalFilesDeleted,
        };
    }

    /** Remove intenções de filesystem se a transação abortar. */
    async cancelDeletion(plan: PersonalDataDeletionPlan): Promise<void> {
        const results = await Promise.allSettled(
            plan.storageOperations.map((operation) =>
                this.storageService.cancelDelete(operation),
            ),
        );
        if (results.some((result) => result.status === "rejected")) {
            throw new ServiceUnavailableException({
                code: "PERSONAL_DATA_DELETE_COMPENSATION_FAILED",
                message: "Não foi possível compensar todas as intenções de delete.",
            });
        }
    }

    /** Fluxo autónomo para consumidores sem transação de conta envolvente. */
    async deleteForUser(userId: string): Promise<PersonalDataDeletionResult> {
        const plan = await this.prepareDeletion(userId);
        let databaseResult: Omit<
            PersonalDataDeletionResult,
            "physicalFilesDeleted" | "physicalFilesPending"
        >;
        try {
            databaseResult = await this.connection.transaction((session) =>
                this.applyDeletion(plan, session),
            );
        } catch (error) {
            await this.cancelDeletion(plan);
            throw error;
        }
        // Após o commit nunca se cancela a outbox: uma falha de filesystem fica
        // recuperável pela reconciliação em vez de ressuscitar uma referência.
        const storageResult = await this.finalizeDeletion(plan);
        return { ...databaseResult, ...storageResult };
    }

    /** Serializa o bundle por cursor e devolve apenas métricas não pessoais. */
    private async writeExportJson(
        writer: SequentialJsonWriter,
        context: SubjectContext,
        exportedAt: Date,
    ): Promise<{
        collectionCount: number;
        recordCount: number;
        storedFileCount: number;
    }> {
        let recordCount = 0;
        let storedFileCount = 0;
        await writer.write(
            `{"exportedAt":${JSON.stringify(exportedAt.toISOString())},` +
                `"registryVersion":${JSON.stringify(PERSONAL_DATA_REGISTRY_VERSION)},` +
                `"registry":${JSON.stringify(this.registryManifest())},"collections":{`,
        );

        for (const [ruleIndex, rule] of PERSONAL_DATA_REGISTRY.entries()) {
            if (ruleIndex > 0) await writer.write(",");
            await writer.write(`${JSON.stringify(rule.model)}:[`);
            const filter = this.buildFilter(rule, context);
            let firstRecord = true;
            if (
                filter &&
                rule.policy !== "GLOBAL_CONFIGURATION" &&
                rule.policy !== "INTERNAL_RETENTION" &&
                rule.policy !== "RETAIN_NONPERSONAL"
            ) {
                const cursor = this.getModel(rule.model)
                    .find(filter)
                    .lean()
                    .cursor();
                for await (const document of cursor as AsyncIterable<LooseRecord>) {
                    if (!firstRecord) await writer.write(",");
                    firstRecord = false;
                    await writer.write(
                        JSON.stringify(
                            this.sanitizeExportDocument(rule, document, context),
                        ),
                    );
                    recordCount += 1;
                }
            }
            await writer.write("]");
        }

        await writer.write("},\"storedFiles\":[");
        let firstFile = true;
        for (const material of context.materials) {
            if (!material.storageKey) continue;
            let bytes: Buffer;
            try {
                // O limite por ficheiro é 10 MiB; cada Buffer é libertado antes
                // de se avançar, em vez de acumular a quota de 250 MiB.
                bytes = await this.storageService.read(material.storageKey);
            } catch {
                throw new ServiceUnavailableException({
                    code: "PERSONAL_DATA_FILE_UNAVAILABLE",
                    message: "A exportação não conseguiu incluir todos os ficheiros.",
                });
            }
            const sha256 = createHash("sha256").update(bytes).digest("hex");
            if (
                (material.storageSha256 && material.storageSha256 !== sha256) ||
                (typeof material.sizeBytes === "number" &&
                    material.sizeBytes !== bytes.byteLength)
            ) {
                throw new ServiceUnavailableException({
                    code: "PERSONAL_DATA_FILE_INTEGRITY_FAILED",
                    message: "A integridade de um ficheiro da exportação falhou.",
                });
            }
            if (!firstFile) await writer.write(",");
            firstFile = false;
            await writer.write(
                JSON.stringify({
                    materialReference: this.normalize(material._id),
                    originalName: material.originalName,
                    mimeType: material.mimeType,
                    sizeBytes: bytes.byteLength,
                    contentBase64: bytes.toString("base64"),
                }),
            );
            storedFileCount += 1;
        }
        await writer.write("]}");

        return {
            collectionCount: PERSONAL_DATA_REGISTRY.length,
            recordCount,
            storedFileCount,
        };
    }

    /**
     * Substitui apenas referências do próprio titular por `SELF` e remove IDs
     * de terceiros, incluindo quando estão aninhados em metadata.
     */
    private sanitizeExportDocument(
        rule: RegistryRule,
        document: LooseRecord,
        context: SubjectContext,
    ): Record<string, unknown> {
        const normalized = this.normalize(document) as Record<string, unknown>;
        const declaredIdentityFields = new Set([
            ...(rule.scalarFields ?? []),
            ...(rule.membershipFields ?? []),
            ...(rule.anonymizeFields ?? []),
        ]);

        for (const field of rule.scalarFields ?? []) {
            if (!(field in normalized)) continue;
            if (this.isSubjectReference(normalized[field], context)) {
                normalized[field] = "SELF";
            } else {
                delete normalized[field];
            }
        }
        for (const field of rule.membershipFields ?? []) {
            const references = Array.isArray(normalized[field])
                ? normalized[field] as unknown[]
                : [];
            normalized[field] = references.some((value) =>
                this.isSubjectReference(value, context),
            )
                ? ["SELF"]
                : [];
        }
        for (const field of rule.anonymizeFields ?? []) {
            if (!(field in normalized)) continue;
            if (this.isSubjectReference(normalized[field], context)) {
                normalized[field] = "SELF";
            } else {
                delete normalized[field];
            }
        }
        for (const field of rule.exportOmitFields ?? []) {
            this.deleteExportPath(normalized, field.split("."));
        }

        return this.removeThirdPartyIdentifiers(
            normalized,
            declaredIdentityFields,
            true,
        ) as Record<string, unknown>;
    }

    /**
     * Remove um path declarativo do export, atravessando arrays sem expor ou
     * transformar os restantes dados pessoais do titular.
     *
     * @param value Objeto ou array normalizado do export.
     * @param path Segmentos ainda por remover.
     */
    private deleteExportPath(value: unknown, path: readonly string[]): void {
        if (path.length === 0 || !value || typeof value !== "object") return;
        if (Array.isArray(value)) {
            for (const entry of value) this.deleteExportPath(entry, path);
            return;
        }

        const record = value as Record<string, unknown>;
        const [field, ...rest] = path;
        if (rest.length === 0) {
            delete record[field];
            return;
        }
        this.deleteExportPath(record[field], rest);
    }

    private removeThirdPartyIdentifiers(
        value: unknown,
        allowedTopLevel: ReadonlySet<string>,
        topLevel = false,
    ): unknown {
        if (Array.isArray(value)) {
            return value.map((entry) =>
                this.removeThirdPartyIdentifiers(entry, allowedTopLevel),
            );
        }
        if (!value || typeof value !== "object") return value;

        const output: Record<string, unknown> = {};
        for (const [key, nested] of Object.entries(value)) {
            if (
                this.isIdentityField(key) &&
                !(topLevel && allowedTopLevel.has(key))
            ) {
                continue;
            }
            output[key] = this.removeThirdPartyIdentifiers(
                nested,
                allowedTopLevel,
            );
        }
        return output;
    }

    private isIdentityField(key: string): boolean {
        return /^(?:userId|studentId|teacherId|actorId|targetUserId|author(?:User|Student)?Id|ownerStudentId|recipientIds|suppressedRecipientIds|memberIds|studentIds)$/i.test(
            key,
        );
    }

    private isSubjectReference(
        value: unknown,
        context: SubjectContext,
    ): boolean {
        if (value === undefined || value === null) return false;
        return String(value) === context.userId;
    }

    private async buildContext(userId: string): Promise<SubjectContext> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new InternalServerErrorException({
                code: "PERSONAL_DATA_SUBJECT_INVALID",
                message: "O titular de dados não é válido.",
            });
        }
        const userObjectId = new Types.ObjectId(userId);
        const materialModel = this.getModel("Material");
        const indexJobModel = this.getModel("MaterialIndexJob");
        const materials = (await materialModel
            .find({ userId: userObjectId })
            .select(
                "_id storageKey storageSha256 originalName mimeType sizeBytes",
            )
            .lean()) as SubjectContext["materials"];
        const materialIds = materials
            .map((material) => material._id)
            .filter((id): id is Types.ObjectId => id instanceof Types.ObjectId);
        const indexJobs = (await indexJobModel
            .find({
                $or: [
                    { userId: userObjectId },
                    { teacherId: userObjectId },
                    ...(materialIds.length > 0
                        ? [{ materialId: { $in: materialIds } }]
                        : []),
                ],
            })
            .select("_id")
            .lean()) as Array<{ _id?: unknown }>;
        const indexJobIds = indexJobs
            .map((job) => job._id)
            .filter((id): id is Types.ObjectId => id instanceof Types.ObjectId);

        return {
            userObjectId,
            userId,
            materialIds,
            indexJobIds,
            materials,
        };
    }

    private contextFromPlan(plan: PersonalDataDeletionPlan): SubjectContext {
        return {
            userObjectId: new Types.ObjectId(plan.subjectId),
            userId: plan.subjectId,
            materialIds: plan.materialIds.map((id) => new Types.ObjectId(id)),
            indexJobIds: plan.indexJobIds.map((id) => new Types.ObjectId(id)),
            materials: [],
        };
    }

    private buildFilter(
        rule: RegistryRule,
        context: SubjectContext,
    ): Record<string, unknown> | undefined {
        return this.buildScalarOrRelatedFilter(rule, context, true);
    }

    private buildScalarOrRelatedFilter(
        rule: RegistryRule,
        context: SubjectContext,
        includeMemberships = false,
    ): Record<string, unknown> | undefined {
        const model = this.getModel(rule.model);
        const fields = [
            ...(rule.scalarFields ?? []),
            ...(includeMemberships ? rule.membershipFields ?? [] : []),
            ...(rule.anonymizeFields ?? []),
        ];
        const clauses = fields
            .filter((field) => model.schema.path(field))
            .map((field) => ({
                [field]: { $in: [context.userObjectId, context.userId] },
            }));
        if (rule.relatedMaterial) {
            if (context.materialIds.length > 0 && model.schema.path("materialId")) {
                clauses.push({ materialId: { $in: context.materialIds } });
            }
            if (context.indexJobIds.length > 0 && model.schema.path("jobId")) {
                clauses.push({ jobId: { $in: context.indexJobIds } });
            }
        }
        if (clauses.length === 0) return undefined;
        return this.withBaseFilter(rule, {
            $or: clauses,
        });
    }

    private withBaseFilter(
        rule: RegistryRule,
        filter: Record<string, unknown>,
    ): Record<string, unknown> {
        return rule.baseFilter
            ? { $and: [rule.baseFilter, filter] }
            : filter;
    }

    private getModel(name: string): LooseModel {
        const model = this.connection.models[name] as LooseModel | undefined;
        if (!model) {
            throw new InternalServerErrorException({
                code: "PERSONAL_DATA_MODEL_UNAVAILABLE",
                message: "Um model do registry de dados pessoais não está disponível.",
                model: name,
            });
        }
        return model;
    }

    private anonymousScalarFields(
        model: LooseModel,
        rule: RegistryRule,
        anonymousId: string,
        anonymousObjectId: Types.ObjectId,
    ): Record<string, unknown> {
        return Object.fromEntries(
            (rule.scalarFields ?? [])
                .filter(
                    (field) => field !== "_id" && Boolean(model.schema.path(field)),
                )
                .map((field) => [
                    field,
                    this.isStringPath(model, field)
                        ? anonymousId
                        : anonymousObjectId,
                ]),
        );
    }

    /**
     * Minimiza registos técnicos retidos e associa-lhes uma expiração real.
     * Nenhum campo é derivado do identificador original do titular.
     */
    private retainedAnonymizationUpdate(
        model: LooseModel,
        rule: RegistryRule,
        anonymousId: string,
        anonymousObjectId: Types.ObjectId,
        anonymizedAt: Date,
        expiresAt: Date,
    ): Record<string, unknown> {
        const set: Record<string, unknown> = {
            ...this.anonymousScalarFields(
                model,
                rule,
                anonymousId,
                anonymousObjectId,
            ),
            anonymizedAt,
            expiresAt,
        };
        const unset: Record<string, 1> = {};

        if (model.schema.path("metadata")) {
            set.metadata = { anonymized: true };
        }
        if (model.schema.path("reason")) {
            set.reason = "Anonimizado por eliminação de conta.";
        }
        if (model.schema.path("resourceId")) {
            if (model.modelName === "AuditEvent") {
                // `resourceId` também integra os scalarFields do AuditEvent.
                // Removê-lo do `$set` evita um update Mongo inválido que tente
                // alterar e eliminar o mesmo path na mesma operação.
                delete set.resourceId;
                unset.resourceId = 1;
            } else {
                set.resourceId = randomUUID();
            }
        }

        return {
            $set: set,
            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
        };
    }

    private isStringPath(model: LooseModel, field: string): boolean {
        return model.schema.path(field)?.instance === "String";
    }

    private normalize(value: unknown): unknown {
        if (value instanceof Date) return value.toISOString();
        if (value instanceof Types.ObjectId) return value.toHexString();
        if (Buffer.isBuffer(value)) return value.toString("base64");
        if (Array.isArray(value)) return value.map((item) => this.normalize(item));
        if (value && typeof value === "object") {
            const output: Record<string, unknown> = {};
            for (const [key, nested] of Object.entries(value)) {
                if (this.isInternalExportField(key)) {
                    continue;
                }
                output[key] = this.normalize(nested);
            }
            return output;
        }
        return value;
    }

    private isInternalExportField(key: string): boolean {
        const normalized = key.toLowerCase();
        return (
            normalized === "__v" ||
            normalized === "sessionversion" ||
            normalized === "roleinvariantversion" ||
            normalized.includes("password") ||
            normalized.includes("secret") ||
            normalized.includes("cookie") ||
            normalized.includes("storagekey") ||
            normalized.includes("hash") ||
            normalized.includes("sha256") ||
            normalized.startsWith("lease") ||
            normalized === "token"
        );
    }
}
