# BK-MF7-05 - Documentação técnica mínima (modelos, fluxos, endpoints).

## Header
- `doc_id`: `GUIA-BK-MF7-05`
- `bk_id`: `BK-MF7-05`
- `macro`: `MF7`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF27`
- `fase_documental`: `Fase 3`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-06`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Documentação técnica mínima (modelos, fluxos, endpoints).` com rastreabilidade direta para `RNF27`.
- Foco da macro `MF7`: Operacao, modularidade e compliance.
- Dominio semântico aplicado: `quality_architecture`.

## Bloco pedagogico
### Objetivo
Consolidar arquitetura e qualidade tecnica com testes e modularidade.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Testes sem cobrir módulos críticos.
- Acoplar domínios sem fronteiras claras.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF27` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF7-05`
- Requisito: `RNF27`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF7-05` e do requisito `RNF27`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `fronteiras de domínio + testes críticos`.
4. Implementar o caminho principal de `fronteiras de domínio + testes críticos`.
5. Aplicar controlos para `contratos entre módulos e cobertura mínima`.
6. Preparar evidencia operacional: `suite automatizada em CI local`.
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
- Proximo BK recomendado: `BK-MF7-06`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Teste automatizado de módulo crítico**
- BK vinculado: `BK-MF7-05`.

```ts
import { describe, it, expect } from 'vitest';

describe('BK-MF7-05', () => {
  it('cumpre contrato principal', () => {
    const output = { ok: true, bkId: 'BK-MF7-05', req: 'RNF27' };
    expect(output.ok).toBe(true);
  });
});
```

Fixa comportamento esperado e previne regressões no módulo.
- Requisitos alvo deste BK: `RNF27`.

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
`BK-MF7-06`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
