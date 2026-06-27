# BK-MF7-02 - Downtime máximo aceitável < 1h/mês.

## Header

- `doc_id`: `GUIA-BK-MF7-02`
- `bk_id`: `BK-MF7-02`
- `macro`: `MF7`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF24`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-03`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais calcular um orçamento mensal de indisponibilidade para a API StudyFlow. O resultado observável é uma função pequena que converte minutos indisponíveis em estado operacional, sem prometer uma plataforma de monitorização externa.

No fim, a equipa consegue demonstrar `RNF24` com código, validação e evidence, sem depender de decisões escondidas nem de memória oral.

#### Importância

`RNF24` é um requisito de fiabilidade. Como a PAP não define fornecedor de monitorização, o guia usa um cálculo local e evidence simples para a equipa conseguir defender se a meta de menos de uma hora por mês está a ser respeitada.

Este BK é incremental: consome contratos já fechados nas MFs anteriores e entrega uma peça pequena, testável e explicável para o próximo BK.

#### Scope-in

- Implementar ou documentar o contrato de disponibilidade mensal.
- Usar caminhos públicos em `apps/api`, `apps/web` e `docs`.
- Validar pelo menos um caminho principal e um cenário negativo.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos quando o fluxo tocar dados privados ou IA.
- Produzir evidence com expected/observed.

#### Scope-out

- Criar requisitos novos fora de `RNF24`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar integrações externas de monitorização, LMS, Drive, OCR, embeddings ou automações avançadas sem contrato documental.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de segurança para o frontend.

#### Estado antes e depois

- Estado antes: MF6 deixa segurança, recuperação, guardrails e isolamento de IA preparados, mas a app ainda não tem cálculo explícito do orçamento mensal de disponibilidade para demonstrar `RNF24`.
- Estado depois: a app passa a ter `evaluateAvailabilityBudget(...)`, testes de limite e handoff para o health service de `BK-MF7-08`, preparando modularidade backend em `BK-MF7-03`.

#### Pre-requisitos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais e limites pedagógicos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.
- **Disponibilidade mensal:** foco técnico deste BK para cumprir `RNF24`.

#### Conceitos teóricos essenciais

- **Downtime:** período em que o serviço principal não responde ao fluxo esperado.
- **Orçamento de erro:** margem máxima aceitável antes de a equipa considerar a meta violada.
- **Métrica agregada:** dado operacional sem identidade de aluno, professor ou material.
- **Erro comum a evitar:** medir disponibilidade por sensação subjetiva em vez de minutos e resultado esperado.
- **Segurança no backend:** sessão, role, ownership e membership são validados por controllers/services, não por componentes visuais.
- **Privacidade e RGPD:** logs, evidence e respostas públicas devem minimizar dados pessoais e evitar conteúdo privado.
- **Teste negativo:** prova que a aplicação bloqueia input inválido, acesso indevido ou estado inseguro.

#### Arquitetura do BK

- Endpoint(s): não cria endpoint; prepara cálculo para health/dashboard operacional.
- Modelo/schema: não cria schema.
- Service(s): função `evaluateAvailabilityBudget`.
- Controller/route: não cria controller.
- Guard/middleware: reutiliza `SessionGuard` quando o endpoint for privado; health e operação pública nunca expõem dados pessoais.
- Cliente API: usa clientes existentes com `credentials: 'include'` quando houver frontend autenticado.
- Segurança/autorização: não usa dados pessoais; trabalha apenas com métricas agregadas.
- Testes: unitários para dentro do limite, no limite e acima do limite.
- Handoff para o próximo BK: `BK-MF7-03` usa esta regra como exemplo de contrato operacional isolado por módulo.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/operations/availability-budget.ts`
- CRIAR: `apps/api/src/common/operations/availability-budget.spec.ts`
- REVER: `apps/api/src/common/observability/structured-event.service.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-02` entrega `RNF24` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF24` em `docs/RNF.md`, confirma a linha `BK-MF7-02` na matriz e regista as decisões seguintes:
- `CANONICO`: `RNF24` define downtime máximo inferior a uma hora por mês.
- `DERIVADO`: usar 60 minutos como limite mensal mensurável.
- `DERIVADO`: devolver estado `HEALTHY`, `WARNING` ou `BREACHED` para evidence simples.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação só começa depois de confirmar o requisito, o domínio e o BK seguinte.

6. Validação do passo.

