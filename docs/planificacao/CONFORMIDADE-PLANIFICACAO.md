# CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`
- `implementation_manifest_sha256`: `799990e7a86c9595c786069889ce2a4e893cf5c9077d23a67e9df6194a84e538`

## Limite da declaração

> Um `PASS` neste relatório significa apenas conformidade documental para o manifesto indicado. Não constitui release, não prova execução do produto e nunca autoriza uma declaração de prontidão para produção. O gate permitido continua a ser `APTA_PARA_PAP_LOCAL_ENDURECIDA` depois das validações técnicas independentes.

## Resultado global
- Estado da auditoria documental: `PASS`
- Resultado declarado da execução: `COMPLETO`
- Score total: `100/100`
- Meta oficial: `>=97/100`
- Resultado da meta: `ATINGIDA`
- Regra fail-closed: resultados `PARCIAL`, `BLOCKED` ou `BLOQUEADO_OPERADOR` nunca são convertidos em `PASS`.

## Score por critério
| critério | peso | score |
| --- | --- | --- |
| Cobertura/rastreabilidade | 25 | 25 |
| Coerência documental | 20 | 20 |
| Pedagogia/guidance/step-by-step | 25 | 25 |
| Adequação ao 12.º | 20 | 20 |
| Governação/avaliação | 10 | 10 |

## Contratos semânticos
| categoria | risco rejeitado | issues |
| --- | --- | --- |
| `direct_ai_provider` | Injeção direta do provider de IA | 0 |
| `redis_full_user` | Sessão Redis com utilizador completo | 0 |
| `fire_and_forget_job` | Job crítico fire-and-forget | 0 |
| `overlapping_polling` | Polling assíncrono sobreposto | 0 |
| `parser_timeout_only_promise_race` | Timeout que não termina o parser | 0 |
| `public_recipient_ids` | IDs de destinatários em DTO público | 0 |
| `health_always_200` | Health/readiness sempre saudável | 0 |
| `e2e_optional_final_gate` | E2E opcional no gate final | 0 |
| `public_teaching_real_dev_path` | Path privado real_dev em conteúdo pedagógico público | 0 |

## Evidências quantitativas
- RF detetados: `57`
- RNF detetados: `45`
- BK na matriz: `107`
- BK no backlog: `107`
- Guias BK: `107`
- Missing artifacts: `0`
- Broken links: `0`
- Issues de guias: `0`
- Issues semânticas: `0`
- Issues de estado pedagógico: `0`
- Issues de ligação ao manifesto: `0`
- Drift critical count: `0`

## Evidência técnica
- Fonte de auditoria: `docs/planificacao/scripts/latest-audit.json`
- Fixtures semânticas: `PASS`
- Manifesto da implementação: `799990e7a86c9595c786069889ce2a4e893cf5c9077d23a67e9df6194a84e538`
- Comando de validação: `bash scripts/validate-planificacao.sh`

## Changelog
- `2026-07-10`: relatório atualizado automaticamente, com contratos semânticos, manifesto e linguagem fail-closed.
