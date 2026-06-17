# BK-MF8-07 - Exportação de resumos/quizzes em PDF/MD.

## Header
- `doc_id`: `GUIA-BK-MF8-07`
- `bk_id`: `BK-MF8-07`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-08`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Exportação de resumos/quizzes em PDF/MD.` com rastreabilidade direta para `RNF40`.
- Foco da macro `MF8`: Compatibilidade e fecho PAP.
- Dominio semântico aplicado: `materials_ingestion`.

## Bloco pedagogico
### Objetivo
Assegurar ingestao/indexacao de materiais com rastreabilidade e isolamento por contexto.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Aceitar ficheiros sem validar tipo/tamanho.
- Indexar sem separar contexto aluno/professor/turma.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF40` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF8-07`
- Requisito: `RNF40`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-07` e do requisito `RNF40`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `ingestão e indexação assíncrona por tipo de material`.
4. Implementar o caminho principal de `ingestão e indexação assíncrona por tipo de material`.
5. Aplicar controlos para `validação de MIME/tamanho e isolamento por contexto`.
6. Preparar evidencia operacional: `logs de parsing + índices criados`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.

### Cenarios negativos recomendados
- ficheiro com formato não suportado
- upload acima do limite

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Documento indexado gera entradas pesquisáveis.
- [ ] Falha de parsing não bloqueia interface do utilizador.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-08`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Pipeline de ingestão assíncrona**
- BK vinculado: `BK-MF8-07`.

```ts
type Material = { id: string; tipo: 'PDF' | 'DOCX' | 'URL'; bytes: number };

export function enfileirarIndexacao(material: Material) {
  if (material.bytes <= 0 || material.bytes > 25 * 1024 * 1024) throw new Error('Tamanho invalido');
  return { bkId: 'BK-MF8-07', req: 'RNF40', job: `IDX-${material.id}`, estado: 'PENDING' };
}
```

Separa validação e indexação para não bloquear o utilizador.
- Requisitos alvo deste BK: `RNF40`.

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
`BK-MF8-08`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
