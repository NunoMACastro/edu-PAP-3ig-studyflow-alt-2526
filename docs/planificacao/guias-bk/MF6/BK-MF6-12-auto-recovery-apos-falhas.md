# BK-MF6-12 - Auto-recovery após falhas.

## Header

- `doc_id`: `GUIA-BK-MF6-12`
- `bk_id`: `BK-MF6-12`
- `macro`: `MF6`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF22`
- `fase_documental`: `Fase 3`
- `sprint`: `S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-01`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `last_updated`: `2026-06-23`

#### Objetivo

Neste BK vais criar uma camada pequena de recovery para falhas transitórias, integrada no fluxo real de indexação de materiais por URL.

No fim, a API consegue repetir uma leitura externa quando a falha é temporária, mas continua a falhar de forma explícita quando o erro é permanente, inseguro ou não idempotente.

#### Importância

`RNF22` é canónico nos requisitos não funcionais e protege a aplicação contra pequenas quebras de rede, timeouts e respostas temporárias de serviços externos. Este BK não deve esconder falhas reais: recovery bom melhora continuidade, recovery mal aplicado cria duplicações, confusão e riscos de segurança.

Este guia prepara `BK-MF7-01` porque deixa eventos e erros com nomes estáveis para logs estruturados, sem implementar a observabilidade completa neste momento.

#### Scope-in

- Criar helper partilhado `retryWithRecovery` em `apps/api`.
- Validar limites de tentativas e delays.
- Integrar o helper no fluxo recuperável de `MaterialIndexService.fetchTextFromUrl`.
- Repetir apenas leitura externa idempotente; não repetir escritas, pagamentos, criação de dados ou operações com efeitos laterais.
- Criar testes unitários com cenário principal e pelo menos 2 negativos.
- Manter ownership, membership, sessão HttpOnly e validação backend intactos.

#### Scope-out

- Alterar endpoints públicos de material index.
- Alterar regras de autorização, ownership ou membership.
- Repetir operações de escrita sem idempotência comprovada.
- Criar logs estruturados completos de MF7.
- Adicionar dependências npm.
- Guardar conteúdo de materiais, cookies, segredos ou respostas privadas em logs/evidence.

#### Estado antes e depois

- Estado antes: `MaterialIndexService` faz validação de URL, DNS pinning, timeout e limites, mas uma falha transitória em `requestText` termina imediatamente a operação.
- Estado depois: a leitura externa tem retry controlado para erros temporários, com limites claros e testes que provam que erros permanentes continuam explícitos.

#### Pre-requisitos

- `README.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `apps/api/src/modules/material-index/material-index.service.ts`
- `apps/api/jest.config.cjs`

#### Glossário

- **Recovery:** tentativa controlada de recuperar uma operação que falhou por causa temporária.
- **Falha transitória:** erro de rede, timeout ou HTTP temporário que pode desaparecer numa tentativa seguinte.
- **Falha permanente:** erro de validação, autorização, URL privada ou input inválido que não deve ser repetido.
- **Idempotência:** propriedade de uma operação que pode ser repetida sem criar efeitos duplicados.
- **Backoff:** espera progressiva entre tentativas para evitar pressionar serviços externos.
- **Erro público:** mensagem curta e segura para API, UI, teste e evidence.

#### Conceitos teóricos essenciais

- **Retry tem de ter limites:** sem limite de tentativas e delay, a API pode ficar presa ou pressionar recursos externos.
- **Nem tudo deve ser repetido:** leituras GET são candidatas; escritas e criação de dados exigem idempotência formal.
- **Erros permanentes continuam permanentes:** URL privada, `localhost`, HTTP 400 e falhas de autorização não devem ser mascaradas.
- **Recovery deve ser observável:** antes de MF7, já deixamos nomes de eventos e códigos que logs estruturados poderão consumir.
- **Segurança vem antes da disponibilidade:** se a URL resolver para rede privada, o fluxo falha imediatamente mesmo que isso prejudique a conclusão do job.