Resultado esperado: `BK-MF7-02` continua ligado a `RNF24`, `prioridade: P2`, `sprint: S10` e `proximo_bk: BK-MF7-03`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift no relatório de PR.
### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de disponibilidade mensal.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- LOCALIZAÇÃO: módulos já criados nas macrofases anteriores e ponto de integração deste BK.

3. Instruções do que fazer.

Confirma que a MF6 já entregou segurança, recovery e isolamento de IA. Este BK não substitui `SessionGuard`, ownership, membership, quotas ou guardrails; usa essas peças onde existirem.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é evitar duplicação. O aluno deve saber que cada ficheiro novo encaixa num contrato anterior.

6. Validação do passo.

Resultado esperado: lista curta de ficheiros existentes e decisão clara sobre o ponto exato de criação ou edição.

7. Cenário negativo/erro esperado.

Se a solução criar outro endpoint ou outro schema para uma responsabilidade já existente, rejeita a abordagem e usa o service existente.
### Passo 3 - Criar ou editar o contrato principal

1. Objetivo funcional do passo no contexto da app.

Construir o ficheiro principal que torna `RNF24` implementável.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/operations/availability-budget.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/common/operations/availability-budget.ts`.

3. Instruções do que fazer.

Cria o ficheiro com o código abaixo. Mantém nomes, imports e mensagens em português de Portugal. Não guardes dados sensíveis nem deixes decisões de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/operations/availability-budget.ts
/**
 * Estados operacionais permitidos para a meta mensal de disponibilidade.
 *
 * `HEALTHY` significa que a margem operacional ainda é confortável, `WARNING`
 * avisa que a equipa está perto do limite e `BREACHED` marca incumprimento de
 * `RNF24`.
 */
export type AvailabilityStatus = "HEALTHY" | "WARNING" | "BREACHED";

/**
 * Resultado público e agregado da avaliação de disponibilidade.
 *
 * Não inclui emails, userIds, materiais, prompts nem respostas IA porque a
 * disponibilidade mensal é uma métrica operacional, não um dado pessoal.
 */
export type AvailabilityBudgetResult = {
    downtimeMinutes: number;
    limitMinutes: number;
    status: AvailabilityStatus;
};

const MONTHLY_DOWNTIME_LIMIT_MINUTES = 60;

/**
 * Avalia se os minutos de indisponibilidade continuam dentro do RNF24.
 *
 * @param downtimeMinutes Total mensal de minutos indisponíveis.
 * @returns Estado operacional pronto para evidence.
 */
export function evaluateAvailabilityBudget(
    downtimeMinutes: number,
): AvailabilityBudgetResult {
    if (!Number.isFinite(downtimeMinutes) || downtimeMinutes < 0) {
        // Rejeitar valores impossíveis impede evidence enganadora sobre a fiabilidade real da API.
        throw new Error("downtimeMinutes deve ser um número positivo ou zero.");
    }

    // O aviso aos 80% dá tempo para corrigir antes de falhar a meta mensal.
    const warningThreshold = MONTHLY_DOWNTIME_LIMIT_MINUTES * 0.8;
    const status =
        downtimeMinutes >= MONTHLY_DOWNTIME_LIMIT_MINUTES
            ? "BREACHED"
            : downtimeMinutes >= warningThreshold
              ? "WARNING"
              : "HEALTHY";

    return {
        downtimeMinutes,
        limitMinutes: MONTHLY_DOWNTIME_LIMIT_MINUTES,
        status,
    };
}
```

5. Explicação do código.

O código implementa o contrato principal de `BK-MF7-02`: recebe minutos mensais de indisponibilidade e devolve uma decisão operacional estável para cumprir `RNF24`. Os tipos `AvailabilityStatus` e `AvailabilityBudgetResult` têm JSDoc próprio porque são o contrato que outros BKs podem importar, especialmente o health-check previsto em `BK-MF7-08`.

A validação inicial bloqueia números negativos, `NaN` e infinitos para evitar evidence falsa. O comentário junto dessa validação explica o risco operacional: se a equipa aceitasse `-1`, poderia esconder downtime real. O comentário junto do threshold de 80% explica a razão pedagógica do estado `WARNING`: avisar cedo antes de chegar a `BREACHED`.

