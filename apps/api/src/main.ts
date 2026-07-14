/**
 * Arranca a aplicação e liga a configuração global necessária ao runtime.
 */
import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { loadRuntimeConfig } from "./common/config/runtime-config.js";
import { csrfMiddleware } from "./common/middleware/csrf.middleware.js";
import { RequireHttpsMiddleware } from "./common/middleware/require-https.middleware.js";
import { securityHeadersMiddleware } from "./common/middleware/security-headers.middleware.js";
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
    const runtimeConfig = loadRuntimeConfig();
    const app = await NestFactory.create(AppModule);

    // A instância PAP é local e não aceita headers de proxy como fonte de verdade.
    app.getHttpAdapter().getInstance().set("trust proxy", runtimeConfig.trustProxy);

    app.use(new RequireHttpsMiddleware().use);
    app.use(securityHeadersMiddleware);
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
        origin: runtimeConfig.webOrigin,
        credentials: true,
    });

    await app.listen(runtimeConfig.port, runtimeConfig.host);
}

void bootstrap();
