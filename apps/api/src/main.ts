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
import { RequireHttpsMiddleware } from "./common/middleware/require-https.middleware.js";
import { mf0ValidationExceptionFactory } from "./common/validation/mf0-validation-exception.factory.js";

/**
 * Arranca a API StudyFlow com os contratos transversais usados pela MF0 e MF6.
 *
 * @returns Promise resolvida quando o servidor HTTP estiver a escutar.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.use(csrfMiddleware);

    const requireHttps = new RequireHttpsMiddleware();
    // O bloqueio HTTPS fica antes das rotas para impedir que controllers processem tráfego inseguro.
    app.use(requireHttps.use.bind(requireHttps));

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