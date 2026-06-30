# BK-MF8-16 - Execução final de testes.

## Header
- `doc_id`: `GUIA-BK-MF8-16`
- `bk_id`: `BK-MF8-16`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-15`
- `rf_rnf`: `RNF42`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-17`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: `Execução final de testes.` com rastreabilidade direta para `RNF42`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `quality_architecture`.

## Bloco pedagogico
### Objetivo
Executar a bateria final de validação da app e guardar evidence clara para PR, entrega e defesa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF8-15`.

### Erros comuns
- Dizer que foi testado sem guardar output, screenshot ou log.
- Executar só o teste que já se sabe que passa.
- Ignorar scripts ausentes em vez de registar a limitação.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei que comandos existem no projeto e que comandos não existem.
- [ ] Sei distinguir build, unit, integration, e2e e smoke.
- [ ] Sei demonstrar evidence objetiva da execução final.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-16`
- Requisito: `RNF42`
- Dependencias: `BK-MF8-15`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-16` e do requisito `RNF42`.
2. Listar scripts de validação disponíveis na API, web e raiz do projeto.
3. Executar build/typecheck/lint se existirem no projeto.
4. Executar unit tests disponíveis.
5. Executar integration/contract tests disponíveis.
6. Executar smoke/e2e do fluxo de demo no browser controlado quando aplicável.
7. Guardar evidence de comandos, resultados, falhas e limitações.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Abrir lista objetiva de erros para `BK-MF8-17`.
10. Concluir handoff técnico com estado final de cada comando.

### Cenarios negativos recomendados
- comando inexistente ou sem script configurado
- teste a falhar com erro reproduzível
- smoke bloqueado por ambiente local

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal quando o ambiente permitir.
- [ ] Negativos: minimo `3` cenarios com resultado controlado ou limitação documentada.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Cada comando executado tem resultado registado.
- [ ] Falhas são encaminhadas para `BK-MF8-17`.

### Matriz minima de testes por prioridade
- `P0`: build/typecheck + unit + integration/e2e/smoke + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-17`
- Registar comandos executados, comandos indisponíveis, falhas e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Registo final de comandos**
- BK vinculado: `BK-MF8-16`.

```ts
type ResultadoComando = {
  comando: string;
  estado: 'PASS' | 'FAIL' | 'BLOQUEADO' | 'NAO_EXISTE';
  evidencia: string;
};

export function temFalhas(resultados: ResultadoComando[]) {
  return resultados.some((resultado) => resultado.estado === 'FAIL');
}
```

Mantém a execução final auditável e prepara a lista de correções.
- Requisitos alvo deste BK: `RNF42`.

## Criterios de aceite
- Bateria final executada com comandos existentes e limitações registadas.
- Falhas encaminhadas para `BK-MF8-17`.
- Cenarios negativos concluidos: minimo `3` com resultado controlado ou bloqueio justificado.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo da execução final.
- `proof`: outputs dos comandos e smoke da demo.
- `neg`: evidência dos cenários negativos executados, falhados ou bloqueados.

## Proximo BK recomendado
`BK-MF8-17`

## Changelog
- `2026-04-19`: guia criado para a execução final de testes da MF8.