#### Arquitetura do BK

- Endpoint(s): não cria endpoint público.
- Modelo/schema: não cria schema novo.
- Helper: `apps/api/src/common/reliability/retry-with-recovery.ts`.
- Integração: `apps/api/src/modules/material-index/material-index.service.ts`, no método `fetchTextFromUrl`.
- Segurança: retry fica depois da validação de URL e DNS público; nunca contorna ownership ou membership.
- Testes: `apps/api/src/common/reliability/retry-with-recovery.spec.ts`.
- Handoff para MF7: nomes `RECOVERY_RETRY_SCHEDULED` e `RECOVERY_RETRY_EXHAUSTED` ficam documentados para logs estruturados.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/reliability/retry-with-recovery.ts`
- CRIAR: `apps/api/src/common/reliability/retry-with-recovery.spec.ts`
- EDITAR: `apps/api/src/modules/material-index/material-index.service.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-12` entrega `RNF22` sem alterar IDs, owner, sprint, prioridade ou sequência da matriz.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`

3. Instruções do que fazer.

Confirma que `RNF22` corresponde a auto-recovery após falhas e que a linha canónica mantém `P1`, `S09`, `Core` e `proximo_bk: BK-MF7-01`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa fronteiras. A implementação só pode repetir operações que o domínio aceite repetir.

6. Validação do passo.

Regista na tua nota de PR: `RNF22 confirmado; BK-MF6-12 continua P1/S09/Core e entrega para BK-MF7-01`.

7. Cenário negativo/erro esperado.

Se alguém tentar mover autorização para o frontend ou repetir uma operação de escrita sem idempotência, rejeita a alteração.

### Passo 2 - Escolher o ponto real de recovery

1. Objetivo funcional do passo no contexto da app.

Escolher um fluxo onde retry é útil, seguro e fácil de provar.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/modules/material-index/material-index.service.ts`
- REVER: `apps/api/src/modules/material-index/material-index.module.ts`

3. Instruções do que fazer.

Usa `fetchTextFromUrl`, porque é uma leitura externa com timeout, limite de tamanho, DNS público e validação de conteúdo. Não uses retry em `createJob`, `markIndexedText`, autenticação, permissões ou criação de documentos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

`fetchTextFromUrl` já valida URL e rede privada. O retry entra apenas na chamada externa `materialIndexUrlSafety.requestText`, depois da resolução pública e antes da validação final de status/conteúdo.

6. Validação do passo.

Confirma que a integração não altera os métodos `assertOwnedJob`, `assertReadableJob`, `indexPrivateMaterial` nem `indexOfficialMaterial`.

7. Cenário negativo/erro esperado.

Se o erro for URL local, DNS privado, HTTP 400 ou tipo de conteúdo inválido, não deve haver tentativa extra.

### Passo 3 - Criar helper principal de recovery

1. Objetivo funcional do passo no contexto da app.

Criar um helper pequeno, validado e reutilizável para operações recuperáveis.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/reliability/retry-with-recovery.ts`

3. Instruções do que fazer.

Cria a pasta `apps/api/src/common/reliability` e adiciona o ficheiro completo abaixo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/reliability/retry-with-recovery.ts
export type RetryRecoveryEvent = {
    code: "RECOVERY_RETRY_SCHEDULED" | "RECOVERY_RETRY_EXHAUSTED";
    attempt: number;
    maxAttempts: number;
    delayMs: number;
    errorMessage: string;
};

export type RetryWithRecoveryOptions = {
    attempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    shouldRetry: (error: unknown, attempt: number) => boolean;
    sleep?: (delayMs: number) => Promise<void>;
    onEvent?: (event: RetryRecoveryEvent) => void | Promise<void>;
};

