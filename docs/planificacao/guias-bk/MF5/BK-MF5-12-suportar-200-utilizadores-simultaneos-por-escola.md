# BK-MF5-12 - Suportar ≥ 200 utilizadores simultâneos por escola.

## Header

- `doc_id`: `GUIA-BK-MF5-12`
- `bk_id`: `BK-MF5-12`
- `macro`: `MF5`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF10`
- `fase_documental`: `Fase 2`
- `sprint`: `S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-01`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- `last_updated`: `2026-06-18`

#### Objetivo

Neste BK vais criar smoke de concorrência para 200 utilizadores simultâneos por escola em ambiente de teste.

#### Importância

`RNF10` dá prova inicial de escalabilidade sem substituir teste de carga profissional.

#### Scope-in

- Criar script Node com `fetch` nativo.
- Medir média, p95 e falhas 5xx.
- Usar endpoint existente e seguro.

#### Scope-out

- Alterar contratos de autenticação, materiais, turmas, salas ou IA.
- Mover autorização, ownership ou membership para o frontend.
- Adicionar dependências novas sem justificação explícita.

#### Estado antes e depois

- **Antes:** não há comando repetível para simular 200 pedidos concorrentes.
- **Depois:** existe script configurável e sem exposição de dados sensíveis.

#### Pre-requisitos

- Ler RF/RNF do header, matriz, backlog, MF-VIEWS e BKs anteriores.
- Rever páginas, componentes e services reais em `real_dev`.
- Confirmar que a alteração preserva sessão, ownership, membership e validação backend.

#### Glossário

- **Concorrência:** pedidos executados ao mesmo tempo.
- **Smoke test:** teste rápido para detectar falhas grandes.

#### Conceitos teóricos essenciais

- **Contrato incremental:** cada BK consome contratos anteriores e entrega ficheiros, funções ou práticas que o BK seguinte consegue reutilizar sem redefinir a mesma responsabilidade.
- **Sessão autenticada:** a identidade real vem do backend e do cookie HttpOnly; o frontend nunca decide `userId`, role, ownership ou membership.
- **Autorização no backend:** permissões e ownership/membership são validados por controller/service antes de ler ou alterar dados de aluno, professor, sala, turma ou disciplina.
- **Estado React:** valores, loading, erro, vazio e sucesso permitem explicar ao utilizador o que está a acontecer durante chamadas assíncronas.
- **Evidence técnico:** comandos, prints e resultados observáveis provam a entrega para PR e defesa.
- **fetch nativo:** evita dependência nova.
- **Ambiente de teste:** nunca usa produção nem cookies pessoais.

#### Arquitetura do BK

Script recebe URL, path, cookie de teste e número de utilizadores por variáveis de ambiente.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/src/scripts/smoke-200-users.mjs` - Script de concorrência.
- EDITAR: `real_dev/api/package.json` - Script npm.
- REVER: `auth.controller.ts` - Endpoint barato.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e dependências

1. Objetivo funcional do passo no contexto da app.

Confirmar a regra documental de `RNF10` e a posição de `BK-MF5-12` na sequência MF5.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md` ou `docs/RNF.md` conforme o header
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - LOCALIZAÇÃO: linha canónica de `BK-MF5-12`

3. Instruções do que fazer.

Lê documentos canónicos e confirma que a entrega não muda requisitos, endpoints ou roles fora do escopo.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou preparatório, porque fixa contrato e validações antes de alterar a aplicação.

5. Explicação do código.

Este passo não altera código porque fecha a regra funcional antes da implementação. A decisão evita que o BK invente endpoint, entidade ou comportamento fora dos documentos oficiais.

6. Validação do passo.

Confirma que o header mantém ID, RF/RNF, owner, sprint e próximo BK.

7. Cenário negativo/erro esperado.

Se existir divergência documental, segue RF/RNF e matriz/backlog e regista drift no relatório.

### Passo 2 - Criar smoke de 200 utilizadores

1. Objetivo funcional do passo no contexto da app.

Executar pedidos concorrentes e medir resultados.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/scripts/smoke-200-users.mjs`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria script configurável sem dependências novas.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/scripts/smoke-200-users.mjs
const baseUrl = process.env.STUDYFLOW_BASE_URL ?? "http://127.0.0.1:3000";
const path = process.env.STUDYFLOW_SMOKE_PATH ?? "/api/auth/me";
const concurrency = Number.parseInt(process.env.STUDYFLOW_SMOKE_USERS ?? "200", 10);
const cookie = process.env.STUDYFLOW_SMOKE_COOKIE ?? "";

