#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from collections import defaultdict
import re

TODAY = "2026-04-19"


def split_md_row(line: str) -> list[str]:
    return [p.strip() for p in line.strip().strip("|").split("|")]


def extract_global_rows(backlog_path: Path) -> list[dict[str, str]]:
    lines = backlog_path.read_text(encoding="utf-8").splitlines()
    header_idx = None
    for i, line in enumerate(lines):
        if line.startswith("| bk_id | macro |") and "| guia |" in line:
            header_idx = i
            break
    if header_idx is None:
        raise RuntimeError("Tabela global nao encontrada no BACKLOG-MVP.")

    end_idx = len(lines)
    for i in range(header_idx + 2, len(lines)):
        if lines[i].startswith("## MF0"):
            end_idx = i
            break

    headers = split_md_row(lines[header_idx])
    rows: list[dict[str, str]] = []
    for line in lines[header_idx + 2 : end_idx]:
        if not line.strip().startswith("|"):
            continue
        cols = split_md_row(line)
        if len(cols) != len(headers):
            continue
        rows.append(dict(zip(headers, cols)))
    return rows


def parse_items(raw: str) -> list[str]:
    raw = raw.strip().replace("`", "")
    if raw in {"", "-", "transversal"}:
        return []
    return [x.strip() for x in raw.split(",") if x.strip()]


def normalize_guia_path(cell: str) -> str:
    m = re.search(r"\(([^)]+)\)", cell)
    if not m:
        return ""
    rel = m.group(1).replace("../", "")
    return f"docs/planificacao/{rel}"


def fmt_md_table(headers: list[str], rows: list[list[str]]) -> str:
    out = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        out.append("| " + " | ".join(row) + " |")
    return "\n".join(out)


def write_contract(rows: list[dict[str, str]], out_path: Path) -> None:
    table_rows: list[list[str]] = []
    for r in rows:
        table_rows.append(
            [
                r["bk_id"],
                r["macro"],
                r["owner"],
                r["prioridade"],
                r["dependencias"],
                r["rf_rnf"],
                r["sprint"],
                r["core_or_reforco"],
                r["proximo_bk"],
                normalize_guia_path(r["guia"]),
            ]
        )

    content = f"""# CONTRATO-CAMPOS-BK

## Header
- `doc_id`: `CONTRATO-CAMPOS-BK`
- `path`: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Formalizar o contrato de campos BK para eliminar drift entre matriz, backlog, guias e sprints.

## Campos obrigatorios
- `bk_id`: identificador canónico.
- `macro`: macro funcional `MF0..MF8`.
- `owner`: responsavel principal.
- `prioridade`: `P0|P1|P2`.
- `dependencias`: lista de BK predecessores.
- `rf_rnf`: requisitos cobertos.
- `sprint`: janela de sprints de execucao.
- `core_or_reforco`: `P0=>Reforco`, `P1/P2=>Core`.
- `proximo_bk`: recomendacao de handoff.
- `guia_path`: caminho canónico do guia BK.

## Regras de consistencia
1. `bk_id` existe em matriz, backlog e guia.
2. `owner/prioridade/dependencias/rf_rnf/sprint/core_or_reforco` iguais entre matriz e backlog.
3. `guia_path` aponta para ficheiro existente.
4. Alteracao de contrato exige regeneracao dos anexos no mesmo commit.

## Tabela canónica de campos
{fmt_md_table([
    'bk_id', 'macro', 'owner', 'prioridade', 'dependencias', 'rf_rnf', 'sprint', 'core_or_reforco', 'proximo_bk', 'guia_path'
], table_rows)}

## Changelog
- `{TODAY}`: contrato de campos BK criado para governanca canónica StudyFlow.
"""
    out_path.write_text(content, encoding="utf-8")


def write_rf_annex(rows: list[dict[str, str]], out_path: Path) -> None:
    m: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        for req in parse_items(r["rf_rnf"]):
            if req.startswith("RF"):
                m[req].append(r["bk_id"])
    table_rows = [[k, str(len(v)), ", ".join(v)] for k, v in sorted(m.items(), key=lambda x: int(x[0][2:]))]

    content = f"""# ANEXO-RF-PARA-BKS

## Header
- `doc_id`: `ANEXO-RF-PARA-BKS`
- `path`: `docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Rastreabilidade bidirecional `RF -> BK` gerada automaticamente.

## Mapeamento RF -> BKs
{fmt_md_table(['rf', 'total_bk', 'bks'], table_rows)}

## Changelog
- `{TODAY}`: anexo RF gerado automaticamente.
"""
    out_path.write_text(content, encoding="utf-8")


def write_rnf_annex(rows: list[dict[str, str]], out_path: Path) -> None:
    m: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        for req in parse_items(r["rf_rnf"]):
            if req.startswith("RNF"):
                m[req].append(r["bk_id"])
    table_rows = [[k, str(len(v)), ", ".join(v)] for k, v in sorted(m.items(), key=lambda x: int(x[0][3:]))]

    content = f"""# ANEXO-RNF-PARA-BKS

## Header
- `doc_id`: `ANEXO-RNF-PARA-BKS`
- `path`: `docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Rastreabilidade bidirecional `RNF -> BK` gerada automaticamente.

## Mapeamento RNF -> BKs
{fmt_md_table(['rnf', 'total_bk', 'bks'], table_rows)}

## Changelog
- `{TODAY}`: anexo RNF gerado automaticamente.
"""
    out_path.write_text(content, encoding="utf-8")


def write_bk_sprint_owner(rows: list[dict[str, str]], out_path: Path) -> None:
    table_rows = []
    for r in rows:
        table_rows.append(
            [
                r["bk_id"],
                r["macro"],
                r["sprint"],
                r["owner"],
                r["apoio"],
                r["prioridade"],
                r["core_or_reforco"],
                r["rf_rnf"],
                r["dependencias"],
                normalize_guia_path(r["guia"]),
            ]
        )

    content = f"""# ANEXO-BK-SPRINT-OWNER

## Header
- `doc_id`: `ANEXO-BK-SPRINT-OWNER`
- `path`: `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Rastreabilidade operacional `BK -> Sprint -> Owner` com contrato `Core/Reforco`.

## Mapeamento canónico
{fmt_md_table([
    'bk_id', 'macro', 'sprint', 'owner', 'apoio', 'prioridade', 'core_or_reforco', 'rf_rnf', 'dependencias', 'guia_path'
], table_rows)}

## Changelog
- `{TODAY}`: anexo BK/Sprint/Owner gerado automaticamente.
"""
    out_path.write_text(content, encoding="utf-8")


def main() -> None:
    plan_root = Path(__file__).resolve().parents[1]
    backlogs_dir = plan_root / "backlogs"

    rows = extract_global_rows(backlogs_dir / "BACKLOG-MVP.md")

    write_contract(rows, backlogs_dir / "CONTRATO-CAMPOS-BK.md")
    write_rf_annex(rows, backlogs_dir / "ANEXO-RF-PARA-BKS.md")
    write_rnf_annex(rows, backlogs_dir / "ANEXO-RNF-PARA-BKS.md")
    write_bk_sprint_owner(rows, backlogs_dir / "ANEXO-BK-SPRINT-OWNER.md")

    print(f"Anexos gerados: {len(rows)} BK processados.")


if __name__ == "__main__":
    main()
