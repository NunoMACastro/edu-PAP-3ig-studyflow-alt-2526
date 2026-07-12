/**
 * Fixture mínima partilhada pelos testes de serviços que não inspecionam a
 * governança diretamente. Mantém o provider falso atrás da fronteira real.
 */
import { AiConsentPurpose } from "../ai-consents/schemas/ai-consent.schema.js";
import { GovernedAiExecutionService } from "./governed-ai-execution.service.js";
import { AiProvider } from "./providers/ai-provider.js";

/**
 * Cria uma fachada funcional com gates permissivos exclusivos de testes.
 *
 * @param provider Provider parcial configurado pelo cenário.
 * @returns Fachada real com consentimento, policy e quota determinísticos.
 */
export function createGovernedAiExecutionFixture(
    provider: Partial<AiProvider>,
): GovernedAiExecutionService {
    return new GovernedAiExecutionService(
        provider as AiProvider,
        { assertGranted: async () => undefined } as never,
        {
            resolveForUse: async (purpose: AiConsentPurpose) => ({
                purpose,
                enabled: true,
                provider: "test",
                model: "test-model",
                timeoutMs: 4000,
                maxSourceCount: 10,
                maxPromptChars: 12000,
            }),
        } as never,
        { reserveUsage: async () => ({ usedUnits: 1 }) } as never,
        { record: async () => undefined } as never,
    );
}
