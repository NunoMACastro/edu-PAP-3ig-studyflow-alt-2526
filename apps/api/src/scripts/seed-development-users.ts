/**
 * Entrada pública da seed de desenvolvimento privada TIG.
 *
 * Mantém os comandos históricos `seed:dev` e `seed:dev-users`, mas delega o
 * cenário integral no módulo privado depois de aplicar todas as guardas do alvo.
 */
import "../common/config/load-env.js";
import mongoose from "mongoose";
import { loadRuntimeConfig } from "../common/config/runtime-config.js";
import type { AiConsentPurpose } from "../modules/ai-consents/schemas/ai-consent.schema.js";
import { seedPrivateClassEnvironment } from "./development-seed/private-class-seed.js";

const USER_QUOTA_PURPOSES: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI",
    "PROJECT_AI",
    "SOURCE_GROUNDED_AI",
    "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION",
    "SUMMARY",
    "STUDY_TOOL",
];

/** Executa a seed local depois de validar ambiente, opt-in e alvo MongoDB. */
export async function seedDevelopmentEnvironment(): Promise<void> {
    if (!["development", "test"].includes(process.env.NODE_ENV ?? "")) {
        throw new Error("A seed só pode correr com NODE_ENV=development ou test.");
    }
    if (process.env.STUDYFLOW_ALLOW_DEV_SEED !== "true") {
        throw new Error(
            "Define STUDYFLOW_ALLOW_DEV_SEED=true para confirmar a seed local.",
        );
    }

    const { mongoUri } = loadRuntimeConfig();
    const target = assertDevelopmentSeedTarget(mongoUri);
    await seedPrivateClassEnvironment({ mongoUri, target });
}

/**
 * Valida a base de destino antes de qualquer ligação. Loopback continua a ser
 * o modo normal; Atlas exige opt-in e confirmação literal do host. Qualquer
 * reset exige ainda confirmação exata do nome da base.
 */
export function assertDevelopmentSeedTarget(mongoUri: string): {
    databaseName: string;
    replaceExistingData: boolean;
} {
    const parsed = new URL(mongoUri);
    const hostname = parsed.hostname.toLowerCase();
    const databaseName = parsed.pathname.replace(/^\//, "");
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(hostname);
    const atlas =
        parsed.protocol === "mongodb+srv:" &&
        hostname.endsWith(".mongodb.net");
    if (!/^studyflow(?:[_-](?:dev|test|e2e))?$/i.test(databaseName)) {
        throw new Error("A seed exige uma base StudyFlow permitida.");
    }
    if (!loopback && !atlas) {
        throw new Error("A seed privada só aceita MongoDB em loopback ou Atlas explicitamente autorizado.");
    }
    if (loopback && parsed.protocol !== "mongodb:") {
        throw new Error("A seed privada exige uma URI mongodb:// local.");
    }
    if (loopback && !parsed.searchParams.get("replicaSet")?.trim()) {
        throw new Error("A seed exige MongoDB local configurado como replica set.");
    }
    if (
        atlas &&
        (
            process.env.STUDYFLOW_ALLOW_ATLAS_DEV_SEED !== "true" ||
            process.env.STUDYFLOW_ATLAS_HOST_CONFIRMATION?.trim().toLowerCase() !== hostname
        )
    ) {
        throw new Error(
            "Atlas exige STUDYFLOW_ALLOW_ATLAS_DEV_SEED=true e confirmação exata do hostname.",
        );
    }

    const replaceExistingData =
        process.env.STUDYFLOW_REPLACE_EXISTING_DATA === "true";
    if (
        replaceExistingData &&
        process.env.STUDYFLOW_RESET_CONFIRMATION !== databaseName
    ) {
        throw new Error(
            "STUDYFLOW_RESET_CONFIRMATION deve coincidir com o nome da base a substituir.",
        );
    }
    return { databaseName, replaceExistingData };
}

/** Valida o modelo administrativo usado nas políticas demo persistidas. */
export function resolveDemoAiPolicyModel(
    environment: { OPENAI_MODEL?: string } = process.env,
): string {
    const model = environment.OPENAI_MODEL?.trim() || "gpt-5.4-mini";
    if (model.length < 2 || model.length > 80) {
        throw new Error("OPENAI_MODEL deve conter entre 2 e 80 caracteres.");
    }
    return model;
}

/** Matriz única de defaults consumidos pelos domínios USER, CLASS e GROUP. */
export function quotaDefaultMatrix(): Array<{
    scope: "USER" | "CLASS" | "GROUP";
    purpose: AiConsentPurpose;
}> {
    return [
        ...USER_QUOTA_PURPOSES.map((purpose) => ({
            scope: "USER" as const,
            purpose,
        })),
        { scope: "CLASS", purpose: "CLASS_AI" },
        { scope: "GROUP", purpose: "GROUP_AI" },
        { scope: "GROUP", purpose: "ROOM_AI" },
    ];
}

if (process.argv[1]?.endsWith("seed-development-users.js")) {
    void seedDevelopmentEnvironment().catch(async (error: unknown) => {
        console.error(error);
        await mongoose.disconnect().catch(() => undefined);
        process.exitCode = 1;
    });
}
