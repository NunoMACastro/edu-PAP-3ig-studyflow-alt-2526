/**
 * Automatiza tarefas operacionais usadas em desenvolvimento e validação.
 */
import "../common/config/load-env.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import type { Model } from "mongoose";
import { loadRuntimeConfig } from "../common/config/runtime-config.js";
import { CURRENT_AI_POLICY_VERSION } from "../modules/ai-consents/ai-consents.service.js";
import {
    AiConsent,
    AiConsentPurpose,
    AiConsentSchema,
} from "../modules/ai-consents/schemas/ai-consent.schema.js";
import {
    AiModelPolicy,
    AiModelPolicySchema,
} from "../modules/ai-model-policies/schemas/ai-model-policy.schema.js";
import {
    AiQuotaPolicy,
    AiQuotaPolicySchema,
} from "../modules/ai-quotas/schemas/ai-quota-policy.schema.js";
import { User, UserRole, UserSchema } from "../modules/auth/schemas/user.schema.js";

const BCRYPT_COST = 12;
const AI_PURPOSES: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI",
    "GROUP_AI",
    "CLASS_AI",
    "PROJECT_AI",
    "SOURCE_GROUNDED_AI",
    "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION",
    "SUMMARY",
    "STUDY_TOOL",
    "ROOM_AI",
];
const USER_QUOTA_PURPOSES: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI",
    "PROJECT_AI",
    "SOURCE_GROUNDED_AI",
    "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION",
    "SUMMARY",
    "STUDY_TOOL",
];

/**
 * Contrato de scripts operacionais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type DevelopmentUserSeed = {
    email: string;
    password: string;
    role: UserRole;
};

const developmentUsers: DevelopmentUserSeed[] = [
    {
        email: "professor.dev@studyflow.local",
        password: "professor-dev-12345",
        role: "TEACHER",
    },
    {
        email: "aluno.dev@studyflow.local",
        password: "aluno-dev-12345",
        role: "STUDENT",
    },
];

/**
 * Seed local de utilizadores de validação da MF1.
 * Recusa produção e não promove papéis de contas existentes.
 *
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function main(): Promise<void> {
    if (!["development", "test"].includes(process.env.NODE_ENV ?? "")) {
        throw new Error("A seed só pode correr com NODE_ENV=development ou test.");
    }
    if (process.env.STUDYFLOW_ALLOW_DEV_SEED !== "true") {
        throw new Error(
            "Define STUDYFLOW_ALLOW_DEV_SEED=true para confirmar a seed local.",
        );
    }

    const { mongoUri } = loadRuntimeConfig();
    assertLocalDevelopmentMongoUri(mongoUri);

    await mongoose.connect(mongoUri);
    const userModel = mongoose.model(User.name, UserSchema);

    for (const seed of developmentUsers) {
        const existing = await userModel.findOne({ email: seed.email }).lean();
        if (existing) {
            if (existing.role !== seed.role) {
                console.warn(
                    `Conta de desenvolvimento existe com role ${existing.role}; não foi alterada.`,
                );
            } else {
                console.log(`Conta de desenvolvimento ${seed.role} já existe.`);
            }
            continue;
        }

        const passwordHash = await bcrypt.hash(seed.password, BCRYPT_COST);
        await userModel.create({
            email: seed.email,
            passwordHash,
            role: seed.role,
            authProvider: "local",
        });
        console.log(`Conta de desenvolvimento criada com role ${seed.role}.`);
    }

    if (process.env.STUDYFLOW_E2E_SEED_AI_GOVERNANCE === "true") {
        await seedE2eAiGovernance(userModel);
    }

    await mongoose.disconnect();
}

/**
 * Cria apenas fixtures explícitas do ambiente E2E. Não é executado pela seed
 * de desenvolvimento normal e nunca concede ROOM_AI automaticamente.
 */
async function seedE2eAiGovernance(
    userModel: Model<User>,
): Promise<void> {
    const policyModel = mongoose.model(AiModelPolicy.name, AiModelPolicySchema);
    const quotaModel = mongoose.model(AiQuotaPolicy.name, AiQuotaPolicySchema);
    const consentModel = mongoose.model(AiConsent.name, AiConsentSchema);

    for (const purpose of AI_PURPOSES) {
        await policyModel.updateOne(
            { purpose },
            {
                $set: {
                    enabled: purpose !== "ROOM_AI",
                    provider: "openai",
                    model: "studyflow-e2e-fake",
                    timeoutMs: 8_000,
                    maxSourceCount: 10,
                    maxPromptChars: 12_000,
                },
                $setOnInsert: { purpose },
            },
            { upsert: true, runValidators: true },
        );
    }

    const users = await userModel
        .find({ email: { $in: developmentUsers.map((user) => user.email) } })
        .select("_id")
        .lean();
    for (const user of users) {
        for (const purpose of AI_PURPOSES.filter((value) => value !== "ROOM_AI")) {
            await consentModel.create({
                userId: user._id,
                actorId: user._id,
                purpose,
                status: "GRANTED",
                policyVersion: CURRENT_AI_POLICY_VERSION,
            });
        }
        for (const purpose of USER_QUOTA_PURPOSES) {
            await quotaModel.updateOne(
                { scope: "USER", targetId: user._id, purpose },
                {
                    $set: { monthlyLimitUnits: 100 },
                    $setOnInsert: {
                        scope: "USER",
                        targetId: user._id,
                        purpose,
                    },
                },
                { upsert: true, runValidators: true },
            );
        }
    }
}

/**
 * Recusa bases remotas ou sem nome de desenvolvimento antes de criar contas
 * previsíveis de demonstração.
 *
 * @param mongoUri URI Mongo a validar sem a escrever em logs.
 */
function assertLocalDevelopmentMongoUri(mongoUri: string): void {
    const parsed = new URL(mongoUri);
    const hostname = parsed.hostname.toLowerCase();
    if (!["127.0.0.1", "localhost", "[::1]"].includes(hostname)) {
        throw new Error("A seed só aceita uma base Mongo em loopback.");
    }
    const databaseName = parsed.pathname.replace(/^\//, "");
    if (!/^studyflow(?:[_-](?:dev|test|e2e))?$/i.test(databaseName)) {
        throw new Error("A seed exige um nome de base local de desenvolvimento/teste.");
    }
    if (!parsed.searchParams.get("replicaSet")?.trim()) {
        throw new Error("A seed exige MongoDB local configurado como replica set.");
    }
}

main().catch(async (error: unknown) => {
    console.error(error);
    await mongoose.disconnect().catch(() => undefined);
    process.exitCode = 1;
});
