# BK-MF5-09 - Notificações discretas e contextualizadas.

## Header
- `doc_id`: `GUIA-BK-MF5-09`
- `bk_id`: `BK-MF5-09`
- `macro`: `MF5`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF07`
- `fase_documental`: `Fase 2`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-10`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-09-notificacoes-discretas-e-contextualizadas.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Notificações discretas e contextualizadas.` com rastreabilidade direta para `RNF07`.
- Foco da macro `MF5`: Operacao e UX transversal.
- Dominio semântico aplicado: `notifications`.

## Bloco pedagogico
### Objetivo
Orquestrar notificacoes por contexto com quotas, preferencias e prioridade controladas.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Ignorar preferências de canal do utilizador.
- Disparar notificações acima da quota definida.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF07` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF5-09`
- Requisito: `RNF07`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF5-09` e do requisito `RNF07`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `despacho de notificação por contexto/canal`.
4. Implementar o caminho principal de `despacho de notificação por contexto/canal`.
5. Aplicar controlos para `respeito por preferências e quotas`.
6. Preparar evidencia operacional: `eventos de envio, supressão e fallback`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Preferência de canal é respeitada por utilizador.
- [ ] Quota máxima impede spam em eventos repetidos.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF5-10`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Despacho de notificações com quota**
- BK vinculado: `BK-MF5-09`.

```ts
type Preferencia = { canal: 'app' | 'email' | 'push'; ativo: boolean };

export function podeNotificar(pref: Preferencia, enviadosHoje: number, quota: number) {
  if (!pref.ativo) return { bkId: 'BK-MF5-09', req: 'RNF07', enviar: false, motivo: 'opt-out' };
  return { bkId: 'BK-MF5-09', req: 'RNF07', enviar: enviadosHoje < quota };
}
```

Impõe preferências e quota máxima antes do envio.
- Requisitos alvo deste BK: `RNF07`.

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
`BK-MF5-10`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
