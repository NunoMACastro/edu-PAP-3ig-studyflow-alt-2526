/**
 * Documenta a responsabilidade de infraestrutura comum dentro de real_dev.
 */
import { BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

const FORBIDDEN_PROFILE_FIELDS = new Set(["role", "email", "userId"]);

/**
 * Converte erros de validação globais nos contratos públicos definidos pela MF0.
 *
 * @param errors Erros emitidos pelo `ValidationPipe`.
 * @returns Exceção HTTP pública.
 */
export function mf0ValidationExceptionFactory(
    errors: ValidationError[],
): BadRequestException {
    if (hasForbiddenProfileField(errors)) {
        return new BadRequestException({
            code: "FORBIDDEN_PROFILE_FIELD",
            message: "Este campo não pode ser alterado pelo perfil.",
        });
    }

    return new BadRequestException(flattenValidationMessages(errors));
}

/**
 * Verifica se o pipe rejeitou campos de perfil explicitamente proibidos.
 *
 * @param errors Erros de validação.
 * @returns `true` quando o payload tentou enviar campo proibido.
 */
function hasForbiddenProfileField(errors: ValidationError[]): boolean {
    return errors.some((error) => {
        const rejectedByWhitelist = Boolean(
            error.constraints?.whitelistValidation,
        );
        return (
            rejectedByWhitelist && FORBIDDEN_PROFILE_FIELDS.has(error.property)
        );
    });
}

/**
 * Mantém resposta genérica para erros não especificados pelos guias MF0.
 *
 * @param errors Erros de validação.
 * @returns Mensagens simples para o corpo padrão de `BadRequestException`.
 */
function flattenValidationMessages(errors: ValidationError[]): string[] {
    const messages = errors.flatMap((error) =>
        Object.values(error.constraints ?? {}),
    );
    return messages.length > 0 ? messages : ["Payload inválido."];
}
