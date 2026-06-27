/**
 * Regista providers, controllers e schemas necessários ao módulo de auth.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Redis } from "ioredis";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { UsersService } from "../users/users.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { LoginAttemptsService } from "./login-attempts.service.js";
import { PasswordHashingService } from "./password-hashing.service.js";
import { SessionService, SESSION_REDIS } from "./session.service.js";
import { createInMemorySessionStore } from "./session-store.js";
import { User, UserSchema } from "./schemas/user.schema.js";

/**
 * Módulo de autenticação.
 *
 * Exporta `SessionService`, `SessionGuard` e `UsersService` porque os BKs
 * seguintes precisam de proteger rotas e resolver o utilizador autenticado.
 */
@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        PasswordHashingService,
        LoginAttemptsService,
        UsersService,
        SessionService,
        SessionGuard,
        {
            provide: SESSION_REDIS,
            /**
             * Cria o store usado pelas sessões.
             *
             * @returns Instância `ioredis` ou store volátil exclusivo dos E2E.
             */
            useFactory: () => {
                if (
                    process.env.STUDYFLOW_E2E_IN_MEMORY_REDIS === "true" &&
                    process.env.NODE_ENV !== "production"
                ) {
                    return createInMemorySessionStore();
                }

                return new Redis(
                    process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
                );
            },
        },
    ],
    exports: [
        AuthService,
        PasswordHashingService,
        UsersService,
        SessionService,
        SessionGuard,
    ],
})
export class AuthModule {}
