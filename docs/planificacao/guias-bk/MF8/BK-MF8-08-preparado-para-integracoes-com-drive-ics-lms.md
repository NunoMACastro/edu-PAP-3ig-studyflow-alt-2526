# BK-MF8-08 - Preparado para integrações com Drive/ICS/LMS.

## Header
- `doc_id`: `GUIA-BK-MF8-08`
- `bk_id`: `BK-MF8-08`
- `macro`: `MF8`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF41`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-09`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-08-preparado-para-integracoes-com-drive-ics-lms.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Preparado para integrações com Drive/ICS/LMS.` com rastreabilidade direta para `RNF41`.
- Foco da macro `MF8`: Compatibilidade e fecho PAP.
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
- [ ] Sei explicar como `RNF41` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF8-08`
- Requisito: `RNF41`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-08` e do requisito `RNF41`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `importação unidirecional via conector externo`.
4. Implementar o caminho principal de `importação unidirecional via conector externo`.
5. Aplicar controlos para `idempotência e mapeamento de origem`.
6. Preparar evidencia operacional: `histórico de sincronização`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 1) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `1` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Fluxo do requisito cumpre contrato de entrada/saída.
- [ ] Persistência e leitura dos dados mantêm consistência.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-09`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Importação unidirecional com idempotência**
- BK vinculado: `BK-MF8-08`.

```ts
type FicheiroExterno = { sourceId: string; hash: string };

export function deduplicarImportacao(existente: Set<string>, f: FicheiroExterno) {
  const chave = `${f.sourceId}:${f.hash}`;
  return { bkId: 'BK-MF8-08', req: 'RNF41', importar: !existente.has(chave), chave };
}
```

Evita duplicados na sincronização de materiais externos.
- Requisitos alvo deste BK: `RNF41`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `1` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P2`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF8-09`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
