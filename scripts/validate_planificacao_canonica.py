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
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import Any
from urllib.parse import unquote

EXPECTED_PROJECT = "studyflow"
EXPECTED_RF_COUNT = 57
EXPECTED_RNF_COUNT = 45
EXPECTED_BK_COUNT = 107
ALLOWED_REAL_DEV_STATUSES = {
    "VALIDADO",
    "IMPLEMENTADO_NAO_VALIDADO",
    "PARCIAL",
    "MITIGADO_POR_ESCOPO",
    "BLOQUEADO_OPERADOR",
    "NAO_IMPLEMENTADO",
    "NAO_APLICAVEL",
}
ALLOWED_PEDAGOGICAL_STATES = {"TODO", "DONE"}
PRIVATE_REFERENCE_SECTION_MARKERS = (
    "fonte privada",
    "implementacao de referencia",
    "private source",
    "reference implementation",
)
REAL_DEV_TEACHING_PATH_RE = re.compile(
    r"(?<![\w.-])(?:\./)?real_dev[\\/](?:api|web)(?=$|[\\/\s`'\"()\[\]{}:;,.*?])",
    flags=re.IGNORECASE,
)
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
    "docs/planificacao/ESTADO-REFERENCIA-REAL_DEV.md",
    "docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md",
    "docs/technical/STUDYFLOW-TECHNICAL-MAP.md",
    "docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md",
    "docs/ops/LOCAL-PAP-RUNBOOK.md",
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
    "real_dev_status",
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
    "real_dev_status",
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
    "real_dev_status",
    "esforco",
    "dependencias",
    "rf_rnf",
    "fase_documental",
    "sprint",
    "core_or_reforco",
    "proximo_bk",
    "guia",
]
REFERENCE_STATUS_COLUMNS = [
    "BK",
    "real_dev_status",
    "Evidence no manifesto atual",
    "Risco residual",
    "Condição de reabertura/promoção",
]
HISTORICAL_REPORT_PATTERNS = [
    "docs/AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md",
    "docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF*.md",
    "docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF*.md",
    "docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF*.md",
    "docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF*.md",
    "docs/planificacao/guias-bk/PLANO-EXECUCAO-real_dev-MF*.md",
    "docs/evidence/MF8/TESTES-EM-FALTA.md",
    "docs/evidence/MF8/TESTES-FINAIS.md",
    "docs/evidence/MF8/CORRECAO-ERROS.md",
]
HISTORICAL_BANNER_FIELDS = [
    "status: SUPERSEDED",
    "authoritative_for_release: false",
    "superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md",
]

# Each final contract must occur in normative documentation.  Several entries
# intentionally use multiple required needles so that a vague mention does not
# satisfy the check.
REQUIRED_FINAL_CONTRACTS = {
    "session_v2": ["userId", "sessionVersion", "SESSION_REVOKED", "accountStatus"],
    "governed_ai": ["GovernedAiExecutionService", "ROOM_AI", "reserva atómica"],
    "privacy_registry": [
        "PersonalDataRegistry",
        "PULL_MEMBERSHIP",
        "ANONYMIZE_90D",
        "RETAIN_NONPERSONAL",
    ],
    "storage_atomic": ["0700", "0600", "SHA-256", "staging", "reconciliação"],
    "recoverable_jobs": ["lease", "heartbeat", "fencing", "latestByMaterial=true"],
    "official_tests": ["DRAFT", "PUBLISHED", "CLOSED", "BEST_ATTEMPT", "attemptCount"],
    "minimal_notifications": ["suppressedRecipientIds", "contagens agregadas"],
    "frontend_contract": ["ProtectedLayout", "RoleGuard", "ApiError", "useAsyncAction", "unavailable"],
    "health_contract": ["/api/health/live", "/api/health/ready", "503"],
    "release_contract": ["verify:local-release", "AES-256-GCM", "24 h", "60 min"],
    "runtime_contract": ["24.11.1", "11.6.2", "127.0.0.1", "ipaddr.js"],
    "reference_state": ["real_dev_status", "IMPLEMENTADO_NAO_VALIDADO", "BLOQUEADO_OPERADOR"],
}


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


def fenced_code_blocks(text: str) -> list[str]:
    """Return Markdown fenced blocks, excluding surrounding explanatory prose."""

    return re.findall(r"```[^\n]*\n(.*?)```", text, flags=re.DOTALL)


