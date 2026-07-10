#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from typing import Any


SEMANTIC_CATEGORIES = {
    "direct_ai_provider": "Injeção direta do provider de IA",
    "redis_full_user": "Sessão Redis com utilizador completo",
    "fire_and_forget_job": "Job crítico fire-and-forget",
    "overlapping_polling": "Polling assíncrono sobreposto",
    "parser_timeout_only_promise_race": "Timeout que não termina o parser",
    "public_recipient_ids": "IDs de destinatários em DTO público",
    "health_always_200": "Health/readiness sempre saudável",
    "e2e_optional_final_gate": "E2E opcional no gate final",
    "public_teaching_real_dev_path": "Path privado real_dev em conteúdo pedagógico público",
}

NON_PASS_OUTCOMES = {
    "BLOCKED",
    "BLOQUEADO",
    "BLOQUEADO_OPERADOR",
    "PARTIAL",
    "PARCIAL",
    "INCOMPLETE",
    "INCOMPLETO",
    "ERROR",
    "ERRO",
}


def normalize_outcome(value: object) -> str:
    return re.sub(r"[^A-Z0-9]+", "_", str(value).strip().upper()).strip("_")


def declared_non_pass_outcome(data: dict[str, Any]) -> str | None:
    """Deteta resultados parciais/bloqueados que nunca podem ser promovidos."""

    candidates = [
        data.get("result"),
        data.get("outcome"),
        data.get("audit_status"),
        data.get("audit_execution", {}).get("status"),
        data.get("status", {}).get("result"),
        data.get("status", {}).get("outcome"),
    ]
    for candidate in candidates:
        if candidate is None:
            continue
        normalized = normalize_outcome(candidate)
        if normalized in NON_PASS_OUTCOMES or any(
            token in normalized for token in ("BLOCKED", "BLOQUEADO", "PARTIAL", "PARCIAL", "INCOMPLETE", "INCOMPLETO")
        ):
            return normalized
    return None


def semantic_counts(data: dict[str, Any]) -> dict[str, int]:
    counts = {category: 0 for category in SEMANTIC_CATEGORIES}
    for issue in data.get("semantic_contract_issues", []):
        issue_text = str(issue)
        for category in counts:
            if category in issue_text:
                counts[category] += 1
                break
    return counts


def extract_manifest_sha256(data: dict[str, Any]) -> str:
    candidates = [
        data.get("implementation_manifest_sha256"),
        data.get("manifest_sha256"),
        data.get("manifest", {}).get("sha256"),
        data.get("implementation", {}).get("manifest_sha256"),
        data.get("implementation", {}).get("manifest", {}).get("sha256"),
    ]
    for candidate in candidates:
        if isinstance(candidate, str) and re.fullmatch(r"[0-9a-fA-F]{64}", candidate):
            return candidate.lower()
    return "AUSENTE"


def documentary_pass(data: dict[str, Any]) -> tuple[bool, str | None]:
    status = data.get("status", {})
    execution = data.get("audit_execution", {})
    non_pass_outcome = declared_non_pass_outcome(data)
    component_results = [
        value
        for key, value in status.items()
        if key.endswith("_pass") and key != "overall_pass" and isinstance(value, bool)
    ]
    fixtures = data.get("semantic_fixtures", {})
    fixtures_pass = fixtures.get("pass") is True
    passed = (
        status.get("overall_pass") is True
        and all(component_results)
        and status.get("pedagogical_states_pass") is True
        and fixtures_pass
        and not data.get("semantic_contract_issues", [])
        and not data.get("pedagogical_state_issues", [])
        and extract_manifest_sha256(data) != "AUSENTE"
        and not data.get("manifest_link_issues", [])
        and normalize_outcome(execution.get("status")) == "COMPLETE"
        and execution.get("validator_exit_code") == 0
        and non_pass_outcome is None
    )
    return passed, non_pass_outcome