Os dados de entrada são apenas minutos agregados; a saída tem `downtimeMinutes`, `limitMinutes` e `status`. Não há userId, email, materiais, prompts ou respostas IA, por isso o BK respeita privacidade e RGPD. O aluno pode adaptar o limite se o requisito mudar, mas não deve remover a validação nem criar estados novos sem atualizar testes, handoff e health-check.

6. Validação do passo.

Executa uma leitura técnica do ficheiro e confirma que não há imports inexistentes, dados privados em logs, casts inseguros, payloads sem tipo ou decisões de autorização feitas no frontend.

7. Cenário negativo/erro esperado.

Se removeres a validação ou o comentário didático, o BK fica `PARCIAL`; se a falha expuser dados privados ou permitir mistura de contextos, fica `CRITICO`.
### Passo 4 - Integrar com a aplicação

1. Objetivo funcional do passo no contexto da app.

Ligar o contrato principal ao ponto correto da app sem duplicar módulos.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/operations/availability-budget.ts`
- CRIAR: `apps/api/src/common/operations/availability-budget.spec.ts`
- REVER: `apps/api/src/common/observability/structured-event.service.ts`
- LOCALIZAÇÃO: `apps/api/src/common/operations/availability-budget.ts`, função `evaluateAvailabilityBudget(...)`, e handoff explícito para `apps/api/src/common/health/health.service.ts`, método `getStatus(...)`, criado em `BK-MF7-08`.

3. Instruções do que fazer.

Exporta `evaluateAvailabilityBudget(...)` como contrato operacional puro, sem dependências NestJS. Este BK entrega a função e os testes; `BK-MF7-08` deve consumi-la em `HealthService.getStatus(...)` para calcular se o downtime mensal ultrapassou o limite de 60 minutos.

Quando registares evidence operacional, usa apenas minutos agregados, percentagem e um dos estados devolvidos pela função: `HEALTHY`, `WARNING` ou `BREACHED`. Não guardes emails, userIds, materiais, prompts ou respostas IA.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo; a função completa ficou no Passo 3 e o ponto de consumo fica identificado para o health-check de `BK-MF7-08`.

5. Explicação do código.

Este BK entrega uma função pequena e testável porque disponibilidade mensal é uma regra operacional, não uma entidade de domínio. O ponto de integração fica fechado no futuro `HealthService.getStatus(...)`, evitando dashboards paralelos ou métricas duplicadas.

6. Validação do passo.

Resultado esperado: `availability-budget.spec.ts` prova os casos `HEALTHY`, `WARNING`, `BREACHED` no limite, `BREACHED` acima de 60 minutos/mês e input inválido. O handoff deve dizer que `BK-MF7-08` importa `evaluateAvailabilityBudget(...)` no `HealthService`.

7. Cenário negativo/erro esperado.

Se a integração contornar `SessionGuard`, ownership, membership, quotas ou guardrails já existentes, a alteração deve ser revertida.
### Passo 5 - Adicionar teste ou evidence técnica

1. Objetivo funcional do passo no contexto da app.

Provar que o contrato de `BK-MF7-02` funciona e falha de forma controlada.

2. Ficheiros envolvidos:
- CRIAR/EDITAR: `apps/api/src/common/operations/availability-budget.spec.ts`
- LOCALIZAÇÃO: ficheiro de teste ou evidence `apps/api/src/common/operations/availability-budget.spec.ts`.

3. Instruções do que fazer.

Adiciona o teste/evidence abaixo e garante que existe pelo menos um cenário negativo. Para `P0`, prepara três negativos na PR; para `P1`, dois; para `P2`, um é suficiente.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/operations/availability-budget.spec.ts
import { evaluateAvailabilityBudget } from "./availability-budget.js";

describe("evaluateAvailabilityBudget", () => {
    it("mantem estado saudavel abaixo do aviso operacional", () => {
        // Abaixo do limiar de aviso, a app continua saudável e não deve alarmar a equipa.
        expect(evaluateAvailabilityBudget(30)).toEqual({
            downtimeMinutes: 30,
            limitMinutes: 60,
            status: "HEALTHY",
        });
    });

    it("marca aviso aos 80 por cento do limite mensal", () => {
        expect(evaluateAvailabilityBudget(48)).toEqual({
            downtimeMinutes: 48,
            limitMinutes: 60,
            status: "WARNING",
        });
    });

    it("marca a meta como violada ao atingir uma hora mensal", () => {
        expect(evaluateAvailabilityBudget(60)).toEqual({
            downtimeMinutes: 60,
            limitMinutes: 60,
            status: "BREACHED",
        });
    });

    it("mantem a meta violada acima de uma hora mensal", () => {
        expect(evaluateAvailabilityBudget(90)).toEqual({
            downtimeMinutes: 90,
            limitMinutes: 60,
            status: "BREACHED",
        });
    });

    it("recusa métricas inválidas", () => {
        // Um valor negativo esconderia falhas reais e tornaria a evidence enganadora.
        expect(() => evaluateAvailabilityBudget(-1)).toThrow(
            "downtimeMinutes deve ser um número positivo ou zero.",
        );
    });
});
```

