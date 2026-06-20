# AUDITORIA-HIDRATACAO-MF5 - StudyFlow

## Header

- `project`: `StudyFlow`
- `mf_alvo`: `MF5`
- `bk_ids_pedidos`: `BK-MF5-12`
- `modo`: `auditar_apenas`
- `implementation_root`: `real_dev`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `output_mode`: `relatorio_e_resumo`
- `run_commands`: `true`
- `last_updated`: `2026-06-20`

## Nota de execucao

Esta execucao auditou apenas o BK alvo pedido pela prompt:

- `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`

Por `MODO=auditar_apenas`, nao foram editados BKs nem codigo real em `real_dev`. A escrita ficou limitada a este relatorio.

O working tree ja continha alteracoes antes desta execucao, incluindo guias `MF5`, documentos `MF4`, uma remocao de ficheiro `.swp` em `MF4` e este relatorio ainda nao versionado. Essas alteracoes foram preservadas.

## Documentos e contratos consultados

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
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Inventario de `docs/planificacao/guias-bk/MF5/`.
- Leitura completa de `BK-MF5-12`.
- Leitura dirigida de `BK-MF5-11`, como BK anterior direto.
- Leitura dirigida de `BK-MF6-01`, como BK seguinte direto.
- `real_dev/api/src/modules/auth/auth.controller.ts`
- `real_dev/api/src/modules/auth/session.service.ts`
- `real_dev/api/src/common/guards/session.guard.ts`
- `real_dev/api/package.json`
- `real_dev/api/src/app.module.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/hooks/useSession.ts`

## Normalizacao de escopo

- A macrofase alvo e `MF5`.
- O BK alvo desta execucao e `BK-MF5-12`.
- `MODO=auditar_apenas`: atualizar relatorio, sem editar BK.
- `STRICT_SCOPE=true`: nao corrigir MF3, MF6, matriz, backlog, contrato de campos, mockup, legacy, `real_dev` ou BKs fora do alvo.
- A sequencia canonica da MF5 e `BK-MF5-01 -> BK-MF5-03 -> BK-MF5-04 -> BK-MF5-05 -> BK-MF5-06 -> BK-MF5-07 -> BK-MF5-08 -> BK-MF5-09 -> BK-MF5-10 -> BK-MF5-11 -> BK-MF5-12`.
- `BK-MF5-02` nao existe na matriz, backlog, MF views, README dos guias nem na pasta `MF5`; nao foi inferido nem criado.

## Estado antes desta execucao

| Estado | Contagem |
| --- | ---: |
| OK | 0 |
| PARCIAL | 0 |
| CRITICO | 1 |

## Estado depois desta execucao

| Estado | Contagem |
| --- | ---: |
| OK | 0 |
| PARCIAL | 0 |
| CRITICO | 1 |

## Classificacao por BK

| BK | Estado final | Decisao | Evidencia principal |
| --- | --- | --- | --- |
| `BK-MF5-12` | CRITICO | BLOQUEADO_POR_SCOPE | O guia tem a estrutura macro obrigatoria, mas o smoke pode devolver sucesso falso com 200 respostas `401`, nao implementa a edicao de `package.json`, mistura passos genericos de UI com um BK backend de concorrencia e nao prova o recorte "por escola" de `RNF10`. |

Como o modo foi `auditar_apenas`, os problemas foram registados mas nao corrigidos no BK.

## Findings e decisoes

### A1 - CRITICO - smoke pode aprovar 200 pedidos nao autenticados

- Ficheiro auditado: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- Linhas observadas antes desta auditoria:
  - `STUDYFLOW_SMOKE_COOKIE` tem valor por defeito vazio.
  - O pedido envia `Cookie` apenas quando essa variavel existe.
  - O script calcula apenas `failures5xx`.
  - O `process.exitCode` so muda quando existem respostas `>= 500`.