/**
 * Executa uma operação recuperável com limites explícitos de tentativas e backoff.
 *
 * @param operation Operação idempotente que pode ser repetida quando a falha é transitória.
 * @param options Configuração de limites, espera e decisão de retry.
 * @returns Resultado da operação quando uma tentativa termina com sucesso.
 */
export async function retryWithRecovery<T>(
    operation: () => Promise<T>,
    options: RetryWithRecoveryOptions,
): Promise<T> {
    const config = validateRetryOptions(options);

    for (let attempt = 1; attempt <= config.attempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            const canRetry = attempt < config.attempts && config.shouldRetry(error, attempt);
            if (!canRetry) {
                if (attempt > 1) {
                    await config.onEvent?.({
                        code: "RECOVERY_RETRY_EXHAUSTED",
                        attempt,
                        maxAttempts: config.attempts,
                        delayMs: 0,
                        errorMessage: toPublicErrorMessage(error),
                    });
                }
                throw error;
            }

            const delayMs = Math.min(config.baseDelayMs * attempt, config.maxDelayMs);
            await config.onEvent?.({
                code: "RECOVERY_RETRY_SCHEDULED",
                attempt,
                maxAttempts: config.attempts,
                delayMs,
                errorMessage: toPublicErrorMessage(error),
            });
            await config.sleep(delayMs);
        }
    }

    throw new Error("Operação recuperável terminou sem resultado.");
}

/**
 * Valida limites para impedir retry infinito ou configuração perigosa.
 *
 * @param options Configuração recebida pelo chamador.
 * @returns Configuração com sleep por defeito.
 */
export function validateRetryOptions(
    options: RetryWithRecoveryOptions,
): Required<RetryWithRecoveryOptions> {
    if (!Number.isInteger(options.attempts) || options.attempts < 1 || options.attempts > 5) {
        throw new Error("attempts deve ser um inteiro entre 1 e 5.");
    }
    if (!Number.isInteger(options.baseDelayMs) || options.baseDelayMs < 0 || options.baseDelayMs > 5_000) {
        throw new Error("baseDelayMs deve ser um inteiro entre 0 e 5000.");
    }
    if (!Number.isInteger(options.maxDelayMs) || options.maxDelayMs < options.baseDelayMs || options.maxDelayMs > 10_000) {
        throw new Error("maxDelayMs deve ser maior ou igual a baseDelayMs e no máximo 10000.");
    }

    return {
        ...options,
        sleep: options.sleep ?? defaultSleep,
        onEvent: options.onEvent ?? (() => undefined),
    };
}

/**
 * Identifica erros temporários de rede que podem ser repetidos em leituras idempotentes.
 *
 * @param error Erro capturado pela operação.
 * @returns `true` apenas para falhas transitórias conhecidas.
 */
export function isTransientNetworkError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return [
        "econnreset",
        "etimedout",
        "timeout",
        "tempor",
        "socket hang up",
        "transient_http_502",
        "transient_http_503",
        "transient_http_504",
    ].some((term) => message.includes(term));
}

/**
 * Converte erros para mensagem curta, sem stack trace nem dados internos.
 *
 * @param error Erro original.
 * @returns Mensagem segura para testes, eventos e evidence.
 */
function toPublicErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message.slice(0, 300);
    }
    return "Falha recuperável sem mensagem pública.";
}

/**
 * Espera assíncrona usada quando o chamador não injeta sleep em teste.
 *
 * @param delayMs Milissegundos a aguardar antes da próxima tentativa.
 */
function defaultSleep(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}
```

5. Explicação do código.

O helper valida limites antes da operação, decide se cada erro pode ser repetido e emite eventos seguros. `attempts` nunca passa de 5, e `maxDelayMs` impede esperas demasiado longas.

6. Validação do passo.

Executa `npm --prefix apps/api run build` para confirmar imports ESM e tipos.

7. Cenário negativo/erro esperado.

Chamar `retryWithRecovery` com `attempts: 0` deve lançar erro de configuração antes de executar a operação.

### Passo 4 - Integrar no MaterialIndexService

1. Objetivo funcional do passo no contexto da app.

Aplicar recovery no ponto real de leitura externa sem contornar as validações de segurança já existentes.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/material-index/material-index.service.ts`

