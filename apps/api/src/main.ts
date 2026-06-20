/**
 * Arranca a aplicação e liga a configuração global necessária ao runtime.
 */
import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { csrfMiddleware } from "./common/middleware/csrf.middleware.js";
import { mf0ValidationExceptionFactory } from "./common/validation/mf0-validation-exception.factory.js";

/**
 * Arranca a API StudyFlow com os contratos transversais usados pela MF0.
 *
 * O bootstrap configura cookies porque o BK-MF0-02 exige sessões HttpOnly.
 * Também ativa CORS com credenciais para permitir que o frontend envie o
 * cookie de sessão sem recorrer a localStorage.
 *
 * @returns Promise resolvida quando o servidor HTTP estiver a escutar.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.use(csrfMiddleware);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
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
