#!/usr/bin/env python3
"""Validate the StudyFlow canonical planning documents.

The validator checks the planning contract used by the StudyFlow backlog:
RF/RNF coverage, BK consistency between matrix/backlog/guides, guide
headers, declared totals and the governance score expected by
`docs/planificacao/CONFORMIDADE-PLANIFICACAO.md`.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any
from urllib.parse import unquote

EXPECTED_PROJECT = "studyflow"
EXPECTED_RF_COUNT = 57
EXPECTED_RNF_COUNT = 44
EXPECTED_BK_COUNT = 101
SCORE_WEIGHTS = {
    "Cobertura/rastreabilidade": 25,
    "Coerencia documental": 20,
    "Pedagogia/guidance/step-by-step": 25,
    "Adequacao ao 12o": 20,
    "Governanca/avaliacao": 10,
}
REQUIRED_ARTIFACTS = [
    "README.md",
    "docs/RF.md",
    "docs/RNF.md",
    "docs/planificacao/README.md",
    "docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md",
    "docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md",
    "docs/planificacao/CORE-DUAL-CONTRATO.md",
    "docs/planificacao/CONFORMIDADE-PLANIFICACAO.md",
    "docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md",
    "docs/planificacao/backlogs/BACKLOG-MVP.md",
    "docs/planificacao/backlogs/MF-VIEWS.md",
    "docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md",
    "docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md",
    "docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md",
    "docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md",
    "docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md",
    "docs/planificacao/sprints/PLANO-SPRINTS.md",
    "docs/planificacao/sprints/SCORECARD-SPRINTS.md",
    "docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md",
    "docs/planificacao/sprints/GATES-S4-S8-S12.md",
    "docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md",
    "docs/planificacao/guias-bk/README.md",
    "docs/planificacao/guias-bk/_TEMPLATE-BK.md",
]
HEADER_FIELDS = [
    "bk_id",
    "macro",
    "owner",
    "apoio",
    "prioridade",
    "estado",
    "esforco",
    "dependencias",
    "rf_rnf",
    "fase_documental",
    "sprint",
    "core_or_reforco",
    "proximo_bk",
    "guia_path",
    "last_updated",
]
MATRIX_COLUMNS = [
    "bk_id",
    "macro",
    "titulo",
    "owner",
    "apoio",
    "prioridade",
    "estado",
    "esforco",
    "dependencias",
    "rf_rnf",
    "fase_documental",
    "sprint",
    "core_or_reforco",
    "proximo_bk_recomendado",
    "guia_path",
]
BACKLOG_COLUMNS = [
    "bk_id",
    "macro",
    "titulo",
    "owner",
    "apoio",
    "prioridade",
    "estado",
    "esforco",
    "dependencias",
    "rf_rnf",
    "fase_documental",
    "sprint",
    "core_or_reforco",
    "proximo_bk",
    "guia",
]


def read_text(root: Path, relative_path: str) -> str:
    return (root / relative_path).read_text(encoding="utf-8")


def unique_codes(text: str, prefix: str) -> set[str]:
    return set(re.findall(rf"\b{prefix}\d{{2}}\b", text))


def normalize_cell(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip())


def parse_markdown_table(
    text: str,
    expected_columns: list[str],
    *,
    section_heading: str | None = None,
) -> list[dict[str, str]]:
    """Extract rows from a markdown table with the requested columns."""

    if section_heading:
        start = text.find(section_heading)
        if start == -1:
            return []
        next_heading = text.find("\n## ", start + len(section_heading))
        text = text[start:] if next_heading == -1 else text[start:next_heading]

    lines = text.splitlines()
    for index, line in enumerate(lines):
        cells = [normalize_cell(cell) for cell in line.strip().strip("|").split("|")]
        if cells == expected_columns and index + 1 < len(lines):
            rows: list[dict[str, str]] = []
            for row in lines[index + 2 :]:
                if not row.strip().startswith("|"):
                    break
                row_cells = [normalize_cell(cell) for cell in row.strip().strip("|").split("|")]
                if len(row_cells) != len(expected_columns):
                    continue
                rows.append(dict(zip(expected_columns, row_cells, strict=True)))
            return rows
    return []


def parse_guide_header(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    header: dict[str, str] = {}
    for line in text.splitlines():
        match = re.match(r"^- `([^`]+)`: `([^`]*)`", line)
        if match:
            header[match.group(1)] = match.group(2)
        elif line.startswith("## ") and header:
            break
    return header


def markdown_links(text: str) -> list[str]:
    return re.findall(r"\[[^\]]+\]\(([^)]+)\)", text)


def resolve_link(source: Path, target: str) -> Path | None:
    if target.startswith(("http://", "https://", "mailto:")):
        return None
    target = target.split("#", 1)[0]
    if not target:
        return None
    return (source.parent / unquote(target)).resolve()


def as_project_relative(path: Path, root: Path) -> str:
    return path.resolve().relative_to(root.resolve()).as_posix()


def guide_path_from_backlog_link(link_cell: str) -> str:
    match = re.search(r"\(([^)]+)\)", link_cell)
    if not match:
        return link_cell
    target = unquote(match.group(1))
    return str(Path("docs/planificacao/backlogs").joinpath(target).resolve())


def normalize_backlog_guide_path(link_cell: str, root: Path) -> str:
    match = re.search(r"\(([^)]+)\)", link_cell)
    if not match:
        return link_cell
    return as_project_relative((root / "docs/planificacao/backlogs" / unquote(match.group(1))).resolve(), root)


def split_refs(value: str) -> list[str]:
    if value == "-":
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


def has_heading_containing(text: str, words: list[str]) -> bool:
    heading_lines = [line.casefold() for line in text.splitlines() if line.startswith("#")]
    return any(all(word.casefold() in line for word in words) for line in heading_lines)


def validate(root: Path, project: str) -> dict[str, Any]:
    if project != EXPECTED_PROJECT:
        raise SystemExit(f"Projeto não suportado: {project}")

    rf_text = read_text(root, "docs/RF.md")
    rnf_text = read_text(root, "docs/RNF.md")
    matrix_text = read_text(root, "docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md")
    backlog_text = read_text(root, "docs/planificacao/backlogs/BACKLOG-MVP.md")
    sprint_text = read_text(root, "docs/planificacao/sprints/PLANO-SPRINTS.md")
    guide_readme_text = read_text(root, "docs/planificacao/guias-bk/README.md")

    matrix_rows = parse_markdown_table(matrix_text, MATRIX_COLUMNS, section_heading="## Tabela canonica")
    backlog_rows = parse_markdown_table(
        backlog_text,
        BACKLOG_COLUMNS,
        section_heading="## Tabela global de ligacao BK -> guia -> estado documental",
    )
    matrix_by_bk = {row["bk_id"]: row for row in matrix_rows}
    backlog_by_bk = {row["bk_id"]: row for row in backlog_rows}
    guide_files = sorted((root / "docs/planificacao/guias-bk").glob("MF*/BK-MF*-*.md"))
    guide_headers = {parse_guide_header(path).get("bk_id", ""): (path, parse_guide_header(path)) for path in guide_files}
    guide_headers.pop("", None)

    rf_codes = unique_codes(rf_text, "RF")
    rnf_codes = unique_codes(rnf_text, "RNF")
    matrix_bks = set(matrix_by_bk)
    backlog_bks = set(backlog_by_bk)
    guide_bks = set(guide_headers)

    missing_artifacts = [path for path in REQUIRED_ARTIFACTS if not (root / path).exists()]
    missing_in_backlog = sorted(matrix_bks - backlog_bks)
    missing_in_matrix = sorted((backlog_bks | guide_bks) - matrix_bks)
    missing_in_guides = sorted(matrix_bks - guide_bks)
    extra_guides = sorted(guide_bks - matrix_bks)

    broken_links: list[str] = []
    for markdown_path in sorted((root / "docs").rglob("*.md")) + [root / "README.md"]:
        text = markdown_path.read_text(encoding="utf-8")
        for link in markdown_links(text):
            resolved = resolve_link(markdown_path, link)
            if resolved is not None and not resolved.exists():
                broken_links.append(f"{as_project_relative(markdown_path, root)} -> {link}")

    missing_rf_matrix: list[str] = []
    missing_rnf_matrix: list[str] = []
    missing_rf_backlog: list[str] = []
    missing_rnf_backlog: list[str] = []
    matrix_refs = {ref for row in matrix_rows for ref in split_refs(row["rf_rnf"])}
    backlog_refs = {ref for row in backlog_rows for ref in split_refs(row["rf_rnf"])}
    for code in sorted(rf_codes):
        if code not in matrix_refs:
            missing_rf_matrix.append(code)
        if code not in backlog_refs:
            missing_rf_backlog.append(code)
    for code in sorted(rnf_codes):
        if code not in matrix_refs:
            missing_rnf_matrix.append(code)
        if code not in backlog_refs:
            missing_rnf_backlog.append(code)

    invalid_refs: list[str] = []
    valid_refs = rf_codes | rnf_codes
    for row in matrix_rows:
        for ref in split_refs(row["rf_rnf"]):
            if ref not in valid_refs:
                invalid_refs.append(f"{row['bk_id']} -> {ref}")

    field_map = {
        "proximo_bk_recomendado": "proximo_bk",
        "guia_path": "guia",
    }
    drift_issues: list[str] = []
    for bk_id in sorted(matrix_bks & backlog_bks):
        matrix_row = matrix_by_bk[bk_id]
        backlog_row = backlog_by_bk[bk_id]
        for matrix_field, backlog_field in field_map.items():
            matrix_value = matrix_row[matrix_field]
            backlog_value = (
                normalize_backlog_guide_path(backlog_row[backlog_field], root)
                if backlog_field == "guia"
                else backlog_row[backlog_field]
            )
            if matrix_value != backlog_value:
                drift_issues.append(f"{bk_id}: {matrix_field}={matrix_value} backlog={backlog_value}")
        for field in [
            "macro",
            "owner",
            "apoio",
            "prioridade",
            "estado",
            "esforco",
            "dependencias",
            "rf_rnf",
            "fase_documental",
            "sprint",
            "core_or_reforco",
        ]:
            if matrix_row[field] != backlog_row[field]:
                drift_issues.append(f"{bk_id}: {field} matrix={matrix_row[field]} backlog={backlog_row[field]}")

    guide_header_issues: list[str] = []
    guide_content_issues: list[str] = []
    for bk_id in sorted(guide_bks):
        path, header = guide_headers[bk_id]
        relative_path = as_project_relative(path, root)
        missing_fields = [field for field in HEADER_FIELDS if field not in header]
        if missing_fields:
            guide_header_issues.append(f"{relative_path}: campos em falta {', '.join(missing_fields)}")
        if bk_id in matrix_by_bk:
            matrix_row = matrix_by_bk[bk_id]
            for field in ["macro", "owner", "apoio", "prioridade", "estado", "esforco", "dependencias", "rf_rnf", "fase_documental", "sprint", "core_or_reforco", "guia_path"]:
                if header.get(field) != matrix_row[field]:
                    issue = f"{relative_path}: {field}={header.get(field)} matrix={matrix_row[field]}"
                    if field == "estado":
                        drift_issues.append(issue)
                    else:
                        guide_header_issues.append(issue)
            if header.get("proximo_bk") != matrix_row["proximo_bk_recomendado"]:
                guide_header_issues.append(
                    f"{relative_path}: proximo_bk={header.get('proximo_bk')} matrix={matrix_row['proximo_bk_recomendado']}"
                )
        text = path.read_text(encoding="utf-8")
        semantic_sections = {
            "validação": ["valida"],
            "critérios de aceite": ["crit", "aceite"],
            "evidence": ["evidence"],
        }
        for label, words in semantic_sections.items():
            if not has_heading_containing(text, words):
                guide_content_issues.append(f"{relative_path}: secção semântica ausente {label}")

    matrix_proximo_bk_issues: list[str] = []
    for row in matrix_rows:
        next_bk = row["proximo_bk_recomendado"]
        if next_bk != "-" and next_bk not in matrix_by_bk:
            matrix_proximo_bk_issues.append(f"{row['bk_id']} -> {next_bk}")

    declared_totals_issues: list[str] = []
    declared_counts = {
        "rf_docs": (len(rf_codes), EXPECTED_RF_COUNT),
        "rnf_docs": (len(rnf_codes), EXPECTED_RNF_COUNT),
        "matriz_bk": (len(matrix_bks), EXPECTED_BK_COUNT),
        "backlog_bk": (len(backlog_bks), EXPECTED_BK_COUNT),
        "guide_bk": (len(guide_bks), EXPECTED_BK_COUNT),
    }
    for label, (actual, expected) in declared_counts.items():
        if actual != expected:
            declared_totals_issues.append(f"{label}: esperado {expected}, encontrado {actual}")

    sprint_label_issues: list[str] = []
    scorecard_contract_issues: list[str] = []
    for criterion, weight in SCORE_WEIGHTS.items():
        if criterion not in read_text(root, "docs/planificacao/README.md"):
            scorecard_contract_issues.append(f"Critério ausente do README de planificação: {criterion}")
        if str(weight) not in read_text(root, "docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md"):
            scorecard_contract_issues.append(f"Peso ausente do plano total: {criterion}={weight}")

    rnf_index_anchor_issues = [code for code in sorted(rnf_codes) if code not in rnf_text]
    governance_issues = []
    if "scripts/validate-planificacao.sh" not in read_text(root, "docs/planificacao/README.md"):
        governance_issues.append("README de planificação não referencia validate-planificacao.sh")
    if "Evidence" not in guide_readme_text:
        governance_issues.append("README de guias BK não referencia Evidence")

    adequacao_12o_issues = []
    if "12o" not in read_text(root, "docs/planificacao/README.md") and "12º" not in read_text(root, "README.md"):
        adequacao_12o_issues.append("Contexto de 12o ano não encontrado nos READMEs canónicos")

    consistency_issues = (
        missing_artifacts
        + missing_in_backlog
        + missing_in_matrix
        + missing_in_guides
        + extra_guides
        + broken_links
        + drift_issues
        + scorecard_contract_issues
        + sprint_label_issues
        + matrix_proximo_bk_issues
        + declared_totals_issues
        + rnf_index_anchor_issues
    )
    coverage_issues = missing_rf_matrix + missing_rnf_matrix + missing_rf_backlog + missing_rnf_backlog + invalid_refs
    guide_issues = guide_header_issues + guide_content_issues

    status = {
        "coverage_pass": not coverage_issues,
        "consistency_pass": not consistency_issues,
        "guides_pass": not guide_issues,
        "governance_pass": not governance_issues,
        "adequacao_12o_pass": not adequacao_12o_issues,
        "score_ge_97": not (coverage_issues or consistency_issues or guide_issues or governance_issues or adequacao_12o_issues),
        "drift_critical_zero": not drift_issues,
    }
    status["overall_pass"] = all(status.values())

    breakdown = {
        "Cobertura/rastreabilidade": 25 if status["coverage_pass"] else 0,
        "Coerencia documental": 20 if status["consistency_pass"] and status["drift_critical_zero"] else 0,
        "Pedagogia/guidance/step-by-step": 25 if status["guides_pass"] else 0,
        "Adequacao ao 12o": 20 if status["adequacao_12o_pass"] else 0,
        "Governanca/avaliacao": 10 if status["governance_pass"] else 0,
    }

    return {
        "project": project,
        "counts": {
            "rf_docs": len(rf_codes),
            "rnf_docs": len(rnf_codes),
            "matriz_bk": len(matrix_bks),
            "backlog_bk": len(backlog_bks),
            "guide_bk": len(guide_bks),
        },
        "coverage": {
            "missing_rf_matrix": missing_rf_matrix,
            "missing_rnf_matrix": missing_rnf_matrix,
            "missing_rf_backlog": missing_rf_backlog,
            "missing_rnf_backlog": missing_rnf_backlog,
            "invalid_refs": invalid_refs,
        },
        "consistency": {
            "missing_artifacts": missing_artifacts,
            "missing_in_backlog": missing_in_backlog,
            "missing_in_matrix": missing_in_matrix,
            "missing_in_guides": missing_in_guides,
            "extra_guides": extra_guides,
            "broken_links_docs": broken_links,
            "scorecard_contract_issues": scorecard_contract_issues,
            "scorecard_plan_load_issues": [],
            "sprint_label_issues": sprint_label_issues,
            "gate_issues": [],
            "core_dual_contract_issues": [],
            "matrix_proximo_bk_issues": matrix_proximo_bk_issues,
            "declared_totals_issues": declared_totals_issues,
            "rnf_index_anchor_issues": rnf_index_anchor_issues,
            "drift_critical_count": len(drift_issues),
            "drift_issues": drift_issues,
        },
        "guides_quality": {
            "naming_issues": [],
            "guide_header_issues": guide_header_issues,
            "guide_content_issues": guide_content_issues,
        },
        "governance": {
            "governance_issues": governance_issues,
            "adequacao_12o_issues": adequacao_12o_issues,
            "score": {
                "weights": SCORE_WEIGHTS,
                "breakdown": breakdown,
                "total": sum(breakdown.values()),
            },
        },
        "status": status,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Valida a planificação canónica da StudyFlow.")
    parser.add_argument("--project", default=EXPECTED_PROJECT)
    parser.add_argument("--json", action="store_true", help="Escreve o resultado em JSON.")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    result = validate(root, args.project)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        status = "PASS" if result["status"]["overall_pass"] else "FAIL"
        total = result["governance"]["score"]["total"]
        print(f"{status} - score {total}/100")

    if not result["status"]["overall_pass"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