def fold_for_contract_match(value: str) -> str:
    """Normalize accents/case without weakening path or state comparisons."""

    normalized = unicodedata.normalize("NFKD", value.casefold())
    return "".join(char for char in normalized if not unicodedata.combining(char))


def is_public_teaching_document(path: Path) -> bool:
    """Return whether the path follows the public student-guide contract."""

    normalized = path.as_posix()
    if "scripts/fixtures/docs-semantic/" in normalized:
        return True
    if path.name == "_TEMPLATE-BK.md":
        return True
    return bool(
        re.search(
            r"(?:^|/)docs/planificacao/guias-bk/MF\d+/BK-MF\d+-\d+[^/]*\.md$",
            normalized,
        )
    )


def has_private_reference_label(value: str) -> bool:
    """Accept only explicit private-source/reference-implementation labels."""

    folded = fold_for_contract_match(value)
    return any(marker in folded for marker in PRIVATE_REFERENCE_SECTION_MARKERS)


def inspect_public_teaching_paths(path: Path, text: str) -> list[str]:
    """Reject private `real_dev` paths in public, copyable teaching content.

    A `real_dev/api` or `real_dev/web` path is allowed only below a Markdown
    heading explicitly labelled as a private source/reference implementation,
    or on an evidence line where that label appears before the path.  Nested
    headings inherit the explicit private-reference scope until a heading at
    the same or a higher level closes it.
    """

    if not is_public_teaching_document(path):
        return []

    issues: list[str] = []
    section_stack: list[tuple[int, bool]] = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        heading = re.match(r"^(#{1,6})\s+(.+?)\s*#*\s*$", line)
        if heading:
            level = len(heading.group(1))
            while section_stack and section_stack[-1][0] >= level:
                section_stack.pop()
            inherited_private = section_stack[-1][1] if section_stack else False
            section_stack.append(
                (level, inherited_private or has_private_reference_label(heading.group(2)))
            )

        private_section = section_stack[-1][1] if section_stack else False
        for match in REAL_DEV_TEACHING_PATH_RE.finditer(line):
            explicitly_labelled_line = has_private_reference_label(line[: match.start()])
            if private_section or explicitly_labelled_line:
                continue
            issues.append(f"{path.as_posix()}:{line_number}: public_teaching_real_dev_path")
            break
    return issues


def pedagogical_state_tokens(value: str) -> list[str]:
    """Extract the uppercase state vocabulary from a header/table cell."""

    return [token.strip().upper() for token in value.replace("`", "").split("|") if token.strip()]


def inspect_pedagogical_state_patterns(path: Path, text: str) -> list[str]:
    """Fixture scanner for forbidden pedagogical state values."""

    issues: list[str] = []
    lines = text.splitlines()
    for line_number, line in enumerate(lines, start=1):
        header = re.match(r"^\s*-\s*`estado`\s*:\s*`([^`]*)`", line, flags=re.IGNORECASE)
        if header:
            tokens = pedagogical_state_tokens(header.group(1))
            if not tokens or not set(tokens).issubset(ALLOWED_PEDAGOGICAL_STATES):
                issues.append(f"{path.as_posix()}:{line_number}: invalid_pedagogical_state")

    for index, line in enumerate(lines):
        if not line.strip().startswith("|"):
            continue
        headers = [normalize_cell(cell).strip("`").casefold() for cell in line.strip().strip("|").split("|")]
        if "estado" not in headers or index + 1 >= len(lines):
            continue
        separator = lines[index + 1]
        if not separator.strip().startswith("|") or "---" not in separator:
            continue
        state_index = headers.index("estado")
        for row_index, row_line in enumerate(lines[index + 2 :], start=index + 3):
            if not row_line.strip().startswith("|"):
                break
            cells = [normalize_cell(cell) for cell in row_line.strip().strip("|").split("|")]
            if len(cells) != len(headers):
                continue
            tokens = pedagogical_state_tokens(cells[state_index])
            if len(tokens) != 1 or tokens[0] not in ALLOWED_PEDAGOGICAL_STATES:
                issues.append(f"{path.as_posix()}:{row_index}: invalid_pedagogical_state")
        break
    return issues