3. Instruções do que fazer.

Adiciona o import abaixo junto dos imports de `common` e troca o método `fetchTextFromUrl` pela versão completa desta secção. O resto do service mantém-se igual.

4. Código completo, correto e integrado com a app final.

```ts
import {
    isTransientNetworkError,
    retryWithRecovery,
} from "../../common/reliability/retry-with-recovery.js";
```

```ts
private async fetchTextFromUrl(value: string | undefined): Promise<string> {
    let url = this.parseSafeHttpUrl(value);
    let response: PinnedTextResponse | undefined;

    for (let redirectCount = 0; redirectCount <= MAX_URL_REDIRECTS; redirectCount += 1) {
        // Cada redirect é revalidado para impedir que uma URL pública salte para rede privada.
        const resolvedHost = await this.resolvePublicHost(url);
        response = await retryWithRecovery(
            async () => {
                const candidate = await materialIndexUrlSafety.requestText(url, resolvedHost);
                if ([502, 503, 504].includes(candidate.status)) {
                    throw new Error(`TRANSIENT_HTTP_${candidate.status}`);
                }
                return candidate;
            },
            {
                attempts: 3,
                baseDelayMs: 200,
                maxDelayMs: 1_000,
                shouldRetry: (error) => this.isRecoverableUrlReadError(error),
            },
        );

        if (
            response.remoteAddress &&
            this.isPrivateIp(response.remoteAddress)
        ) {
            // A verificação pós-ligação cobre divergências entre DNS resolvido e socket final.
            throw new Error("URL ligou a rede local ou privada.");
        }
        if (!this.isRedirect(response.status)) break;

        const location = this.getHeaderValue(response.headers.location);
        if (!location) {
            throw new Error("Redirect sem destino válido.");
        }
        if (redirectCount === MAX_URL_REDIRECTS) {
            throw new Error("URL excede o limite de redirects permitido.");
        }
        url = this.parseSafeHttpUrl(new URL(location, url).toString());
    }

    if (!response) {
        throw new Error("Não foi possível obter a URL.");
    }
    if (response.status < 200 || response.status >= 300) {
        throw new Error(`URL devolveu HTTP ${response.status}`);
    }
    const contentLength = Number(
        this.getHeaderValue(response.headers["content-length"]) ?? 0,
    );
    if (contentLength > MAX_URL_TEXT_BYTES) {
        throw new Error("URL excede o tamanho máximo permitido para indexação.");
    }
    const contentType =
        this.getHeaderValue(response.headers["content-type"]) ?? "";
    if (
        contentType &&
        !/(text\/|application\/json|application\/xml|application\/xhtml\+xml)/i.test(
            contentType,
        )
    ) {
        // A indexação pedagógica só aceita texto; binários ficam fora para evitar parsing inseguro.
        throw new Error("URL não devolveu conteúdo textual indexável.");
    }
    if (Buffer.byteLength(response.body, "utf8") > MAX_URL_TEXT_BYTES) {
        throw new Error("URL excede o tamanho máximo permitido para indexação.");
    }
    return this.stripHtml(response.body).trim();
}

private isRecoverableUrlReadError(error: unknown): boolean {
    return isTransientNetworkError(error);
}
```

5. Explicação do código.

O retry só envolve a leitura externa. A URL continua a ser validada antes da chamada e a resposta continua sujeita às mesmas verificações depois da chamada. HTTP 502, 503 e 504 são tratados como falhas temporárias; HTTP 400, URL privada e conteúdo não textual continuam a falhar sem repetição.

6. Validação do passo.

Executa `npm --prefix apps/api run build` e confirma que o import usa `.js`, como os restantes ficheiros ESM do projeto.