- Estado: `CRITICO`
- Problema principal: o endpoint sugerido por defeito e `/api/auth/me`, que existe em `real_dev/api/src/modules/auth/auth.controller.ts` e esta protegido por `SessionGuard`. Sem cookie valido, 200 pedidos podem devolver `401`; como o script so falha em `5xx`, a execucao pode parecer bem-sucedida sem representar 200 utilizadores autenticados.
- Risco pedagogico: o aluno pode defender uma evidence falsa de escalabilidade.
- Risco tecnico: o smoke nao mede utilizadores simultaneos reais; mede apenas respostas HTTP concorrentes.
- Risco de seguranca/privacidade: baixo direto, porque o script nao imprime body nem cookie; o risco e de governanca e qualidade de evidence.
- O que falta completar: exigir cookie de teste valido ou modo publico explicitamente marcado como invalido para `RNF10`, contabilizar `2xx/3xx/4xx/5xx`, falhar quando o estado esperado nao corresponde ao alvo e explicar que `401` nao prova utilizadores autenticados.
- Dependencias a reler: `RNF10`, `BK-MF0-02`, `AuthController.me`, `SessionGuard`, `SessionService`.
- Prioridade de correcao: P0 para este BK, porque sem isto o criterio principal de aceite fica enganador.

### A2 - CRITICO - o guia nao prova o recorte "por escola" de `RNF10`

- Ficheiro auditado: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- Estado: `CRITICO`
- Problema principal: `RNF10` define `Suportar >= 200 utilizadores simultaneos por escola`, mas o BK so recebe URL/path/cookie/concurrency e nao explica como a escola e representada no contexto real atual.
- Evidencia:
  - `docs/RNF.md` define a meta "por escola".
  - A pesquisa em `real_dev` encontrou `schoolYear` e `schoolClass`, mas nao encontrou contrato claro de tenancy/escola que o BK possa usar diretamente.
  - O BK nao marca a falta de contrato como `DERIVADO` ou `TODO (BLOCKER)`.
- Risco pedagogico: o aluno pode confundir escola com turma, ano letivo ou sessao.
- Risco tecnico: o smoke nao demonstra isolamento por escola nem capacidade por unidade institucional.
- O que falta completar: declarar que, no estado documental atual, "por escola" fica limitado a um ambiente de teste representativo de uma escola; se for necessario tenant/escola real, marcar `TODO (BLOCKER)` ate existir contrato canonico.
- Dependencias a reler: `README.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`.
- Prioridade de correcao: P1, porque afeta a semantica do requisito.

### A3 - PARCIAL - `real_dev/api/package.json` e listado mas nao tem codigo de edicao

- Ficheiro auditado: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- Estado: `PARCIAL`
- Problema principal: a seccao `Ficheiros a criar/editar/rever` lista `real_dev/api/package.json` como `EDITAR`, mas o tutorial nao mostra a versao completa do bloco `scripts` nem o comando npm final.
- Evidencia: `real_dev/api/package.json` existe e ja tem scripts `build`, `start`, `start:e2e`, `seed:dev-users`, `test` e `test:unit`; o BK nao mostra como integrar o novo `smoke:200-users` sem quebrar scripts existentes.
- Risco pedagogico: o aluno fica a adivinhar o nome do comando, a localizacao da alteracao e a forma segura de preservar scripts existentes.
- Risco tecnico: o smoke pode ficar criado mas nao repetivel por comando documentado.
- O que falta completar: incluir codigo completo ou substituicao precisa do bloco `scripts`, expected command e expected output.
- Dependencias a reler: `real_dev/api/package.json`, padrao de scripts existentes.
- Prioridade de correcao: P1.

### A4 - PARCIAL - passos genericos de UI nao pertencem ao BK de concorrencia backend

- Ficheiro auditado: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- Estado: `PARCIAL`
- Problema principal: o tutorial inclui passos e criterios de aceite sobre "ecras reais", "desktop e mobile", "loading/error/empty/success" e "pagina ou service alvo", mas o scope real do BK e um script backend de smoke de concorrencia.
- Evidencia:
  - Passo 3 chama-se `Integrar nos ecras reais`.
  - Passo 6 chama-se `Validar experiencia final`.
  - Criterios de aceite exigem `Pagina ou service alvo usa o novo contrato` e estados de UI.
