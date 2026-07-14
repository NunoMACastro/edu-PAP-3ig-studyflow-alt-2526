/**
 * Cria o primeiro administrador apenas numa base local vazia desse papel.
 * A password é fornecida pelo operador, nunca tem default e nunca é impressa.
 */
import "../common/config/load-env.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { loadRuntimeConfig } from "../common/config/runtime-config.js";
import { User, UserSchema } from "../modules/auth/schemas/user.schema.js";

const BCRYPT_COST = 12;

export type AdminBootstrapOptions = {
    allowBootstrap?: boolean;
    nodeEnv?: string;
    email?: string;
    password?: string;
};

/** Valida o gate manual sem devolver ou registar a password. */
export function normaliseAdminBootstrapOptions(options: AdminBootstrapOptions): {
    email: string;
    password: string;
} {
    if (options.allowBootstrap !== true) {
        throw new Error(
            "Define STUDYFLOW_ALLOW_ADMIN_BOOTSTRAP=true para confirmar o bootstrap.",
        );
    }
    if (!["development", "test"].includes(options.nodeEnv ?? "")) {
        throw new Error("O bootstrap admin só aceita NODE_ENV=development ou test.");
    }
    const email = options.email?.trim().toLowerCase() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        throw new Error("STUDYFLOW_ADMIN_EMAIL não é um email válido.");
    }
    const password = options.password ?? "";
    const passwordBytes = Buffer.byteLength(password, "utf8");
    if (
        password.length < 16 ||
        password.length > 128 ||
        passwordBytes > 72 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/\d/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
    ) {
        throw new Error(
            "STUDYFLOW_ADMIN_PASSWORD deve ter 16-128 caracteres (máx. 72 bytes), maiúscula, minúscula, número e símbolo.",
        );
    }
    return { email, password };
}

/** Executa o bootstrap transacional do primeiro administrador. */
export async function bootstrapLocalAdmin(
    options: AdminBootstrapOptions,
): Promise<{ ok: true; role: "ADMIN" }> {
    const config = normaliseAdminBootstrapOptions(options);
    const { mongoUri } = loadRuntimeConfig();
    const passwordHash = await bcrypt.hash(config.password, BCRYPT_COST);

    await mongoose.connect(mongoUri);
    try {
        const userModel = mongoose.model(User.name, UserSchema);
        await userModel.createIndexes();
        await mongoose.connection.transaction(async (session) => {
            await mongoose.connection
                .collection("studyflow_invariants")
                .updateOne(
                    { _id: "active-admin-sentinel" as never },
                    { $inc: { version: 1 }, $set: { kind: "ACTIVE_ADMIN" } },
                    { upsert: true, session },
                );
            const existingAdmin = await userModel.exists({
                role: "ADMIN",
                accountStatus: { $nin: ["SUSPENDED", "DELETED"] },
            }).session(session);
            if (existingAdmin) {
                throw new Error("Já existe um administrador ativo; bootstrap recusado.");
            }
            const emailInUse = await userModel.exists({ email: config.email }).session(session);
            if (emailInUse) {
                throw new Error("O email indicado já pertence a uma conta.");
            }
            await userModel.create(
                [
                    {
                        email: config.email,
                        passwordHash,
                        role: "ADMIN",
                        authProvider: "local",
                        accountStatus: "ACTIVE",
                        sessionVersion: 0,
                        roleInvariantVersion: 0,
                    },
                ],
                { session },
            );
        });
        return { ok: true, role: "ADMIN" };
    } finally {
        await mongoose.disconnect().catch(() => undefined);
    }
}

async function runFromCli(): Promise<void> {
    const password = process.env.STUDYFLOW_ADMIN_PASSWORD;
    delete process.env.STUDYFLOW_ADMIN_PASSWORD;
    try {
        const result = await bootstrapLocalAdmin({
            allowBootstrap:
                process.env.STUDYFLOW_ALLOW_ADMIN_BOOTSTRAP === "true",
            nodeEnv: process.env.NODE_ENV,
            email: process.env.STUDYFLOW_ADMIN_EMAIL,
            password,
        });
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error(
            JSON.stringify({
                ok: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Falha no bootstrap admin local.",
            }),
        );
        process.exitCode = 1;
    }
}

if (process.argv[1]?.endsWith("bootstrap-local-admin.js")) {
    void runFromCli();
}