def inspect_semantic_patterns(path: Path, text: str) -> list[str]:
    """Detect executable legacy patterns in a guide or semantic fixture."""

    code = "\n".join(fenced_code_blocks(text))
    issues = inspect_public_teaching_paths(path, text)
    if "scripts/fixtures/docs-semantic/" in path.as_posix():
        issues.extend(inspect_pedagogical_state_patterns(path, text))
    patterns = [
        ("direct_ai_provider", r"@Inject\(AI_PROVIDER\)"),
        ("redis_full_user", r"(?:user\s*:\s*AuthenticatedUser|JSON\.stringify\(\s*\{\s*user\b|payload\.user\b)"),
        ("fire_and_forget_job", r"\bvoid\s+this\.(?:run|process)\w*(?:Job|Index)\s*\("),
        ("overlapping_polling", r"setInterval\s*\(\s*async\b"),
    ]
    for label, pattern in patterns:
        if re.search(pattern, code):
            issues.append(f"{path.as_posix()}: {label}")

    for block in fenced_code_blocks(text):
        if not re.search(r"\b(?:recipientIds|suppressedRecipientIds)\s*[?:]", block):
            continue
        if re.search(
            r"(?:(?:export\s+)?(?:type|interface|class)\s+\w*(?:Dto|DTO|Response|View)\s*(?:=|extends\s+[^\{]+)?\s*\{[^}]*recipientIds|export\s+type\s+ContextNotification\s*=\s*\{[^}]*recipientIds|return\s*\{[^}]*recipientIds)",
            block,
            flags=re.DOTALL,
        ):
            issues.append(f"{path.as_posix()}: public_recipient_ids")
            break

    if "processamento-de-documentos-em-sandbox-seguro" in path.name and re.search(r"Promise\.race\s*\(", code):
        issues.append(f"{path.as_posix()}: parser_timeout_only_promise_race")
    if (
        "health" in path.name.casefold()
        and re.search(r"@(?:Get|HttpCode)\([^\n]*(?:health|200|HttpStatus\.OK)", code)
        and "/ready" not in text
        and "503" not in text
    ):
        issues.append(f"{path.as_posix()}: health_always_200")

    for line_number, line in enumerate(text.splitlines(), start=1):
        folded = line.casefold()
        if not ("e2e" in folded or "playwright" in folded):
            continue
        if "opcional" in folded and not any(
            safe in folded
            for safe in ("não é opcional", "nunca é opcional", "nao e opcional", "obrigatório", "obrigatorio")
        ):
            issues.append(f"{path.as_posix()}:{line_number}: e2e_optional_final_gate")
    return issues


def collect_normative_documentation(root: Path, guide_files: list[Path]) -> str:
    paths = guide_files + [
        root / "docs/RF.md",
        root / "docs/RNF.md",
        root / "docs/planificacao/README.md",
        root / "docs/planificacao/ESTADO-REFERENCIA-REAL_DEV.md",
        root / "docs/planificacao/features/PLANO-CHAT-WEBSOCKET-ALUNO-PROFESSOR.md",
        root / "docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md",
        root / "docs/technical/STUDYFLOW-TECHNICAL-MAP.md",
        root / "docs/ops/LOCAL-PAP-RUNBOOK.md",
    ]
    return "\n".join(path.read_text(encoding="utf-8") for path in paths if path.exists())


def validate_semantic_contracts(root: Path, guide_files: list[Path]) -> list[str]:
    """Validate prohibited examples and presence of every final contract group."""

    issues: list[str] = []
    semantic_paths = (
        [root / "docs/planificacao/guias-bk/_TEMPLATE-BK.md"]
        + guide_files
        + sorted((root / "docs/planificacao/features").glob("*.md"))
        + sorted((root / "docs/planificacao/sprints").glob("*.md"))
    )
    for path in semantic_paths:
        relative = Path(as_project_relative(path, root))
        issues.extend(inspect_semantic_patterns(relative, path.read_text(encoding="utf-8")))

    corpus = collect_normative_documentation(root, guide_files)
    for contract, needles in REQUIRED_FINAL_CONTRACTS.items():
        missing = [needle for needle in needles if needle not in corpus]
        if missing:
            issues.append(f"contrato final {contract}: termos em falta {', '.join(missing)}")
    return issues


def historical_report_paths(root: Path) -> list[Path]:
    reports: set[Path] = set()
    for pattern in HISTORICAL_REPORT_PATTERNS:
        reports.update(root.glob(pattern))
    return sorted(reports)