- Risco pedagogico: o aluno recebe tarefas de UI sem ficheiros concretos, sem codigo e sem relacao direta com `RNF10`.
- Risco tecnico: o foco desloca-se de medicao de concorrencia para fluxo visual que este BK nao implementa.
- O que falta completar: substituir estes passos por integracao do comando npm, preparacao de ambiente de teste, definicao de status esperados, interpretacao de metricas e handoff para MF6.
- Dependencias a reler: `BK-MF5-10`, `BK-MF5-11`, `BK-MF6-01`.
- Prioridade de correcao: P1.

### A5 - PARCIAL - explicacao e validacao do codigo sao demasiado vagas para a regra de JSDoc/comentarios

- Ficheiro auditado: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- Estado: `PARCIAL`
- Problema principal: o unico bloco de codigo tem uma funcao `runRequest` sem JSDoc e a explicacao apos o bloco resume-se a uma frase. A prompt exige explicacao completa do codigo, incluindo entradas, saidas, validacoes, regras de seguranca, erro evitado e como testar.
- Evidencia adicional: a expressao `Sem codigo` aparece varias vezes sem acentuacao, apesar da regra de lingua exigir texto pedagogico em portugues de Portugal com acentos.
- Risco pedagogico: o aluno copia o script sem compreender por que `body` e cookie nao sao impressos, que estados HTTP invalidam a evidence, nem que metricas sao suficientes.
- Risco tecnico: o smoke pode ser adaptado de forma insegura e passar a registar dados sensiveis ou aceitar estados invalidos.
- O que falta completar: adicionar JSDoc, comentarios didaticos junto de validacao de env/status, explicacao completa do codigo e corrigir texto narrativo para `Sem código`.
- Dependencias a reler: regra da prompt sobre JSDoc, comentarios didaticos e explicacao de codigo.
- Prioridade de correcao: P1.

### A6 - BLOQUEADO_POR_SCOPE - `BK-MF6-01` ainda usa estrutura antiga e nao consome handoff robusto

- Ficheiro fora de scope: `docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md`
- Estado: `BLOQUEADO_POR_SCOPE`
- Evidencia: `BK-MF6-01` ainda usa `Bloco pedagogico`, `Bloco operacional` e `Snippet tecnico aplicavel`, estrutura antiga que nao corresponde ao formato obrigatorio usado nos BKs corrigidos de MF0-MF5.
- Impacto: a coerencia MF5 -> MF6 nao fica totalmente fechada, mesmo que `BK-MF5-12` venha a ser corrigido.
- Justificacao: `STRICT_SCOPE=true` e `BK_IDS=[BK-MF5-12]` impedem editar MF6 nesta execucao.

### A7 - BLOQUEADO_POR_SCOPE - drift MF3 continua a bloquear validacao global

- Ficheiros fora de scope: `docs/planificacao/guias-bk/MF3/*`, matriz e backlog MF3.
- Estado: `BLOQUEADO_POR_SCOPE`
- Evidencia historica e validacao atual: `bash scripts/validate-planificacao.sh` continua a falhar por inconsistencias MF3 fora de MF5.
- Impacto: `overall_pass=false` enquanto o drift MF3 nao for resolvido em execucao propria.
- Justificacao: `STRICT_SCOPE=true` e `BK_IDS=[BK-MF5-12]` impedem correcao de MF3 nesta execucao.

## Decisoes tecnicas confirmadas