7. Cenário negativo/erro esperado.

Testa uma URL `http://localhost:3000`. O erro esperado continua a ser rejeição imediata por URL local ou privada, sem tentativa adicional.

### Passo 5 - Adicionar teste e negativos obrigatórios

1. Objetivo funcional do passo no contexto da app.

Provar que o helper repete falhas transitórias, mas não esconde falhas permanentes.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/reliability/retry-with-recovery.spec.ts`

3. Instruções do que fazer.

Cria o teste completo abaixo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/reliability/retry-with-recovery.spec.ts
import {
    isTransientNetworkError,
    retryWithRecovery,
    validateRetryOptions,
} from "./retry-with-recovery.js";

describe("retryWithRecovery", () => {
    it("repete falha transitória e devolve sucesso", async () => {
        let calls = 0;
        // Os eventos provam que o retry é observável pela MF7 sem registar dados privados.
        const events: string[] = [];

        const result = await retryWithRecovery(
            async () => {
                calls += 1;
                if (calls === 1) {
                    throw new Error("ECONNRESET");
                }
                return "ok";
            },
            {
                attempts: 3,
                baseDelayMs: 1,
                maxDelayMs: 5,
                // Só erros transitórios podem ser repetidos; erros de segurança não entram em retry.
                shouldRetry: isTransientNetworkError,
                sleep: async () => undefined,
                onEvent: async (event) => {
                    events.push(event.code);
                },
            },
        );

        expect(result).toBe("ok");
        expect(calls).toBe(2);
        expect(events).toEqual(["RECOVERY_RETRY_SCHEDULED"]);
    });

    it("não repete erro permanente", async () => {
        let calls = 0;

        await expect(
            retryWithRecovery(
                async () => {
                    calls += 1;
                    // URL privada é erro permanente: repetir poderia mascarar uma tentativa insegura.
                    throw new Error("URL local ou privada não pode ser indexada.");
                },
                {
                    attempts: 3,
                    baseDelayMs: 1,
                    maxDelayMs: 5,
                    shouldRetry: isTransientNetworkError,
                    sleep: async () => undefined,
                },
            ),
        ).rejects.toThrow("URL local ou privada");

        expect(calls).toBe(1);
    });

    it("para no limite de tentativas", async () => {
        let calls = 0;

        await expect(
            retryWithRecovery(
                async () => {
                    calls += 1;
                    // Mesmo erro transitório tem limite para evitar loops infinitos em falhas externas.
                    throw new Error("ETIMEDOUT");
                },
                {
                    attempts: 2,
                    baseDelayMs: 1,
                    maxDelayMs: 5,
                    shouldRetry: isTransientNetworkError,
                    sleep: async () => undefined,
                },
            ),
        ).rejects.toThrow("ETIMEDOUT");

        expect(calls).toBe(2);
    });

    it("rejeita configuração sem tentativas válidas", () => {
        // Configuração inválida falha antes de executar a operação, evitando recovery mal definido.
        expect(() =>
            validateRetryOptions({
                attempts: 0,
                baseDelayMs: 1,
                maxDelayMs: 5,
                shouldRetry: isTransientNetworkError,
            }),
        ).toThrow("attempts");
    });
});
```

5. Explicação do código.

O primeiro teste prova recovery de falha transitória. Os negativos provam que erro permanente não é repetido, que o limite de tentativas é respeitado e que configuração inválida falha cedo.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit -- retry-with-recovery.spec.ts`.

7. Cenário negativo/erro esperado.

Troca temporariamente `shouldRetry` para devolver sempre `true` e confirma que o teste de erro permanente falha. Isto prova que o teste protege a regra de segurança.

### Passo 6 - Preparar evidence técnica e pedagógica

1. Objetivo funcional do passo no contexto da app.

Guardar prova suficiente para PR, apresentação e defesa PAP.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/common/reliability/retry-with-recovery.ts`
- REVER: `apps/api/src/common/reliability/retry-with-recovery.spec.ts`
- REVER: `apps/api/src/modules/material-index/material-index.service.ts`

