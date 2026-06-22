/**
 * Automatiza tarefas operacionais usadas em desenvolvimento e validação.
 */
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User, UserRole, UserSchema } from "../modules/auth/schemas/user.schema.js";

const BCRYPT_COST = 12;

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
 *
 * Recusa produção e não promove papéis de contas existentes.
 */
async function main(): Promise<void> {
    if (process.env.NODE_ENV === "production") {
        throw new Error("A seed de desenvolvimento não pode correr em produção.");
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("Define MONGODB_URI antes de executar a seed.");
    }

    await mongoose.connect(mongoUri);
    const userModel = mongoose.model(User.name, UserSchema);

    for (const seed of developmentUsers) {
        const existing = await userModel.findOne({ email: seed.email }).lean();
        if (existing) {
            if (existing.role !== seed.role) {
                console.warn(
                    `Conta ${seed.email} existe com role ${existing.role}; não foi alterada.`,
                );
            } else {
                console.log(`Conta ${seed.email} já existe.`);
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
        console.log(`Conta ${seed.email} criada com role ${seed.role}.`);
    }

    await mongoose.disconnect();
}

main().catch(async (error: unknown) => {
    console.error(error);
    await mongoose.disconnect().catch(() => undefined);
    process.exitCode = 1;
});
cd apps/api

STUDYFLOW_BASE_URL="http://127.0.0.1:3000" \
STUDYFLOW_SMOKE_PATH="/api/auth/me" \
STUDYFLOW_SMOKE_USERS="200" \
STUDYFLOW_SMOKE_EXPECTED_STATUS="200" \
STUDYFLOW_SMOKE_SCHOOL_CONTEXT="escola-teste-isolada" \
STUDYFLOW_SMOKE_COOKIE="sf_sid=valor_de_teste_local" \
npm run smoke:200-users