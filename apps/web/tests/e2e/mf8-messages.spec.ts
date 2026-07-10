/**
 * Valida o catálogo local de mensagens da MF8 sem depender de sessão, API ou browser real.
 */
import { expect, test } from "@playwright/test";

import {
    isMessageKey,
    messageKeys,
    t,
    tOrDefault,
} from "../../src/lib/messages.js";

test.describe("MF8 message catalog", () => {
    test("resolve chaves conhecidas do catálogo", () => {
        expect(t(messageKeys.guardrailsSubmit)).toBe("Validar");
        expect(t(messageKeys.sourceSubmit)).toBe("Responder com fontes");
        expect(t(messageKeys.sourceCitationsTitle)).toBe("Fontes usadas:");
    });

    test("distingue chaves conhecidas e desconhecidas", () => {
        expect(isMessageKey(messageKeys.guardrailsTitle)).toBe(true);
        expect(isMessageKey("missing.key")).toBe(false);
    });

    test("usa fallback seguro para chave dinâmica desconhecida", () => {
        // O fallback impede que uma chave técnica apareça diretamente na interface.
        expect(tOrDefault("missing.key")).toBe("Mensagem indisponível.");
    });

    test("mantém a decisão de catálogo local sem dependência i18n externa", () => {
        expect(t(messageKeys.guardrailsLoading)).toBe("A validar...");
        expect(t(messageKeys.sourceLoading)).toBe("A responder...");
    });
});