3. Instruções do que fazer.

Regista comandos executados, resultado observado, cenário negativo e interpretação curta. Não copies conteúdo de materiais, cookies, URI completas, prompts privados, respostas IA privadas ou dados pessoais.

4. Código completo, correto e integrado com a app final.

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- retry-with-recovery.spec.ts
```

5. Explicação do código.

O build valida integração TypeScript/ESM. O teste valida comportamento de recovery e negativos sem depender de rede externa.

6. Validação do passo.

A evidence deve indicar quantas tentativas aconteceram no teste positivo e que os negativos falharam de forma controlada.

7. Cenário negativo/erro esperado.

Uma URL local ou privada deve continuar a falhar antes do retry. Se o retry contornar essa regra, o BK deve ser reaberto.

### Passo 7 - Fechar handoff para MF7

1. Objetivo funcional do passo no contexto da app.

Entregar a `BK-MF7-01` um contrato claro de eventos e erros para logs estruturados.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`

3. Instruções do que fazer.

Regista no PR que o helper emite `RECOVERY_RETRY_SCHEDULED` e `RECOVERY_RETRY_EXHAUSTED`. Em MF7, estes eventos podem ganhar logger estruturado sem alterar a regra de retry.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fecha continuidade. MF6 entrega comportamento; MF7 entrega observabilidade.

6. Validação do passo.

Confirma que `BK-MF7-01` existe e que o handoff menciona eventos, helper, testes e risco de idempotência.

7. Cenário negativo/erro esperado.

Se o helper não emitir nomes de eventos estáveis, MF7 terá de reinterpretar o comportamento. Volta ao passo 3 e completa o contrato.

#### Critérios de aceite

- `RNF22` tem helper backend verificável em `apps/api`.
- `retryWithRecovery` valida tentativas e delays.
- A integração ocorre numa leitura externa idempotente de `MaterialIndexService`.
- Erros permanentes e regras de segurança não são repetidos.
- Existem testes com cenário principal e pelo menos 2 negativos.
- O build valida imports ESM com `.js`.
- A evidence inclui comando, resultado observado, negativos e interpretação curta.
- O handoff para `BK-MF7-01` lista eventos e riscos residuais.

#### Validação final

- `npm --prefix apps/api run build`
- `npm --prefix apps/api run test:unit -- retry-with-recovery.spec.ts`
- Cenário negativo: URL local ou privada deve falhar antes do retry
- Cenário negativo: configuração `attempts: 0` deve falhar antes de executar a operação

#### Evidence para PR/defesa

- pr: referência do PR ou commit com o BK implementado.
- proof_tecnico: output do build e do teste unitário.
- proof_negativos: erro permanente sem retry, limite de tentativas e configuração inválida.
- proof_privacidade: confirmação de que eventos não incluem conteúdo de materiais, cookies, URI completas ou dados pessoais.
- proof_handoff: nota curta a explicar como `BK-MF7-01` usa `RECOVERY_RETRY_SCHEDULED` e `RECOVERY_RETRY_EXHAUSTED`.

#### Handoff

- Entrega para `BK-MF7-01`: helper `retryWithRecovery`, detector `isTransientNetworkError`, eventos `RECOVERY_RETRY_SCHEDULED` e `RECOVERY_RETRY_EXHAUSTED`, testes positivos e negativos.
- Decisão DERIVADO registada: aplicar recovery apenas a leitura externa idempotente em `fetchTextFromUrl`.
- Risco residual: antes de aplicar o helper noutros fluxos, confirmar idempotência e impacto operacional de cada operação.
- Não há alteração de RF/RNF nem mudança de matriz nesta entrega.

#### Changelog

- `2026-06-23`: guia corrigido com helper validado, integração completa em leitura externa, testes P1 com negativos e handoff explícito para MF7.