- CANONICO: `RNF10` define suporte a `>= 200` utilizadores simultaneos por escola.
- CANONICO: a sequencia oficial da MF5 salta `BK-MF5-02`.
- CANONICO: `BK-MF5-11` e o BK anterior direto e entrega o contrato de budget IA `<= 4s`.
- CANONICO: `BK-MF6-01` e o BK seguinte direto e inicia a MF6 de qualidade, seguranca e performance.
- CANONICO: `/api/auth/me` existe no `AuthController` real e esta protegido por `SessionGuard`.
- DERIVADO: usar `/api/auth/me` como endpoint barato de smoke e aceitavel apenas se o BK exigir cookie de teste valido e tratar `401` como falha para o cenario autenticado.
- DERIVADO: enquanto nao existir contrato institucional/tenant de escola, o BK deve declarar que o smoke representa uma escola de teste isolada, sem fingir prova multi-escola.

## Decisoes de dominio confirmadas

- Um utilizador simultaneo em `RNF10` nao pode ser reduzido a uma resposta HTTP qualquer; a evidence deve representar pedidos autenticados ou explicar explicitamente o tipo de cenario medido.
- Escalabilidade nao substitui autorizacao, ownership, membership, sessoes HttpOnly ou protecoes CSRF.
- O smoke nao deve imprimir cookies, body de `/api/auth/me`, nomes, emails, prompts, respostas IA, URLs privados ou dados pessoais.
- Se o contrato "por escola" nao estiver modelado, a decisao deve ser marcada como `DERIVADO` ou `TODO (BLOCKER)`, nao apresentada como facto resolvido.

## Drift documental encontrado

- `CONTRATO-CAMPOS-BK.md` diverge da matriz/backlog/header em `BK-MF5-12`:
  - contrato de campos aponta sprint `S09`;
  - matriz/backlog/header apontam `S10`.
- Pela hierarquia da prompt, `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md` ficam acima de `CONTRATO-CAMPOS-BK.md`; por isso o drift foi registado, mas nao corrigido neste modo.
- `BK-MF6-01` continua em estrutura antiga e deve ser tratado numa execucao propria.
- Drift MF3 continua fora de scope e bloqueia a validacao global.

## Mapa de integracao da MF

