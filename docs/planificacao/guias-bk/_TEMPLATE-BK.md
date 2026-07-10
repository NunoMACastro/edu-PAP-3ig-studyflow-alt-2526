# BK-MF*-** - Titulo claro do BK

> Template obrigatorio para guias BK StudyFlow.
> Usa como modelo estrutural BKs hidratados completos, especialmente o padrao de tutorial tecnico linear com codigo, explicacao, validacao, negativos, evidence e handoff.
> Nao removas secoes. Se uma seccao nao se aplicar, escreve "Nao aplicavel" e justifica.

## Header

- `doc_id`: `GUIA-BK-MF*-**`
- `bk_id`: `BK-MF*-**`
- `macro`: `MF*`
- `owner`: `...`
- `apoio`: `...`
- `prioridade`: `P0|P1|P2`
- `estado`: `TODO|DONE`
- `real_dev_status`: `VALIDADO|IMPLEMENTADO_NAO_VALIDADO|PARCIAL|MITIGADO_POR_ESCOPO|BLOQUEADO_OPERADOR|NAO_IMPLEMENTADO|NAO_APLICAVEL`
- `esforco`: `S|M|L`
- `dependencias`: `BK-...|-`
- `rf_rnf`: `RFxx|RNFxx|RFxx,RNFyy`
- `fase_documental`: `Fase 1|Fase 2|Fase 3`
- `sprint`: `Sxx|Sxx-Syy`
- `core_or_reforco`: `Core|Reforco`
- `classe_core_dual`: `CORE-IA|CORE-COM|CORE-HIBRIDO|SUPORTE`
- `eixo_primario`: `...`
- `kpi_primario`: `...`
- `kpi_secundario`: `...`
- `proximo_bk`: `BK-...|-`
- `guia_path`: `docs/planificacao/guias-bk/MF*/BK-MF*-**-slug-semantico.md`
- `last_updated`: `YYYY-MM-DD`

#### Objetivo

Explica, em 2 a 4 paragrafos, o que o aluno vai construir neste BK e que resultado observavel fica na app.

#### Importancia

Explica porque este BK existe no StudyFlow, que RF/RNF cumpre, que problema de aprendizagem/operacao pedagogica resolve e que BKs seguintes ficam desbloqueados.

#### Scope-in

- Lista fechada do que este BK implementa, corrige ou prepara.
- Incluir backend, frontend, dados, IA/fontes, turmas/salas, testes e evidence quando aplicavel.

#### Scope-out

- Lista fechada do que este BK nao implementa.
- Nao antecipar RAG, embeddings, OCR, conhecimento externo, integracoes LMS/Drive ou automacoes futuras sem contrato documental.

#### Estado antes e depois

- Estado antes: que contratos, ficheiros ou funcionalidades ja existem.
- Estado depois: que novo contrato fica implementavel e validavel.

#### Pre-requisitos

- RF/RNF aplicaveis.
- BKs anteriores obrigatorios.
- Documentos canonicos a consultar, incluindo `CORE-DUAL-CONTRATO.md` e `ANEXO-CORE-DUAL-BK.md` quando aplicavel.
- Ficheiros reais em `apps/api` e `apps/web`, se existirem.

#### Glossario

- Termos de dominio StudyFlow usados no BK.
- Termos tecnicos que o aluno precisa de compreender antes de copiar codigo.

#### Conceitos teoricos essenciais

Explica a teoria minima para o aluno perceber o raciocinio: aluno, professor, turma, disciplina, sala/grupo, areas de estudo, materiais privados/oficiais, IA privada, IA coletiva, fontes, citacoes, ownership, membership, roles, privacidade e anti-alucinacao.

#### Arquitetura do BK

