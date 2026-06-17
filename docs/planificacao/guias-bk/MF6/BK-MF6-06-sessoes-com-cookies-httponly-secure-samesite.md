# BK-MF6-06 - Sessões com cookies HttpOnly + Secure + SameSite.

## Header
- `doc_id`: `GUIA-BK-MF6-06`
- `bk_id`: `BK-MF6-06`
- `macro`: `MF6`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF16`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-07`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Sessões com cookies HttpOnly + Secure + SameSite.` com rastreabilidade direta para `RNF16`.
- Foco da macro `MF6`: Qualidade, seguranca e performance.
- Dominio semântico aplicado: `security_hardening`.

## Bloco pedagogico
### Objetivo
Endurecer superficie de seguranca com protecoes ativas e validacao negativa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Depender de segurança apenas no frontend.
- Não testar vetores negativos (XSS/CSRF/brute-force).
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF16` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF6-06`
- Requisito: `RNF16`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF6-06` e do requisito `RNF16`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `proteções de canal/sessão/entrada`.
4. Implementar o caminho principal de `proteções de canal/sessão/entrada`.
5. Aplicar controlos para `mitigações XSS/CSRF/injection/brute-force`.
6. Preparar evidencia operacional: `evidência de bloqueio em testes negativos`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).
10. Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.

### Cenarios negativos recomendados
- pedido HTTP sem TLS
- payload com tentativa de injection
- token/cookie inválido

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Endpoint crítico recusa tráfego inseguro.
- [ ] Vetores negativos conhecidos geram erro controlado.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF6-07`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Middlewares de segurança obrigatórios**
- BK vinculado: `BK-MF6-06`.

```ts
export function exigirHTTPS(proto: string) {
  if (proto !== 'https') throw new Error('Canal inseguro');
}

export function validarRateLimit(tentativasMinuto: number, limite: number) {
  if (tentativasMinuto > limite) throw new Error('Rate limit excedido');
  return { bkId: 'BK-MF6-06', req: 'RNF16', ok: true };
}
```

Aplica proteção ativa no perímetro do endpoint crítico.
- Requisitos alvo deste BK: `RNF16`.

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
`BK-MF6-07`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
