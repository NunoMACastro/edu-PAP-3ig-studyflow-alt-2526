#!/usr/bin/env python3
"""Synchronise the independent real_dev status across planning documents.

The pedagogical ``estado`` field is intentionally left untouched.  This
generator only owns ``real_dev_status`` and the generated reference blocks.
It defaults to the conservative ``IMPLEMENTADO_NAO_VALIDADO`` state: source
presence in a manifest is not evidence that a BK acceptance suite passed.
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path


ALLOWED_STATUSES = {
    "VALIDADO",
    "IMPLEMENTADO_NAO_VALIDADO",
    "PARCIAL",
    "MITIGADO_POR_ESCOPO",
    "BLOQUEADO_OPERADOR",
    "NAO_IMPLEMENTADO",
    "NAO_APLICAVEL",
}

# These overrides are decisions from the remediation ledger, not inferences
# from the student's progress field.
STATUS_OVERRIDES = {
    "BK-MF0-01": "PARCIAL",  # email/password exists; email verification/SSO do not.
    "BK-MF3-11": "PARCIAL",  # preferences/in-app exist; email/push delivery do not.
    "BK-MF5-11": "PARCIAL",  # local timeout/bulkheads do not guarantee provider latency.
    "BK-MF5-12": "PARCIAL",  # 200 requests with one authenticated session, not 200 users.
    "BK-MF6-03": "MITIGADO_POR_ESCOPO",  # single-instance local PAP.
    "BK-MF6-04": "MITIGADO_POR_ESCOPO",  # loopback only; public TLS reopens it.
    "BK-MF6-11": "BLOQUEADO_OPERADOR",  # OP-005: key and real restore drill.
    "BK-MF7-02": "MITIGADO_POR_ESCOPO",  # no public uptime/SLA claim.
    "BK-MF7-07": "BLOQUEADO_OPERADOR",  # OP-001 and OP-005 block release gate.
    "BK-MF8-16": "BLOQUEADO_OPERADOR",  # final release gate remains fail-closed.
}

BEGIN_MARKER = "<!-- REAL_DEV_STATUS:BEGIN -->"
END_MARKER = "<!-- REAL_DEV_STATUS:END -->"


@dataclass(frozen=True)
class BkRow:
    bk_id: str
    macro: str
    title: str
    status: str
    guide_path: str


def split_table_row(line: str) -> list[str]:
    """Split a Markdown table row while preserving normalized cell values."""

    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def join_table_row(cells: list[str]) -> str:
    return "| " + " | ".join(cells) + " |"


def add_status_column(text: str, *, path_column: str) -> tuple[str, list[BkRow]]:
    """Insert or refresh ``real_dev_status`` in the first canonical BK table."""

    lines = text.splitlines()
    header_index = next(
        index
        for index, line in enumerate(lines)
        if line.startswith("| bk_id |") and path_column in split_table_row(line)
    )
    header = split_table_row(lines[header_index])
    if "real_dev_status" not in header:
        header.insert(header.index("estado") + 1, "real_dev_status")
        lines[header_index] = join_table_row(header)
        separator = split_table_row(lines[header_index + 1])
        separator.insert(header.index("real_dev_status"), "---")
        lines[header_index + 1] = join_table_row(separator)

    rows: list[BkRow] = []
    index = header_index + 2
    while index < len(lines) and lines[index].startswith("| BK-MF"):
        cells = split_table_row(lines[index])
        # Older rows do not yet have the new column.
        if len(cells) == len(header) - 1:
            cells.insert(header.index("real_dev_status"), "")
        values = dict(zip(header, cells, strict=True))
        status = STATUS_OVERRIDES.get(values["bk_id"], "IMPLEMENTADO_NAO_VALIDADO")
        values["real_dev_status"] = status
        cells = [values[column] for column in header]
        lines[index] = join_table_row(cells)
        rows.append(
            BkRow(
                bk_id=values["bk_id"],
                macro=values["macro"],
                title=values["titulo"],
                status=status,
                guide_path=values[path_column],
            )
        )
        index += 1

    return "\n".join(lines) + "\n", rows


def update_guide_header(text: str, status: str) -> str:
    """Add or replace ``real_dev_status`` directly after pedagogical ``estado``."""

    status_line = f"- `real_dev_status`: `{status}`"
    if re.search(r"^- `real_dev_status`: `[^`]+`$", text, flags=re.MULTILINE):
        updated = re.sub(
            r"^- `real_dev_status`: `[^`]+`$",
            status_line,
            text,
            count=1,
            flags=re.MULTILINE,
        )
    else:
        updated = re.sub(
            r"(^- `estado`: `[^`]+`$)",
            rf"\1\n{status_line}",
            text,
            count=1,
            flags=re.MULTILINE,
        )
    return re.sub(
        r"^- `last_updated`: `[^`]+`$",
        "- `last_updated`: `2026-07-10`",
        updated,
        count=1,
        flags=re.MULTILINE,
    )


def evidence_for(row: BkRow, manifest: str) -> str:
    short = f"{manifest[:8]}…{manifest[-5:]}"
    if row.bk_id == "BK-MF0-01":
        return f"MANIFEST `{short}`: auth email/password; SSO/email verification ausentes"
    if row.bk_id == "BK-MF5-12":
        return f"MANIFEST `{short}` + smoke 200/200 com uma sessão autenticada"
    if row.bk_id in {"BK-MF6-03", "BK-MF6-04", "BK-MF7-02"}:
        return f"MANIFEST `{short}` + controlo compensatório `local-pap`/loopback"
    if row.bk_id == "BK-MF6-11":
        return f"MANIFEST `{short}` + testes unitários; OP-005 sem restore real"
    if row.bk_id in {"BK-MF7-07", "BK-MF8-16"}:
        return f"MANIFEST `{short}` + gate fail-closed; OP-001/OP-005 pendentes"
    if row.status == "PARCIAL":
        return f"MANIFEST `{short}`: implementação local parcial, sem garantia externa"
    return f"MANIFEST `{short}` + inventário fonte; aceitação BK específica não repetida"


def residual_risk(row: BkRow) -> str:
    if row.status == "IMPLEMENTADO_NAO_VALIDADO":
        return "Código presente; falta evidence BK específica no manifesto corrente."
    if row.status == "PARCIAL":
        return "A parte não demonstrada não pode ser apresentada como implementada."
    if row.status == "MITIGADO_POR_ESCOPO":
        return "Válido apenas para PAP local, single-instance e loopback."
    if row.status == "BLOQUEADO_OPERADOR":
        return "Gate manual pendente; não existe aptidão global/release."
    return "Sem risco documental adicional registado."


def reopen_condition(row: BkRow) -> str:
    if row.bk_id == "BK-MF0-01":
        return "Reavaliar ao contratar SSO ou verificação de email."
    if row.bk_id == "BK-MF5-12":
        return "Promover só após carga com 200 utilizadores/sessões distintos."
    if row.bk_id == "BK-MF6-03":
        return "Reabre com multi-instância ou horizontal scaling."
    if row.bk_id == "BK-MF6-04":
        return "Reabre com exposição pública; exige TLS/HSTS no edge."
    if row.bk_id == "BK-MF6-11":
        return "Promover só após chave manual e restore real para base local vazia."
    if row.bk_id in {"BK-MF7-07", "BK-MF8-16"}:
        return "Promover só após OP-001/OP-005 e `verify:local-release` integral."
    if row.bk_id == "BK-MF7-02":
        return "Reabre ao assumir SLA público ou monitorização multi-instância."
    return "Reabre quando o código mudar ou a evidence deixar de corresponder ao manifesto."


def render_reference(rows: list[BkRow], manifest: str) -> str:
    table_rows = [
        join_table_row(
            [
                row.bk_id,
                row.status,
                evidence_for(row, manifest),
                residual_risk(row),
                reopen_condition(row),
            ]
        )
        for row in rows
    ]
    table = "\n".join(table_rows)
    return f"""# Estado da implementação de referência (`real_dev`)