def render_report(data: dict[str, Any], audit_path: Path) -> str:
    today = date.today().isoformat()
    score = data.get("governance", {}).get("score", {})
    breakdown = score.get("breakdown", {})
    total = score.get("total", 0)
    counts = data.get("counts", {})
    consistency = data.get("consistency", {})
    guides = data.get("guides_quality", {})
    semantic = semantic_counts(data)
    passed, non_pass_outcome = documentary_pass(data)
    audit_state = "PASS" if passed else "FAIL"
    declared_outcome = non_pass_outcome or "COMPLETO"
    manifest_sha256 = extract_manifest_sha256(data)
    project_root = Path(__file__).resolve().parents[3]
    try:
        audit_display = audit_path.relative_to(project_root).as_posix()
    except ValueError:
        audit_display = audit_path.name

    semantic_rows = "\n".join(
        f"| `{category}` | {label} | {semantic[category]} |"
        for category, label in SEMANTIC_CATEGORIES.items()
    )

    return f"""# CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{today}`
- `implementation_manifest_sha256`: `{manifest_sha256}`

## Limite da declaração

> Um `PASS` neste relatório significa apenas conformidade documental para o manifesto indicado. Não constitui release, não prova execução do produto e nunca autoriza uma declaração de prontidão para produção. O gate permitido continua a ser `APTA_PARA_PAP_LOCAL_ENDURECIDA` depois das validações técnicas independentes.

## Resultado global
- Estado da auditoria documental: `{audit_state}`
- Resultado declarado da execução: `{declared_outcome}`
- Score total: `{total}/100`
- Meta oficial: `>=97/100`
- Resultado da meta: `{'ATINGIDA' if passed and total >= 97 else 'NAO ATINGIDA'}`
- Regra fail-closed: resultados `PARCIAL`, `BLOCKED` ou `BLOQUEADO_OPERADOR` nunca são convertidos em `PASS`.

## Score por critério
| critério | peso | score |
| --- | --- | --- |
| Cobertura/rastreabilidade | 25 | {breakdown.get('Cobertura/rastreabilidade', 0)} |
| Coerência documental | 20 | {breakdown.get('Coerencia documental', 0)} |
| Pedagogia/guidance/step-by-step | 25 | {breakdown.get('Pedagogia/guidance/step-by-step', 0)} |
| Adequação ao 12.º | 20 | {breakdown.get('Adequacao ao 12o', 0)} |
| Governação/avaliação | 10 | {breakdown.get('Governanca/avaliacao', 0)} |

## Contratos semânticos
| categoria | risco rejeitado | issues |
| --- | --- | --- |
{semantic_rows}

## Evidências quantitativas
- RF detetados: `{counts.get('rf_docs', 0)}`
- RNF detetados: `{counts.get('rnf_docs', 0)}`
- BK na matriz: `{counts.get('matriz_bk', 0)}`
- BK no backlog: `{counts.get('backlog_bk', 0)}`
- Guias BK: `{counts.get('guide_bk', 0)}`
- Missing artifacts: `{len(consistency.get('missing_artifacts', []))}`
- Broken links: `{len(consistency.get('broken_links_docs', []))}`
- Issues de guias: `{len(guides.get('guide_header_issues', [])) + len(guides.get('guide_content_issues', []))}`
- Issues semânticas: `{len(data.get('semantic_contract_issues', []))}`
- Issues de estado pedagógico: `{len(data.get('pedagogical_state_issues', []))}`
- Issues de ligação ao manifesto: `{len(data.get('manifest_link_issues', []))}`
- Drift critical count: `{consistency.get('drift_critical_count', 0)}`

## Evidência técnica
- Fonte de auditoria: `{audit_display}`
- Fixtures semânticas: `{'PASS' if data.get('semantic_fixtures', {}).get('pass') is True else 'FAIL'}`
- Manifesto da implementação: `{manifest_sha256}`
- Comando de validação: `bash scripts/validate-planificacao.sh`

## Changelog
- `{today}`: relatório atualizado automaticamente, com contratos semânticos, manifesto e linguagem fail-closed.
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Gera o relatório de conformidade documental StudyFlow.")
    parser.add_argument("audit_json", help="JSON produzido pela auditoria canónica.")
    parser.add_argument(
        "--out",
        default=None,
        help="Destino Markdown; por omissão usa docs/planificacao/CONFORMIDADE-PLANIFICACAO.md.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Compara o relatório atual sem escrever ficheiros.",
    )
    args = parser.parse_args()

    audit_path = Path(args.audit_json).resolve()
    data = json.loads(audit_path.read_text(encoding="utf-8"))
    plan_root = Path(__file__).resolve().parents[1]
    out_path = Path(args.out).resolve() if args.out else plan_root / "CONFORMIDADE-PLANIFICACAO.md"
    content = render_report(data, audit_path)

    if args.check:
        if not out_path.exists() or out_path.read_text(encoding="utf-8") != content:
            print(f"Relatório de conformidade desatualizado: {out_path}")
            return 1
        print(f"Relatório de conformidade atualizado: {out_path}")
        return 0

    out_path.write_text(content, encoding="utf-8")
    print(f"Relatório de conformidade atualizado: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
