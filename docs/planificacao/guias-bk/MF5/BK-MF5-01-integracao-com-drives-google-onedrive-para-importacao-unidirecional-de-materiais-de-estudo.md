# BK-MF5-01 - Integração com Drives (Google/OneDrive) para importação unidirecional de materiais de estudo.

## Header
- `doc_id`: `GUIA-BK-MF5-01`
- `bk_id`: `BK-MF5-01`
- `macro`: `MF5`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF61`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-03`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-01-integracao-com-drives-google-onedrive-para-importacao-unidirecional-de-materiais-de-estudo.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Integração com Drives (Google/OneDrive) para importação unidirecional de materiais de estudo.` com rastreabilidade direta para `RF61`.
- Foco da macro `MF5`: Operacao e UX transversal.
- Dominio semântico aplicado: `integrations`.

## Bloco pedagogico
### Objetivo
Integrar fontes externas em modo controlado, idempotente e observavel.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Importar duplicados por falta de idempotência.
- Não registar origem do material importado.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF61` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF5-01`
- Requisito: `RF61`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF5-01` e do requisito `RF61`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `importação unidirecional via conector externo`.
4. Implementar o caminho principal de `importação unidirecional via conector externo`.
5. Aplicar controlos para `idempotência e mapeamento de origem`.
6. Preparar evidencia operacional: `histórico de sincronização`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Fluxo do requisito cumpre contrato de entrada/saída.
- [ ] Persistência e leitura dos dados mantêm consistência.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF5-03`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Importação unidirecional com idempotência**
- BK vinculado: `BK-MF5-01`.

```ts
type FicheiroExterno = { sourceId: string; hash: string };

export function deduplicarImportacao(existente: Set<string>, f: FicheiroExterno) {
  const chave = `${f.sourceId}:${f.hash}`;
  return { bkId: 'BK-MF5-01', req: 'RF61', importar: !existente.has(chave), chave };
}
```

Evita duplicados na sincronização de materiais externos.
- Requisitos alvo deste BK: `RF61`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `2` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P1`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF5-03`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