```yaml
doc_id: SF-REAL-DEV-STATUS
implementation_manifest_sha256: {manifest}
authority: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
target: PAP_LOCAL_ENDURECIDA
global_status: BLOQUEADO_OPERADOR
updated_at: 2026-07-10
```

## Regras

- `estado` nos guias/matriz/backlog mede apenas o progresso dos alunos.
- `real_dev_status` nunca é inferido de `estado`, da mera existência de um ficheiro ou de uma
  descrição narrativa.
- `VALIDADO` exige teste/evidence BK específica ligada ao manifesto corrente; por isso a
  classificação conservadora é `IMPLEMENTADO_NAO_VALIDADO` quando apenas o inventário de
  código foi confirmado.
- OP-001, OP-005 e SF-OBS-005 mantêm o estado global `BLOQUEADO_OPERADOR`.
- Este documento não declara produção nem aptidão global.

## Estado por BK

| BK | real_dev_status | Evidence no manifesto atual | Risco residual | Condição de reabertura/promoção |
| --- | --- | --- | --- | --- |
{table}
"""


def render_mf_views_block(rows: list[BkRow]) -> str:
    lines = [
        BEGIN_MARKER,
        "## Vista do estado independente de `real_dev`",
        "",
        "Esta vista é gerada a partir da mesma política usada nos headers, matriz e backlog.",
        "`estado` continua a representar apenas o progresso dos alunos.",
        "",
        "| BK | MF | real_dev_status |",
        "| --- | --- | --- |",
    ]
    lines.extend(join_table_row([row.bk_id, row.macro, row.status]) for row in rows)
    lines.append(END_MARKER)
    return "\n".join(lines)


def replace_generated_block(text: str, block: str) -> str:
    pattern = re.compile(
        rf"\n?{re.escape(BEGIN_MARKER)}.*?{re.escape(END_MARKER)}\n?",
        flags=re.DOTALL,
    )
    stripped = pattern.sub("\n", text).rstrip()
    return f"{stripped}\n\n{block}\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, help="Current 64-character implementation SHA-256.")
    parser.add_argument("--check", action="store_true", help="Fail if generated files differ.")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-f0-9]{64}", args.manifest):
        raise SystemExit("--manifest deve ser um SHA-256 hexadecimal com 64 caracteres")

    root = Path(__file__).resolve().parents[1]
    matrix_path = root / "docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md"
    backlog_path = root / "docs/planificacao/backlogs/BACKLOG-MVP.md"
    views_path = root / "docs/planificacao/backlogs/MF-VIEWS.md"
    reference_path = root / "docs/planificacao/ESTADO-REFERENCIA-REAL_DEV.md"

    matrix_text, rows = add_status_column(matrix_path.read_text(encoding="utf-8"), path_column="guia_path")
    backlog_text, backlog_rows = add_status_column(backlog_path.read_text(encoding="utf-8"), path_column="guia")
    if [row.bk_id for row in rows] != [row.bk_id for row in backlog_rows]:
        raise SystemExit("Matriz e backlog não têm a mesma sequência de BK")
    if len(rows) != 107:
        raise SystemExit(f"Esperados 107 BK, encontrados {len(rows)}")

    outputs: dict[Path, str] = {
        matrix_path: matrix_text,
        backlog_path: backlog_text,
        views_path: replace_generated_block(views_path.read_text(encoding="utf-8"), render_mf_views_block(rows)),
        reference_path: render_reference(rows, args.manifest),
    }
    for row in rows:
        guide_path = root / row.guide_path
        outputs[guide_path] = update_guide_header(guide_path.read_text(encoding="utf-8"), row.status)

    changed = [path for path, content in outputs.items() if not path.exists() or path.read_text(encoding="utf-8") != content]
    if args.check:
        if changed:
            for path in changed:
                print(path.relative_to(root).as_posix())
            raise SystemExit(1)
        print("real_dev_status: PASS (107 BK sincronizados)")
        return

    for path in changed:
        path.write_text(outputs[path], encoding="utf-8")
    print(f"real_dev_status: WRITE ({len(changed)} ficheiros; 107 BK)")


if __name__ == "__main__":
    main()
