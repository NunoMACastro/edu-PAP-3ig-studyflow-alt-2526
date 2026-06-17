#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

TODAY = "2026-04-19"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Uso: gerar_relatorio_conformidade.py <audit.json>")

    audit_path = Path(sys.argv[1]).resolve()
    data = json.loads(audit_path.read_text(encoding="utf-8"))

    status = data.get("status", {})
    score = data.get("governance", {}).get("score", {})
    breakdown = score.get("breakdown", {})
    total = score.get("total", 0)

    counts = data.get("counts", {})
    consistency = data.get("consistency", {})
    guides = data.get("guides_quality", {})

    plan_root = Path(__file__).resolve().parents[1]
    out_path = plan_root / "CONFORMIDADE-PLANIFICACAO.md"

    content = f"""# CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Resultado global
- Estado da auditoria: `{'PASS' if status.get('overall_pass') else 'FAIL'}`
- Score total: `{total}/100`
- Meta oficial: `>=97/100`
- Resultado da meta: `{'ATINGIDA' if total >= 97 else 'NAO ATINGIDA'}`

## Score por criterio
| criterio | peso | score |
| --- | --- | --- |
| Cobertura/rastreabilidade | 25 | {breakdown.get('Cobertura/rastreabilidade', 0)} |
| Coerencia documental | 20 | {breakdown.get('Coerencia documental', 0)} |
| Pedagogia/guidance/step-by-step | 25 | {breakdown.get('Pedagogia/guidance/step-by-step', 0)} |
| Adequacao ao 12o | 20 | {breakdown.get('Adequacao ao 12o', 0)} |
| Governanca/avaliacao | 10 | {breakdown.get('Governanca/avaliacao', 0)} |

## Evidencias quantitativas
- RF detectados: `{counts.get('rf_docs', 0)}`
- RNF detectados: `{counts.get('rnf_docs', 0)}`
- BK na matriz: `{counts.get('matriz_bk', 0)}`
- BK no backlog: `{counts.get('backlog_bk', 0)}`
- Guias BK: `{counts.get('guide_bk', 0)}`
- Missing artifacts: `{len(consistency.get('missing_artifacts', []))}`
- Broken links: `{len(consistency.get('broken_links_docs', []))}`
- Issues de guias: `{len(guides.get('guide_header_issues', [])) + len(guides.get('guide_content_issues', []))}`
- Drift critical count: `{consistency.get('drift_critical_count', 0)}`

## Evidencia tecnica
- Fonte de auditoria: `docs/planificacao/scripts/latest-audit.json`
- Comando de validacao: `bash scripts/validate-planificacao.sh`

## Changelog
- `{TODAY}`: relatorio atualizado automaticamente a partir da auditoria canonica.
"""

    out_path.write_text(content, encoding="utf-8")
    print(f"Relatorio de conformidade atualizado: {out_path}")


if __name__ == "__main__":
    main()