def validate_historical_authority(root: Path) -> list[str]:
    issues: list[str] = []
    for path in historical_report_paths(root):
        prefix_lines = {
            line.strip() for line in path.read_text(encoding="utf-8").splitlines()[:16]
        }
        missing = [field for field in HISTORICAL_BANNER_FIELDS if field not in prefix_lines]
        if missing:
            issues.append(
                f"{as_project_relative(path, root)}: banner histórico incompleto ({', '.join(missing)})"
            )
    return issues


def validate_pedagogical_states(
    root: Path,
    matrix_rows: list[dict[str, str]],
    backlog_rows: list[dict[str, str]],
    guide_headers: dict[str, tuple[Path, dict[str, str]]],
) -> list[str]:
    """Enforce the independent pedagogical state vocabulary fail-closed."""

    issues: list[str] = []
    template_path = root / "docs/planificacao/guias-bk/_TEMPLATE-BK.md"
    if template_path.exists():
        template_value = parse_guide_header(template_path).get("estado", "")
        template_tokens = pedagogical_state_tokens(template_value)
        if template_tokens != ["TODO", "DONE"]:
            issues.append(
                "docs/planificacao/guias-bk/_TEMPLATE-BK.md: "
                f"invalid_pedagogical_state_contract={template_value or 'AUSENTE'}"
            )

    for source, rows in (("matrix", matrix_rows), ("backlog", backlog_rows)):
        for row in rows:
            raw_value = row.get("estado", "")
            tokens = pedagogical_state_tokens(raw_value)
            if len(tokens) != 1 or tokens[0] not in ALLOWED_PEDAGOGICAL_STATES:
                issues.append(
                    f"{source}:{row.get('bk_id', 'BK_DESCONHECIDO')}: "
                    f"invalid_pedagogical_state={raw_value or 'AUSENTE'}"
                )

    for bk_id, (path, header) in sorted(guide_headers.items()):
        raw_value = header.get("estado", "")
        tokens = pedagogical_state_tokens(raw_value)
        if len(tokens) != 1 or tokens[0] not in ALLOWED_PEDAGOGICAL_STATES:
            issues.append(
                f"{as_project_relative(path, root)}: "
                f"invalid_pedagogical_state={raw_value or 'AUSENTE'} ({bk_id})"
            )

    declaration_paths = [
        root / "docs/planificacao/README.md",
        root / "docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md",
        root / "docs/planificacao/backlogs/BACKLOG-MVP.md",
        template_path,
    ]
    forbidden = re.compile(r"\b(?:IN_PROGRESS|BLOCKED)\b", flags=re.IGNORECASE)
    for path in declaration_paths:
        if not path.exists():
            continue
        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            folded = fold_for_contract_match(line)
            if "estado" not in folded or ":" not in line or not forbidden.search(line):
                continue
            issues.append(
                f"{as_project_relative(path, root)}:{line_number}: "
                "invalid_pedagogical_state_declaration"
            )
    return issues


def extract_manifest_sha(text: str) -> str | None:
    match = re.search(r"^implementation_manifest_sha256:\s*([a-f0-9]{64})\s*$", text, flags=re.MULTILINE)
    return match.group(1) if match else None