5. Explicação do código.

Este bloco prova os três estados aceites pelo contrato (`HEALTHY`, `WARNING` e `BREACHED`) e a falha controlada para uma métrica impossível. A evidence não deve conter materiais privados, respostas completas de IA, cookies, credenciais ou dados de outro aluno.

6. Validação do passo.

Comando recomendado: `npm --prefix apps/api test -- availability-budget.spec.ts` quando o ficheiro for teste backend; para frontend, executa `npm --prefix apps/web run build`.

7. Cenário negativo/erro esperado.

Se o teste só confirmar que a função existe, sem validar comportamento ou erro esperado, não é evidence suficiente.
### Passo 6 - Validar por camada

1. Objetivo funcional do passo no contexto da app.

Confirmar que backend, frontend, documentação e evidence estão alinhados.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF7`
- LOCALIZAÇÃO: comandos de validação e PR.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Matriz minima de testes por prioridade: `P0` exige unit, integração e 3 negativos; `P1` exige unit ou integração e 2 negativos; `P2` exige teste focal e 1 negativo. Evidencia de testes por camada: backend, frontend, documentação e smoke quando existir endpoint.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a validação é operacional. O valor está em comparar resultado esperado e observado de forma objetiva.

6. Validação do passo.

Resultados esperados: testes verdes ou bloqueio explicado; nenhum comando deve depender de segredos locais para passar.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se falhar por dívida externa, regista o caminho e o erro exato.
### Passo 7 - Preparar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-02` com prova técnica e instrução clara para `BK-MF7-03`.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md`
- LOCALIZAÇÃO: secções finais do guia e descrição da PR.

3. Instruções do que fazer.

No PR, inclui comandos executados, resultado principal, negativos, risco restante e o que o próximo BK passa a poder reutilizar. Se o BK tocar IA, inclui prova de fontes/contexto; se tocar operação, inclui prova de health, logs ou readiness.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque o foco é comunicação técnica. A equipa deve conseguir defender a decisão sem pedir contexto extra ao professor.

6. Validação do passo.

Resultado esperado: evidence completa e handoff explícito para `BK-MF7-03`.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', sem output, request/response, teste ou screenshot, não cumpre o BK.

#### Critérios de aceite

- `RNF24` fica demonstrável por código, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- A nomenclatura de estado fica única: `HEALTHY`, `WARNING` e `BREACHED`.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.
- Os negativos mínimos respeitam a prioridade `P2`.

#### Validação final

- Executar pesquisa textual nos BKs MF7 para confirmar ausência de linguagem interna e caminhos privados.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Quando houver teste backend, executar `npm --prefix apps/api test -- availability-budget.spec.ts`.
- Quando houver frontend, executar `npm --prefix apps/web run build`.
- Resultado esperado: comandos verdes ou falha externa registada com caminho, comando e erro observado.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-02`.
- `proof_tecnico`: comando executado, output relevante ou request/response do caminho principal.
- `proof_negativos`: erro controlado do cenário negativo exigido.
- `proof_fontes`: para IA, lista de `sourceLabel`, `locator` e excerto limitado.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF24` melhora a aplicação para alunos, professores ou operação.

#### Handoff

`BK-MF7-03` usa esta regra como exemplo de contrato operacional isolado por módulo.

O próximo BK deve reutilizar os ficheiros e decisões deste guia, sem criar outro contrato para a mesma responsabilidade.

#### Changelog

- `2026-06-26`: estados de disponibilidade alinhados com o código e testes completados para `HEALTHY`, `WARNING`, `BREACHED` e input inválido.
- `2026-06-26`: contrato de disponibilidade mensal documentado com tutorial técnico linear, código completo, validação, negativos, evidence e caminhos públicos `apps/...`.