| BK auditado | Ficheiros criados previstos no guia | Ficheiros editados previstos no guia | Exports produzidos pelo guia | Imports consumidos | Endpoints/DTOs/services/componentes/testes | Regras de seguranca/autorizacao | BKs seguintes dependentes | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF5-12` | `real_dev/api/src/scripts/smoke-200-users.mjs` | `real_dev/api/package.json` | Nenhum export aplicacional; comando/script operacional esperado | `/api/auth/me`, sessao HttpOnly, `SessionGuard` | Nao cria endpoint, DTO, schema, service ou componente; cria smoke Node com `fetch`; deveria criar script npm | Nao deve imprimir cookie/body; deve tratar `401/403/4xx` como falha quando o cenario for autenticado | `BK-MF6-01` | CRITICO |

Confirmacoes de coerencia:

- Nao ha endpoints novos no BK alvo.
- O endpoint `/api/auth/me` existe e e protegido por sessao.
- O script proposto nao prova corretamente 200 utilizadores autenticados porque aceita cookie vazio e nao falha em `401`.
- O BK seguinte (`BK-MF6-01`) ainda precisa de reescrita propria para a estrutura final dos guias.

## Coerencia MF anterior -> MF5 -> MF seguinte

- `BK-MF5-11` entrega o foco de performance IA `<= 4s`; `BK-MF5-12` deveria fechar a escala operacional com evidence de concorrencia.
- O BK alvo preserva a ideia de nao expor cookie/body, mas falha a prova central de autenticacao/concorrencia.
- MF5 nao fica coerente como sequencia fechada enquanto `BK-MF5-12` aceitar sucesso falso com respostas `401`.
- MF6 nao foi alterada nem deve ser corrigida nesta execucao, mas `BK-MF6-01` ainda esta em formato antigo e deve ser realinhado em escopo proprio.

## Verificacoes textuais executadas

Comandos previstos pela prompt:

```bash
rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF5/*.md
git diff --check
bash scripts/validate-planificacao.sh
```

Resultados desta execucao:

- Pesquisa proibida em `docs/planificacao/guias-bk/MF5/*.md`: sem ocorrencias.
- Pesquisa estatica dirigida no BK alvo e nos ficheiros `real_dev` relevantes: encontrou os problemas A1-A5 e falsos positivos de linguagem defensiva sobre cookies/tokens.
- `git diff --check`: passou sem erros.
- Pesquisa de trailing whitespace no relatorio e no BK alvo: sem ocorrencias.
- `bash scripts/validate-planificacao.sh`: falhou por drift documental preexistente fora de `MF5`.

Resultados finais do validador:

- `coverage_pass`: `true`
- `guides_pass`: `true`
- `governance_pass`: `true`
- `adequacao_12o_pass`: `true`
- `consistency_pass`: `false`
- `score_ge_97`: `false`
- `drift_critical_zero`: `false`
- `overall_pass`: `false`
- `score`: `80`
- `guide_bk`: `101`
- `missing_in_guides`: `[]`
- `guide_content_issues`: `[]`

## Riscos restantes e TODOs

- Corrigir `BK-MF5-12` em modo `hidratar_corrigir` ou `corrigir_apenas`.
- Impedir sucesso falso do smoke com `401`.
- Definir expected statuses, comando npm e expected output.
- Explicar como interpretar media, p95, `2xx`, `4xx` e `5xx`.
- Marcar corretamente o recorte "por escola" como `DERIVADO` ou `TODO (BLOCKER)` enquanto faltar contrato institucional.
- Realinhar `BK-MF6-01` em execucao propria.
- Resolver drift MF3 em execucao separada para desbloquear `overall_pass=true`.
- Resolver drift de metadados em `CONTRATO-CAMPOS-BK.md` numa execucao propria.

## Resumo final

- MF processada: `MF5`.
- Numero de BKs analisados: `1`.
- Contagem antes: `0 OK / 0 PARCIAL / 1 CRITICO`.
- Contagem depois: `0 OK / 0 PARCIAL / 1 CRITICO`.
- BKs editados: nenhum nesta execucao (`MODO=auditar_apenas`).
- Relatorio editado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Principais lacunas corrigidas: nao aplicavel nesta execucao; as lacunas foram auditadas e registadas.
- Decisoes tecnicas confirmadas: `RNF10 >= 200 utilizadores simultaneos por escola`, `/api/auth/me` existe e exige sessao, cookie/body nao devem ser impressos.
- Decisoes de dominio confirmadas: sucesso de smoke autenticado nao pode aceitar `401`; "por escola" precisa de contrato ou marcacao `DERIVADO`/`TODO (BLOCKER)`.
- Decisoes marcadas como DERIVADO: uso de `/api/auth/me` como endpoint barato apenas com cookie valido; representacao de escola como ambiente isolado enquanto nao houver tenant institucional.
- Drift documental encontrado: `CONTRATO-CAMPOS-BK.md` diverge no sprint de `BK-MF5-12`; `BK-MF6-01` ainda usa estrutura antiga; drift MF3 continua fora de scope.
- Riscos restantes: BK alvo nao deve ser usado como guia OK sem correcao, porque a evidence de RNF10 pode ser falsa.
- Coerencia MF anterior -> MF alvo -> MF seguinte: bloqueada em `BK-MF5-12` e limitada pelo formato antigo de `BK-MF6-01`.
- Verificacoes textuais executadas: pesquisa proibida, pesquisa estatica dirigida, `git diff --check` e `bash scripts/validate-planificacao.sh`.
- Resultado de `git diff --check`: passou sem erros.
- Resultado de `bash scripts/validate-planificacao.sh`: falhou por drift MF3 fora de scope (`overall_pass=false`, `score=80`, `drift_critical_count=6`).
- Bloqueios/TODOs restantes: corrigir `BK-MF5-12`; tratar MF6 e MF3 em escopos proprios; resolver drift de metadados do contrato de campos.