def calculate_current_manifest(root: Path) -> tuple[str | None, str | None]:
    """Run the canonical read-only manifest generator and return its SHA-256."""

    script = root / "real_dev/api/src/scripts/generate-implementation-manifest.mjs"
    if not script.exists():
        return None, "gerador de manifesto ausente"
    result = subprocess.run(
        ["node", str(script)],
        cwd=root,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return None, f"gerador de manifesto falhou com exit code {result.returncode}"
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError:
        return None, "gerador de manifesto não devolveu JSON válido"
    sha256 = payload.get("sha256")
    if not isinstance(sha256, str) or not re.fullmatch(r"[a-f0-9]{64}", sha256):
        return None, "gerador de manifesto não devolveu SHA-256 válido"
    return sha256, None


def validate_manifest_links(root: Path) -> list[str]:
    issues: list[str] = []
    current, error = calculate_current_manifest(root)
    if error:
        return [error]
    linked_paths = [
        "docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md",
        "docs/planificacao/ESTADO-REFERENCIA-REAL_DEV.md",
        "docs/technical/STUDYFLOW-TECHNICAL-MAP.md",
        "docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md",
    ]
    for relative in linked_paths:
        path = root / relative
        if not path.exists():
            issues.append(f"{relative}: ficheiro ligado ao manifesto ausente")
            continue
        linked = extract_manifest_sha(path.read_text(encoding="utf-8"))
        if linked != current:
            issues.append(f"{relative}: manifesto ligado {linked or 'AUSENTE'} != atual {current}")
    return issues


def validate_reference_statuses(
    root: Path,
    matrix_by_bk: dict[str, dict[str, str]],
    backlog_by_bk: dict[str, dict[str, str]],
    guide_headers: dict[str, tuple[Path, dict[str, str]]],
) -> list[str]:
    issues: list[str] = []
    reference_path = root / "docs/planificacao/ESTADO-REFERENCIA-REAL_DEV.md"
    if not reference_path.exists():
        return ["ESTADO-REFERENCIA-REAL_DEV.md ausente"]
    rows = parse_markdown_table(
        reference_path.read_text(encoding="utf-8"),
        REFERENCE_STATUS_COLUMNS,
        section_heading="## Estado por BK",
    )
    reference = {row["BK"]: row for row in rows}
    if len(reference) != EXPECTED_BK_COUNT:
        issues.append(f"referência real_dev: esperados 107 BK, encontrados {len(reference)}")

    all_bks = set(matrix_by_bk) | set(backlog_by_bk) | set(guide_headers)
    for bk_id in sorted(all_bks):
        statuses = {
            "matrix": matrix_by_bk.get(bk_id, {}).get("real_dev_status"),
            "backlog": backlog_by_bk.get(bk_id, {}).get("real_dev_status"),
            "guide": guide_headers.get(bk_id, (Path(), {}))[1].get("real_dev_status"),
            "reference": reference.get(bk_id, {}).get("real_dev_status"),
        }
        if any(status not in ALLOWED_REAL_DEV_STATUSES for status in statuses.values()):
            issues.append(f"{bk_id}: real_dev_status ausente/inválido {statuses}")
        elif len(set(statuses.values())) != 1:
            issues.append(f"{bk_id}: drift de real_dev_status {statuses}")
        row = reference.get(bk_id)
        if row and any(not row[column] or row[column] == "-" for column in REFERENCE_STATUS_COLUMNS[2:]):
            issues.append(f"{bk_id}: evidence/risco/reabertura incompletos")
    return issues


def validate_secret_evidence(root: Path) -> list[str]:
    """Scan every document for high-confidence secrets and evidence for passwords."""

    issues: list[str] = []
    high_confidence = [
        ("openai_key", re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b")),
        ("authenticated_uri", re.compile(r"\b(?:mongodb(?:\+srv)?|redis|https?)://[^\s/:@]+:[^\s/@]+@", re.I)),
        ("private_key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
        ("jwt", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
    ]
    historical = set(historical_report_paths(root)) | set((root / "docs/evidence").rglob("*.md"))
    password_assignment = re.compile(
        r"(?:PASSWORD|password|senha)\s*(?:=|:)\s*([^\s|`]+)",
    )
    allowed_password_values = {"<redacted>", "[REDACTED]", "REDACTED", "***", "<secret>", "PENDENTE"}
    for path in sorted((root / "docs").rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        relative = as_project_relative(path, root)
        for label, pattern in high_confidence:
            if pattern.search(text):
                issues.append(f"{relative}: possível segredo ({label})")
        if path in historical:
            for line in text.splitlines():
                if "rg -n" in line or line.lstrip().startswith(("# rg ", "grep ")):
                    continue
                match = password_assignment.search(line)
                if match and match.group(1) not in allowed_password_values:
                    issues.append(f"{relative}: password literal em evidence histórica")
                    break
    return issues


def run_semantic_fixture_tests(root: Path) -> dict[str, Any]:
    """Prove that every supported legacy pattern is rejected."""

    fixture_root = root / "scripts/fixtures/docs-semantic"
    expected = {
        "negative-ai-provider.md": "direct_ai_provider",
        "negative-session-payload.md": "redis_full_user",
        "negative-void-job.md": "fire_and_forget_job",
        "negative-async-interval.md": "overlapping_polling",
        "negative-processamento-de-documentos-em-sandbox-seguro.md": "parser_timeout_only_promise_race",
        "negative-recipient-ids.md": "public_recipient_ids",
        "negative-health-always-200.md": "health_always_200",
        "negative-e2e-optional.md": "e2e_optional_final_gate",
        "negative-public-teaching-real-dev-path.md": "public_teaching_real_dev_path",
        "negative-pedagogical-state.md": "invalid_pedagogical_state",
    }
    failures: list[str] = []
    positive = fixture_root / "positive.md"
    if not positive.exists():
        failures.append("positive.md ausente")
    else:
        positive_issues = inspect_semantic_patterns(positive.relative_to(root), positive.read_text(encoding="utf-8"))
        if positive_issues:
            failures.append(f"positive.md rejeitado: {positive_issues}")
    for name, label in expected.items():
        path = fixture_root / name
        if not path.exists():
            failures.append(f"{name} ausente")
            continue
        issues = inspect_semantic_patterns(path.relative_to(root), path.read_text(encoding="utf-8"))
        if not any(label in issue for issue in issues):
            failures.append(f"{name} não ativou {label}: {issues}")
    return {
        "fixtures": 1 + len(expected),
        "failures": failures,
        "pass": not failures,
    }


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
    markdown_paths = (
        sorted((root / "docs").rglob("*.md"))
        + sorted((root / "real_dev/docs").rglob("*.md"))
        + [root / "real_dev/web/tests/e2e/README.md", root / "README.md"]
    )
    for markdown_path in markdown_paths:
        if not markdown_path.exists():
            continue
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
            "real_dev_status",
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
            for field in ["macro", "owner", "apoio", "prioridade", "estado", "real_dev_status", "esforco", "dependencias", "rf_rnf", "fase_documental", "sprint", "core_or_reforco", "guia_path"]:
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

    semantic_contract_issues = validate_semantic_contracts(root, guide_files)
    pedagogical_state_issues = validate_pedagogical_states(
        root,
        matrix_rows,
        backlog_rows,
        guide_headers,
    )
    reference_status_issues = validate_reference_statuses(
        root,
        matrix_by_bk,
        backlog_by_bk,
        guide_headers,
    )
    historical_authority_issues = validate_historical_authority(root)
    manifest_link_issues = validate_manifest_links(root)
    secret_evidence_issues = validate_secret_evidence(root)

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
        + pedagogical_state_issues
        + reference_status_issues
        + historical_authority_issues
        + manifest_link_issues
        + secret_evidence_issues
    )
    coverage_issues = missing_rf_matrix + missing_rnf_matrix + missing_rf_backlog + missing_rnf_backlog + invalid_refs
    guide_issues = guide_header_issues + guide_content_issues

    status = {
        "coverage_pass": not coverage_issues,
        "consistency_pass": not consistency_issues,
        "guides_pass": not guide_issues,
        "governance_pass": not governance_issues,
        "adequacao_12o_pass": not adequacao_12o_issues,
        "score_ge_97": not (
            coverage_issues
            or consistency_issues
            or guide_issues
            or semantic_contract_issues
            or governance_issues
            or adequacao_12o_issues
        ),
        "drift_critical_zero": not drift_issues,
        "semantic_contracts_pass": not semantic_contract_issues,
        "pedagogical_states_pass": not pedagogical_state_issues,
        "reference_status_pass": not reference_status_issues,
        "historical_authority_pass": not historical_authority_issues,
        "manifest_links_pass": not manifest_link_issues,
        "secret_evidence_pass": not secret_evidence_issues,
    }
    status["overall_pass"] = all(status.values())

    breakdown = {
        "Cobertura/rastreabilidade": 25 if status["coverage_pass"] else 0,
        "Coerencia documental": 20 if status["consistency_pass"] and status["drift_critical_zero"] else 0,
        "Pedagogia/guidance/step-by-step": 25 if status["guides_pass"] and status["semantic_contracts_pass"] else 0,
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
        "semantic_contract_issues": semantic_contract_issues,
        "pedagogical_state_issues": pedagogical_state_issues,
        "reference_status_issues": reference_status_issues,
        "historical_authority_issues": historical_authority_issues,
        "manifest_link_issues": manifest_link_issues,
        "secret_evidence_issues": secret_evidence_issues,
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
    parser.add_argument(
        "--semantic-fixtures",
        action="store_true",
        help="Executa fixtures positivas/negativas do scanner sem validar o projeto.",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    if args.semantic_fixtures:
        result = run_semantic_fixture_tests(root)
        print(json.dumps(result, ensure_ascii=False, indent=2) if args.json else ("PASS" if result["pass"] else "FAIL"))
        if not result["pass"]:
            raise SystemExit(1)
        return
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