- Endpoint(s):
- Modelo/schema:
- Service(s):
- Controller/route:
- Guard/middleware:
- Cliente API:
- Pagina/componente:
- Testes:
- Handoff para o proximo BK:

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/...`
- EDITAR: `apps/api/...`
- CRIAR: `apps/web/...`
- EDITAR: `apps/web/...`
- REVER: `docs/planificacao/guias-bk/MF*/BK-...md`

#### Tutorial tecnico linear

Cada passo deve ser executavel por ordem. O aluno nao deve precisar de adivinhar imports, helpers, DTOs, services, componentes, rotas, testes ou comandos.

Regra obrigatoria para passos com codigo:

- Todo bloco de codigo deve estar completo para o contexto do BK.
- Depois de cada bloco de codigo deve existir `Explicacao do codigo`.
- Bloco com 8 ou mais linhas nao vazias: pelo menos 1 comentario didatico dentro do codigo.
- Bloco com 20 ou mais linhas nao vazias: pelo menos 2 comentarios didaticos dentro do codigo.
- Mesmo com menos de 8 linhas, e obrigatorio comentario didatico se houver autenticacao, ownership, membership, roles, validacao, async, queries, estado React, testes, logs, IA/fontes, materiais privados, salas, turmas, professores ou regra de dominio StudyFlow.
- Comentario didatico explica intencao, contrato, risco evitado ou invariante. Nao repete a sintaxe.

### Passo 1 - Nome claro

1. Objetivo funcional do passo no contexto da app.

Texto especifico: o que este passo entrega no StudyFlow.

2. Ficheiros envolvidos.

- CRIAR/EDITAR/REVER: `caminho/exato`
- LOCALIZACAO: modulo, pasta ou bloco onde a alteracao entra.

3. Instrucoes do que fazer.

Explica a ordem de trabalho e as decisoes `CANONICO`, `DERIVADO` ou `TODO (BLOCKER)`.

4. Codigo completo, correto e integrado com a app final.

```ts
// Codigo real ou "Sem codigo neste passo."
```

5. Explicacao do codigo.

Deve cobrir:

- o que o codigo faz;
- porque existe neste BK;
- que contrato tecnico, RF/RNF, criterio de aceite ou handoff cumpre;
- que ficheiros ou BKs anteriores usa;
- que ficheiros ou BKs seguintes prepara;
- que dados entram e saem;
- que validacoes e regras de seguranca/ownership/membership/role/permissao aplica;
- que erro comum, bug, duplicacao, vulnerabilidade ou incoerencia evita;
- como testar;
- que partes o aluno pode adaptar com seguranca e que partes nao deve alterar.

6. Validacao do passo.

- Comando, request/response, screenshot ou verificacao objetiva.
- Resultado esperado.

7. Cenario negativo/erro esperado.

- Erro que deve acontecer.
- Codigo HTTP, mensagem, estado UI ou assert esperado.

### Passo 2 - Nome claro

Repetir exatamente a estrutura do Passo 1.

#### Criterios de aceite

- Criterios mensuraveis, ligados a RF/RNF e aos passos.
- Incluir negativos de acesso cruzado quando houver aluno, professor, sala, turma, disciplina, materiais, historico ou artefactos IA.
- Para `CORE-*`, incluir evidence tecnica e evidence de impacto academico/pedagogico.

#### Validacao final

- Executar validadores reais de `apps/api/package.json` e `apps/web/package.json`.
- Executar smoke principal.
- Executar negativos de sessao ausente, acesso cruzado, falta de fontes, role sem acesso e input invalido quando aplicavel.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit ou pacote de entrega.
- `proof_tecnico`: request/response, screenshot ou log controlado do fluxo principal.
- `proof_negativos`: cenarios negativos executados.
- `proof_fontes`: evidencia de fontes/citacoes quando o BK tocar IA.
- `proof_privacidade`: evidencia de ownership/membership e ausencia de mistura entre alunos, salas, turmas ou professores.
- `proof_pedagogico`: evidencia de impacto no eixo core dual quando `classe_core_dual != SUPORTE`; para `SUPORTE`, usar evidencia operacional.

#### Handoff

- O que este BK entrega ao proximo BK.
- Campos, endpoints, componentes, estados, permissao, payloads, fontes e riscos restantes.

#### Changelog

- `YYYY-MM-DD`: alteracao feita e motivo.