if (!Number.isInteger(concurrency) || concurrency <= 0) {
  throw new Error("STUDYFLOW_SMOKE_USERS deve ser um número positivo.");
}

const url = new URL(path, baseUrl).toString();

async function runRequest(index) {
  const startedAt = performance.now();
  const response = await fetch(url, { headers: cookie ? { Cookie: cookie } : {} });
  const durationMs = Math.round(performance.now() - startedAt);
  // Guardamos só estado HTTP e duração; o body pode conter dados da sessão.
  return { index, status: response.status, durationMs };
}

const results = await Promise.all(Array.from({ length: concurrency }, (_, index) => runRequest(index)));
const durations = results.map((result) => result.durationMs).sort((a, b) => a - b);
const failures5xx = results.filter((result) => result.status >= 500).length;
const p95 = durations[Math.floor(durations.length * 0.95)] ?? 0;
const average = Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length);

console.log(JSON.stringify({ url, concurrency, averageMs: average, p95Ms: p95, failures5xx }, null, 2));
if (failures5xx > 0) process.exitCode = 1;
```

5. Explicação do código.

O script imprime só estatísticas, nunca body nem cookie.

6. Validação do passo.

Executa contra ambiente local/staging e confirma 0 falhas 5xx.

7. Cenário negativo/erro esperado.

Se output mostrar dados da sessão, remove leitura de body.

### Passo 3 - Integrar nos ecrãs reais

1. Objetivo funcional do passo no contexto da app.

Usar o novo contrato em páginas existentes sem duplicar lógica.

2. Ficheiros envolvidos:
    - EDITAR: páginas indicadas em `Ficheiros a criar/editar/rever`
    - REVER: imports e exports
    - LOCALIZAÇÃO: componente completo ou função completa

3. Instruções do que fazer.

Importa o novo ficheiro, substitui a zona local equivalente e mantém as chamadas API existentes.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou preparatório, porque fixa contrato e validações antes de alterar a aplicação.

5. Explicação do código.

A integração altera experiência e organização, mas preserva dados, endpoints e regras de segurança já definidos.

6. Validação do passo.

Abre a página alvo e confirma comportamento observável em sessão autenticada.

7. Cenário negativo/erro esperado.

Se a página chamar endpoint inexistente ou perder estado de erro, corrige antes de avançar.

### Passo 4 - Aplicar segurança, privacidade e estados de erro

1. Objetivo funcional do passo no contexto da app.

Garantir que o fluxo falha de forma controlada e não expõe dados sensíveis.

2. Ficheiros envolvidos:
    - REVER: ficheiros criados neste BK
    - REVER: services/controllers ou componentes que chamam API
    - LOCALIZAÇÃO: handlers `async`, `catch`, guards e mensagens visíveis

3. Instruções do que fazer.

Confirma que a alteração não guarda tokens, cookies, prompts, respostas IA, URLs privados ou dados pessoais em storage/logs. Segurança continua no backend.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou preparatório, porque fixa contrato e validações antes de alterar a aplicação.

5. Explicação do código.

Este passo é revisão obrigatória. Segurança e privacidade não podem ficar apenas na interface; o backend mantém autenticação, autorização, ownership, membership e validação.

6. Validação do passo.

Testa um cenário sem sessão, sem permissão ou com payload inválido e confirma `401`, `403`, `400` ou mensagem controlada.

7. Cenário negativo/erro esperado.

Se a UI revelar prompts privados, URLs sensíveis, cookies, IDs desnecessários ou detalhes internos, troca por mensagem segura.

### Passo 5 - Criar teste ou smoke focado

1. Objetivo funcional do passo no contexto da app.

Provar a regra principal do BK com um teste automatizado ou validação manual repetível.

2. Ficheiros envolvidos:
    - CRIAR/REVER: teste unitário, E2E ou smoke focado
    - LOCALIZAÇÃO: comportamento principal do BK

3. Instruções do que fazer.

Cria teste quando o projeto já tiver estrutura; caso contrário, documenta validação manual repetível.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou preparatório, porque fixa contrato e validações antes de alterar a aplicação.

5. Explicação do código.

O teste deve provar o comportamento do RNF/RF sem substituir testes de segurança backend.

6. Validação do passo.

Executa o teste ou regista passos manuais e expected result.

7. Cenário negativo/erro esperado.

Se o teste depender de dados reais ou produção, troca por fixtures/ambiente de teste.

### Passo 6 - Validar experiência final

1. Objetivo funcional do passo no contexto da app.

Confirmar que o utilizador entende o estado do fluxo em desktop e mobile.

2. Ficheiros envolvidos:
    - REVER: página ou endpoint alvo
    - REVER: estados loading/error/empty/success
    - LOCALIZAÇÃO: browser e terminal de validação

3. Instruções do que fazer.

Valida desktop e mobile, labels, foco, loading, erro, vazio e sucesso nos fluxos visíveis.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou preparatório, porque fixa contrato e validações antes de alterar a aplicação.

5. Explicação do código.

Este passo liga qualidade pedagógica a comportamento observável. O aluno deve conseguir defender o que mudou e por que razão o fluxo ficou mais claro ou seguro.

6. Validação do passo.

Confirma que um aluno/professor entende o próximo passo sem ler código.

7. Cenário negativo/erro esperado.

Se o texto visível usar termos internos como DTO/service, troca por linguagem de produto.

### Passo 7 - Preparar handoff

1. Objetivo funcional do passo no contexto da app.

Deixar claro que contratos este BK entrega ao BK seguinte.

2. Ficheiros envolvidos:
    - REVER: imports/exports do BK
    - REVER: `proximo_bk` no header
    - LOCALIZAÇÃO: secção Handoff e evidence

3. Instruções do que fazer.

Regista exports, imports e páginas que o próximo BK deve reutilizar.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou preparatório, porque fixa contrato e validações antes de alterar a aplicação.

5. Explicação do código.

Este passo evita que o próximo BK tenha de adivinhar nomes, paths, endpoints ou decisões. O handoff deve ser pequeno, concreto e pesquisável.

6. Validação do passo.

Pesquisa pelo nome criado e confirma que não existem duplicados para a mesma responsabilidade.

7. Cenário negativo/erro esperado.

Se houver dois nomes para o mesmo conceito, mantém o mais coerente com MF0-MF4.

#### Critérios de aceite

- Ficheiro principal do BK existe e é importável.
- Página ou service alvo usa o novo contrato.
- Loading, erro, vazio e sucesso existem quando há UI.
- Segurança continua no backend.
- Evidence permite defender a entrega.

#### Validação final

- Executar build/teste relevante quando o código for aplicado.
- Validar cenário negativo principal.
- Confirmar ausência de dados sensíveis em logs/storage.
- Erros comuns a evitar: duplicar contratos, esconder falhas e mover segurança para UI.

#### Evidence para PR/defesa

- Print ou output do fluxo principal.
- Resultado de build/teste/smoke relevante.
- Cenário negativo com expected result.
- Nota de handoff para o BK seguinte.

#### Handoff

O próximo BK reutiliza o ficheiro criado aqui e não deve criar outro contrato para a mesma responsabilidade.

#### Changelog

- 2026-06-18: Guia MF5 corrigido para ficar autocontido, pedagógico, executável e coerente com RF/RNF, matriz canónica, BKs anteriores e raiz `real_dev`.
