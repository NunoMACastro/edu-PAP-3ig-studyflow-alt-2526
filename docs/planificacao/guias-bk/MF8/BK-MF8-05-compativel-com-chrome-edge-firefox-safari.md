# BK-MF8-05 - Compatível com Chrome, Edge, Firefox, Safari.

## Header
- `doc_id`: `GUIA-BK-MF8-05`
- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF38`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-06`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-05-compativel-com-chrome-edge-firefox-safari.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Compatível com Chrome, Edge, Firefox, Safari.` com rastreabilidade direta para `RNF38`.
- Foco da macro `MF8`: Compatibilidade e fecho PAP.
- Dominio semântico aplicado: `compatibility_browser`.

## Bloco pedagogico
### Objetivo
Validar compatibilidade real entre navegadores suportados no MVP.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Validar só no browser do programador.
- Não congelar baseline de versões suportadas.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF38` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-05`
- Requisito: `RNF38`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-05` e do requisito `RNF38`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `matriz de browsers suportados com testes E2E`.
4. Implementar o caminho principal de `matriz de browsers suportados com testes E2E`.
5. Aplicar controlos para `normalização de APIs e fallbacks`.
6. Preparar evidencia operacional: `relatório por navegador/versão`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).
10. Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.

### Cenarios negativos recomendados
- funcionalidade em browser sem API nativa
- render com layout quebrado
- evento de teclado sem fallback

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Fluxos críticos passam em Chrome/Edge/Firefox/Safari.
- [ ] Sem regressão visual/funcional em browser alternativo.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-06`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Teste E2E cross-browser**
- BK vinculado: `BK-MF8-05`.

```ts
import { test, expect } from '@playwright/test';

test('BK-MF8-05 fluxo crítico', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
});
```

Permite executar a mesma verificação em Chromium, Firefox e WebKit.
- Requisitos alvo deste BK: `RNF38`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `3` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P0`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF8-06`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
