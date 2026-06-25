// apps/api/src/main.ts
/**
 * Arranca a aplicação e liga a configuração global necessária ao runtime.
 */
import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { csrfMiddleware } from "./common/middleware/csrf.middleware.js";
import { securityHeadersMiddleware } from "./common/middleware/security-headers.middleware.js";
import { mf0ValidationExceptionFactory } from "./common/validation/mf0-validation-exception.factory.js";

/**
 * Arranca a API StudyFlow com proteções transversais de sessão e validação.
 *
 * @returns Promise resolvida quando o servidor HTTP estiver pronto.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    // Headers defensivos devem ser globais para cobrir todos os endpoints da API.
    app.use(securityHeadersMiddleware);
    app.use(cookieParser());
    app.use(csrfMiddleware);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            // A factory mantém mensagens de validação controladas e sem expor dados sensíveis.
            exceptionFactory: mf0ValidationExceptionFactory,
        }),
    );
    app.enableCors({
        origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
        credentials: true,
    });

    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
}

void bootstrap();