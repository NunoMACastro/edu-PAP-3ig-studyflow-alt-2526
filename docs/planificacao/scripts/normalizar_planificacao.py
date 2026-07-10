#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
from collections import Counter, defaultdict

TODAY = date.today().isoformat()

REAL_DEV_STATUSES = {
    "VALIDADO",
    "IMPLEMENTADO_NAO_VALIDADO",
    "PARCIAL",
    "MITIGADO_POR_ESCOPO",
    "BLOQUEADO_OPERADOR",
    "NAO_IMPLEMENTADO",
    "NAO_APLICAVEL",
}

NEG_MIN_BY_PRIORITY = {"P0": 3, "P1": 2, "P2": 1}

SPRINT_WINDOW_BY_MACRO = {
    "MF0": "S01-S02",
    "MF1": "S03-S04",
    "MF2": "S05-S06",
    "MF3": "S07-S08",
    "MF4": "S08-S09",
    "MF5": "S09-S10",
    "MF6": "S10-S11",
    "MF7": "S11-S12",
    "MF8": "S12",
}

SPRINTS = [
    ("S01", "2026-04-13", "2026-04-19", "MF0", "Kickoff, setup tecnico e BK P0 iniciais"),
    ("S02", "2026-04-20", "2026-04-26", "MF0", "Fecho fundacoes e validacao de base"),
    ("S03", "2026-04-27", "2026-05-03", "MF1", "Nucleo funcional aluno/turma"),
    ("S04", "2026-05-04", "2026-05-10", "MF1", "Consolidacao MF1 + Gate S4"),
    ("S05", "2026-05-11", "2026-05-17", "MF2", "Conteudos oficiais e indexacao"),
    ("S06", "2026-05-18", "2026-05-24", "MF2", "IA academica e metricas de turma"),
    ("S07", "2026-05-25", "2026-05-31", "MF3", "Guardrails, pesquisa e colaboracao"),
    ("S08", "2026-06-01", "2026-06-07", "MF3/MF4", "Fecho MF3 + transicao MF4 + Gate S8"),
    ("S09", "2026-06-08", "2026-06-14", "MF4/MF5", "Governanca, privacidade e UX"),
    ("S10", "2026-06-15", "2026-06-21", "MF5/MF6", "Performance, acessibilidade e seguranca"),
    ("S11", "2026-06-22", "2026-06-28", "MF6/MF7", "Robustez tecnica e operacao"),
    ("S12", "2026-06-29", "2026-07-05", "MF7/MF8", "Fecho de produto, funcionalidades MF8 expandidas, testes finais e Gate S12"),
]

MACRO_LABEL = {
    "MF0": "Fundacoes de plataforma",
    "MF1": "Nucleo funcional I",
    "MF2": "Nucleo funcional II",
    "MF3": "Capacidades de produto I",
    "MF4": "Capacidades de produto II",
    "MF5": "Operacao e UX transversal",
    "MF6": "Qualidade, seguranca e performance",
    "MF7": "Operacao, modularidade e compliance",
    "MF8": "Fecho de produto, qualidade da IA e validação final",
}

MACRO_ORDER = [f"MF{i}" for i in range(0, 9)]


# ----------------------------
# parsing helpers
# ----------------------------


def split_md_row(line: str) -> list[str]:
    return [p.strip() for p in line.strip().strip("|").split("|")]


def validate_real_dev_status(value: str, source: str) -> str:
    normalized = value.strip().replace("`", "")
    if normalized not in REAL_DEV_STATUSES:
        allowed = "|".join(sorted(REAL_DEV_STATUSES))
        raise RuntimeError(f"real_dev_status inválido em {source}: {normalized!r}; esperado {allowed}")
    return normalized


def parse_reference_real_dev_statuses(plan_root: Path) -> dict[str, str]:
    """Lê a autoridade manual sem alterar evidence ou estados."""

    path = plan_root / "ESTADO-REFERENCIA-REAL_DEV.md"
    if not path.exists():
        return {}
    lines = path.read_text(encoding="utf-8").splitlines()
    statuses: dict[str, str] = {}

    for index, line in enumerate(lines):
        if not line.strip().startswith("|") or "bk_id" not in line or "real_dev_status" not in line:
            continue
        headers = split_md_row(line)
        try:
            bk_index = headers.index("bk_id")
            status_index = headers.index("real_dev_status")
        except ValueError:
            continue
        for row_line in lines[index + 2 :]:
            if not row_line.strip().startswith("|"):
                break
            columns = split_md_row(row_line)
            if len(columns) != len(headers):
                continue
            bk_id = columns[bk_index].replace("`", "").strip()
            if not re.fullmatch(r"BK-MF\d+-\d+", bk_id):
                continue
            status = validate_real_dev_status(columns[status_index], f"{path}:{bk_id}")
            if bk_id in statuses and statuses[bk_id] != status:
                raise RuntimeError(f"real_dev_status duplicado e divergente em {path}: {bk_id}")
            statuses[bk_id] = status
        break

    if not statuses:
        for line in lines:
            match = re.search(
                r"\b(BK-MF\d+-\d+)\b.*\b(" + "|".join(sorted(REAL_DEV_STATUSES)) + r")\b",
                line,
            )
            if match:
                statuses[match.group(1)] = validate_real_dev_status(match.group(2), str(path))
    return statuses


def parse_existing_guide_statuses(plan_root: Path) -> dict[str, str]:
    statuses: dict[str, str] = {}
    for path in sorted((plan_root / "guias-bk").glob("MF*/BK-MF*.md")):
        text = path.read_text(encoding="utf-8")
        bk_match = re.search(r"^- `bk_id`: `([^`]+)`", text, flags=re.MULTILINE)
        status_match = re.search(r"^- `real_dev_status`: `([^`]+)`", text, flags=re.MULTILINE)
        if not bk_match or not status_match:
            continue
        bk_id = bk_match.group(1)
        status = validate_real_dev_status(status_match.group(1), str(path))
        if bk_id in statuses and statuses[bk_id] != status:
            raise RuntimeError(f"Guias com real_dev_status divergente para {bk_id}")
        statuses[bk_id] = status
    return statuses


def parse_global_rows_from_backlog(path: Path) -> list[dict[str, str]]:
    lines = path.read_text(encoding="utf-8").splitlines()
    header_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and "bk_id" in line and "macro" in line and "titulo" in line and "owner" in line and "guia" in line:
            header_idx = i
            break
    if header_idx is None:
        raise RuntimeError("Tabela global de backlog nao encontrada.")

    end_idx = len(lines)
    for i in range(header_idx + 2, len(lines)):
        if lines[i].startswith("## MF0"):
            end_idx = i
            break

    headers = split_md_row(lines[header_idx])
    out: list[dict[str, str]] = []
    for line in lines[header_idx + 2 : end_idx]:
        if not line.strip().startswith("|"):
            continue
        cols = split_md_row(line)
        if len(cols) != len(headers):
            continue
        out.append(dict(zip(headers, cols)))
    if not out:
        raise RuntimeError("Tabela global de backlog sem linhas validas.")
    return out


def normalize_rows(
    raw_rows: list[dict[str, str]],
    reference_statuses: dict[str, str] | None = None,
    guide_statuses: dict[str, str] | None = None,
) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    reference_statuses = reference_statuses or {}
    guide_statuses = guide_statuses or {}

    for row in raw_rows:
        bk_id = row.get("bk_id", "").strip()
        macro = row.get("macro", "").strip()
        if not bk_id or not macro:
            continue

        def g(key: str, default: str = "-") -> str:
            val = row.get(key, "").strip()
            return val if val else default

        proximo = row.get("proximo_bk", "").strip() or row.get("proximo_bk_recomendado", "").strip() or "-"

        explicit_status = row.get("real_dev_status", "").strip().replace("`", "")
        reference_status = reference_statuses.get(bk_id, "")
        guide_status = guide_statuses.get(bk_id, "")
        available = [
            ("ESTADO-REFERENCIA-REAL_DEV.md", reference_status),
            ("tabela canónica", explicit_status),
            ("guia existente", guide_status),
        ]
        non_empty = [(source, value) for source, value in available if value]
        if not non_empty:
            raise RuntimeError(
                f"{bk_id} sem real_dev_status explícito; é proibido inferi-lo de estado={g('estado', 'TODO')}"
            )
        for source, value in non_empty:
            validate_real_dev_status(value, f"{source}:{bk_id}")
        distinct = {value for _, value in non_empty}
        if len(distinct) > 1:
            detail = ", ".join(f"{source}={value}" for source, value in non_empty)
            raise RuntimeError(f"real_dev_status divergente para {bk_id}: {detail}")
        real_dev_status = reference_status or explicit_status or guide_status

        rows.append(
            {
                "bk_id": bk_id,
                "macro": macro,
                "titulo": g("titulo"),
                "owner": g("owner"),
                "apoio": g("apoio"),
                "prioridade": g("prioridade"),
                "estado": g("estado", "TODO"),
                "real_dev_status": real_dev_status,
                "esforco": g("esforco", "S"),
                "dependencias": g("dependencias", "-"),
                "rf_rnf": g("rf_rnf"),
                "fase_documental": g("fase_documental", "Fase 1"),
                "sprint": g("sprint", sprint_window(macro)),
                "proximo_bk": proximo,
            }
        )

    def sort_key(r: dict[str, str]) -> tuple[int, int]:
        m = re.match(r"BK-MF(\d+)-(\d+)", r["bk_id"])
        if not m:
            return (99, 99)
        return (int(m.group(1)), int(m.group(2)))

    rows.sort(key=sort_key)
    return rows


def parse_items(raw: str) -> list[str]:
    raw = raw.strip()
    if raw in {"", "-", "transversal"}:
        return []
    return [x.strip() for x in raw.split(",") if x.strip()]


def fmt_md_table(headers: list[str], rows: list[list[str]]) -> str:
    out = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        out.append("| " + " | ".join(row) + " |")
    return "\n".join(out)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "sem-titulo"


def core_or_reforco(prioridade: str) -> str:
    return "Reforco" if prioridade == "P0" else "Core"


def sprint_window(macro: str) -> str:
    return SPRINT_WINDOW_BY_MACRO.get(macro, "S12")


def assigned_sprint(row: dict[str, str]) -> str:
    return row.get("sprint", "").strip() or sprint_window(row["macro"])


def guide_filename(row: dict[str, str]) -> str:
    return f"{row['bk_id']}-{slugify(row['titulo'])}.md"


def guide_rel(row: dict[str, str]) -> str:
    return f"../guias-bk/{row['macro']}/{guide_filename(row)}"


def guide_path(row: dict[str, str]) -> str:
    return f"docs/planificacao/guias-bk/{row['macro']}/{guide_filename(row)}"


def effort_units(esforco: str) -> int:
    return {"S": 1, "M": 2, "L": 3}.get(esforco.strip(), 1)


def parse_sprint_window_tokens(window: str) -> list[str]:
    raw = window.strip()
    if not raw:
        return []
    m = re.fullmatch(r"(S\d{2})-(S\d{2})", raw)
    if m:
        start = int(m.group(1)[1:])
        end = int(m.group(2)[1:])
        if start > end:
            return []
        return [f"S{i:02d}" for i in range(start, end + 1)]
    if re.fullmatch(r"S\d{2}(,S\d{2})*", raw):
        return [p.strip() for p in raw.split(",") if p.strip()]
    return []


def format_number(value: float) -> str:
    rounded = round(value, 2)
    if abs(rounded - int(rounded)) < 1e-9:
        return str(int(rounded))
    text = f"{rounded:.2f}"
    return text.rstrip("0").rstrip(".")


def compute_sprint_loads(rows: list[dict[str, str]]) -> dict[str, float]:
    loads: dict[str, float] = {sprint: 0.0 for sprint, *_ in SPRINTS}
    for row in rows:
        tokens = parse_sprint_window_tokens(assigned_sprint(row))
        if not tokens:
            continue
        share = effort_units(row["esforco"]) / len(tokens)
        for token in tokens:
            if token in loads:
                loads[token] += share
    return loads


def first_req(reqs: str) -> str:
    items = parse_items(reqs)
    return items[0] if items else "RF00"


def classify_domain(row: dict[str, str]) -> str:
    titulo = row["titulo"].lower()
    req = first_req(row["rf_rnf"])

    if req in {"RNF38"} or any(k in titulo for k in ["chrome", "firefox", "safari", "edge", "compat"]):
        return "compatibility_browser"
    if req in {"RNF39", "RNF43", "RNF44"} or any(k in titulo for k in ["pt-pt", "portugu", "datas", "i18n", "utf-8"]):
        return "localization"
    if req in {"RNF14", "RNF15", "RNF16", "RNF17", "RNF18", "RNF19", "RNF20"} or any(
        k in titulo for k in ["https", "tls", "hashing", "password", "xss", "csrf", "injection", "brute", "sandbox seguro", "cookies"]
    ):
        return "security_hardening"
    if req in {"RNF21", "RNF22", "RNF23", "RNF24", "RNF29", "RNF30"} or any(
        k in titulo for k in ["backup", "recovery", "downtime", "health-check", "deploy", "rollback", "logs"]
    ):
        return "reliability_ops"
    if req in {"RNF25", "RNF26", "RNF27", "RNF28", "RNF41", "RNF42", "RNF45"} or any(
        k in titulo
        for k in [
            "backend modular",
            "frontend componentizado",
            "documentação técnica",
            "testes automatizados",
            "testes atuais",
            "testes finais",
            "execução final de testes",
            "correção de erros",
            "revalidação final",
        ]
    ):
        return "quality_architecture"
    if req in {"RNF08", "RNF09", "RNF10", "RNF11", "RNF12", "RNF13"} or any(
        k in titulo for k in ["2s", "4s", "simultaneos", "assíncrona", "background", "escalar", "performance"]
    ):
        return "performance_scalability"
    if req in {"RF52", "RF53", "RF54"} or any(k in titulo for k in ["consentimentos", "exportar dados", "eliminar conta", "dados pessoais", "rgpd"]):
        return "privacy_rgpd"
    if req in {"RF55", "RF56", "RF57", "RF58"} or any(
        k in titulo for k in ["utilizadores e papéis", "auditoria completa", "modelos de ia", "quotas de ia", "administrador"]
    ):
        return "admin_governance"
    if req in {"RF47", "RF48", "RF49", "RF50", "RF51"} or any(k in titulo for k in ["notific", "alerta", "avisos", "publicacoes"]):
        return "notifications"
    if req in {"RF41", "RF42", "RF43", "RF44"} or any(k in titulo for k in ["grupo", "chat", "coletiv", "sessões de estudo"]):
        return "collaboration"
    if req in {"RF19", "RF20", "RF21", "RF22", "RF23", "RF24", "RF25"} or any(k in titulo for k in ["turmas", "disciplin", "docente", "professor"]):
        return "classroom_teacher"
    if req in {"RF26", "RF27", "RF28", "RF29", "RF30"} or any(k in titulo for k in ["projetos", "testes", "mini-testes", "aprovar conteúdo", "métricas da turma"]):
        return "projects_assessment"
    if req in {"RF31", "RF32", "RF33", "RF34"} or any(k in titulo for k in ["indexação", "extrair tópicos", "versões dos materiais", "separar materiais", "pdf", "docx", "urls"]):
        return "materials_ingestion"
    if req in {"RF35", "RF36", "RF37", "RF38", "RF39", "RF40"} or any(
        k in titulo for k in ["assistente ia", "guardrails", "citações obrigatórias", "não pode inventar", "conhecimento externo", "adapta explicações"]
    ):
        return "ai_orchestration"
    if req in {"RNF01", "RNF02", "RNF03", "RNF04", "RNF05", "RNF06", "RNF07", "RNF38"} or any(
        k in titulo
        for k in [
            "interface intuitiva",
            "layout responsivo",
            "acessibilidade",
            "feedback imediato",
            "validação de formulários",
            "navegação consistente",
            "mockup",
            "ui do mockup",
        ]
    ):
        return "ux_accessibility"
    if req in {"RF61", "RNF41"} or any(k in titulo for k in ["drive", "onedrive", "ics", "lms", "integração"]):
        return "integrations"
    return "learning_foundation"


def classify_core_dual(row: dict[str, str]) -> tuple[str, str, str, str, str]:
    domain = classify_domain(row)
    mapping = {
        "ai_orchestration": (
            "CORE-IA",
            "AprendizagemInteligente",
            "taxa_resposta_util",
            "tempo_resposta_p95",
            "impacto direto no tutor de IA e personalizacao academica",
        ),
        "materials_ingestion": (
            "CORE-IA",
            "AprendizagemInteligente",
            "taxa_resposta_util",
            "tempo_resposta_p95",
            "materiais indexados alimentam diretamente a qualidade das respostas",
        ),
        "classroom_teacher": (
            "CORE-COM",
            "OperacaoPedagogica",
            "adesao_turma_semana",
            "taxa_tarefas_concluidas",
            "impacto direto na operacao de turma e disciplina",
        ),
        "projects_assessment": (
            "CORE-COM",
            "OperacaoPedagogica",
            "adesao_turma_semana",
            "taxa_tarefas_concluidas",
            "projetos e avaliacao sao entrega pedagogica central da app",
        ),
        "learning_foundation": (
            "CORE-HIBRIDO",
            "AprendizagemComEngajamento",
            "tempo_estudo_semana",
            "taxa_retencao_30d",
            "fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente",
        ),
        "collaboration": (
            "CORE-HIBRIDO",
            "AprendizagemComEngajamento",
            "tempo_estudo_semana",
            "taxa_retencao_30d",
            "colaboracao aumenta engagement e reforca aprendizagem assistida",
        ),
        "notifications": (
            "CORE-HIBRIDO",
            "AprendizagemComEngajamento",
            "tempo_estudo_semana",
            "taxa_retencao_30d",
            "notificacoes influenciam disciplina de estudo e continuidade",
        ),
        "privacy_rgpd": (
            "CORE-HIBRIDO",
            "ConfiancaProduto",
            "taxa_consentimento_ativo",
            "taxa_retencao_30d",
            "privacidade reforca confianca e continuidade de uso",
        ),
        "admin_governance": (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            "governanca operacional sem entrega core direta ao utilizador final",
        ),
        "ux_accessibility": (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            "qualidade de interface e acessibilidade como habilitador transversal",
        ),
        "performance_scalability": (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            "performance/escalabilidade suportam continuidade, sem feature core isolada",
        ),
        "security_hardening": (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            "seguranca e protecao de dados como camada estrutural de suporte",
        ),
        "reliability_ops": (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            "operacao e continuidade sem output core funcional direto",
        ),
        "quality_architecture": (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            "modularidade e testes sustentam o produto transversalmente",
        ),
        "compatibility_browser": (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            "compatibilidade multi-browser e requisito transversal de sustentacao",
        ),
        "localization": (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            "localizacao e i18n como habilitador operacional da experiencia",
        ),
        "integrations": (
            "CORE-HIBRIDO",
            "AprendizagemComEngajamento",
            "tempo_estudo_semana",
            "taxa_retencao_30d",
            "integracoes ampliam utilidade real da app no fluxo de estudo",
        ),
    }
    base = mapping.get(
        domain,
        (
            "CORE-HIBRIDO",
            "AprendizagemComEngajamento",
            "tempo_estudo_semana",
            "taxa_retencao_30d",
            "impacto transversal no valor central da app",
        ),
    )
    override = row.get("classe_core_dual", "").strip()
    if not override or override == base[0]:
        return base
    if override == "CORE-IA":
        return (
            "CORE-IA",
            "AprendizagemInteligente",
            "taxa_resposta_util",
            "tempo_resposta_p95",
            f"reclassificacao deterministica para core dual no dominio {domain}",
        )
    if override == "CORE-COM":
        return (
            "CORE-COM",
            "OperacaoPedagogica",
            "adesao_turma_semana",
            "taxa_tarefas_concluidas",
            f"reclassificacao deterministica para core dual no dominio {domain}",
        )
    if override == "SUPORTE":
        return (
            "SUPORTE",
            "FundacaoQualidade",
            "taxa_incidentes_criticos",
            "taxa_conformidade_gates",
            f"reclassificacao deterministica para suporte no dominio {domain}",
        )
    return (
        "CORE-HIBRIDO",
        "AprendizagemComEngajamento",
        "tempo_estudo_semana",
        "taxa_retencao_30d",
        f"reclassificacao deterministica para core dual no dominio {domain}",
    )


def compute_core_dual_percent_by_sprint(rows: list[dict[str, str]]) -> dict[str, float]:
    total: dict[str, float] = {sprint: 0.0 for sprint, *_ in SPRINTS}
    core: dict[str, float] = {sprint: 0.0 for sprint, *_ in SPRINTS}
    for row in rows:
        tokens = parse_sprint_window_tokens(assigned_sprint(row))
        if not tokens:
            continue
        weight = effort_units(row["esforco"]) / len(tokens)
        classe, *_ = classify_core_dual(row)
        for token in tokens:
            if token not in total:
                continue
            total[token] += weight
            if classe != "SUPORTE":
                core[token] += weight

    out: dict[str, float] = {}
    for sprint in total:
        if total[sprint] <= 0:
            out[sprint] = 100.0
        else:
            out[sprint] = round((core[sprint] / total[sprint]) * 100, 1)
    return out


def load_constraints_contract(plan_root: Path) -> dict:
    path = plan_root / "scripts" / "plan_constraints_studyflow.json"
    if not path.exists():
        raise FileNotFoundError(f"Contrato de constraints nao encontrado: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def run_solver_and_load(plan_root: Path) -> dict:
    solver_script = plan_root / "scripts" / "solver_replaneamento.py"
    solver_out = plan_root / "scripts" / "solver_reassignments.json"
    if not solver_script.exists():
        raise FileNotFoundError(f"Solver de replaneamento nao encontrado: {solver_script}")
    subprocess.run(
        [sys.executable, str(solver_script), "--out", str(solver_out)],
        check=True,
        cwd=solver_script.parent,
        capture_output=True,
        text=True,
    )
    return json.loads(solver_out.read_text(encoding="utf-8"))


def apply_solver_assignments(rows: list[dict[str, str]], solver_payload: dict) -> list[dict[str, str]]:
    assignments = solver_payload.get("assignments", [])
    by_bk = {a.get("bk_id", ""): a for a in assignments if a.get("bk_id")}
    out: list[dict[str, str]] = []
    missing: list[str] = []
    for row in rows:
        bk_id = row["bk_id"]
        data = by_bk.get(bk_id)
        if not data:
            missing.append(bk_id)
            continue
        row = dict(row)
        solver_status = data.get("real_dev_status")
        if solver_status != row["real_dev_status"]:
            raise RuntimeError(
                f"Solver tentou alterar/omitir real_dev_status de {bk_id}: "
                f"{row['real_dev_status']} -> {solver_status}"
            )
        row["owner"] = data.get("owner", row["owner"])
        row["sprint"] = data.get("sprint", row["sprint"])
        row["classe_core_dual"] = data.get("classe_core_dual", "")
        out.append(row)
    if missing:
        raise RuntimeError(f"Solver sem assignments para BK: {', '.join(missing[:10])}")
    return out


def macro_window_from_rows(rows: list[dict[str, str]], macro: str) -> str:
    idxs: list[int] = []
    for row in rows:
        if row["macro"] != macro:
            continue
        for token in parse_sprint_window_tokens(assigned_sprint(row)):
            if re.fullmatch(r"S\d{2}", token):
                idxs.append(int(token[1:]))
    if not idxs:
        return sprint_window(macro)
    lo = min(idxs)
    hi = max(idxs)
    if lo == hi:
        return f"S{lo:02d}"
    return f"S{lo:02d}-S{hi:02d}"


def domain_objective(domain: str) -> str:
    return {
        "learning_foundation": "Construir o fluxo base de aluno (identidade, perfil e estudo individual) com comportamento previsivel.",
        "ai_orchestration": "Garantir respostas de IA fundamentadas, com guardrails e adaptacao ao contexto academico correto.",
        "materials_ingestion": "Assegurar ingestao/indexacao de materiais com rastreabilidade e isolamento por contexto.",
        "classroom_teacher": "Implementar operacao professor/turma/disciplina com controlo de acesso e curadoria oficial.",
        "projects_assessment": "Implementar ciclo de projetos e testes com criterios de avaliacao reproduziveis.",
        "collaboration": "Assegurar colaboracao em grupo com isolamento de membros e historico verificavel.",
        "notifications": "Orquestrar notificacoes por contexto com quotas, preferencias e prioridade controladas.",
        "privacy_rgpd": "Cumprir direitos RGPD (exportacao, eliminacao, consentimento) com trilho auditavel.",
        "admin_governance": "Operacionalizar governanca administrativa de papeis, auditoria e limites de uso.",
        "ux_accessibility": "Elevar qualidade de experiencia (usabilidade/acessibilidade) com criterios verificaveis.",
        "performance_scalability": "Cumprir metas de latencia e escalabilidade com instrumentacao objetiva.",
        "security_hardening": "Endurecer superficie de seguranca com protecoes ativas e validacao negativa.",
        "reliability_ops": "Garantir continuidade operacional (logs, backups, recovery, deploy seguro).",
        "quality_architecture": "Consolidar arquitetura e qualidade tecnica com testes e modularidade.",
        "compatibility_browser": "Validar compatibilidade real entre navegadores suportados no MVP.",
        "localization": "Garantir localizacao PT-PT e preparo i18n sem regressao funcional.",
        "integrations": "Integrar fontes externas em modo controlado, idempotente e observavel.",
    }.get(domain, "Executar o BK com criterios tecnicos claros e evidencia verificavel.")


def domain_errors(domain: str) -> list[str]:
    return {
        "learning_foundation": ["Nao validar duplicados de conta/perfil.", "Misturar regras de aluno sem turma com turma inscrita."],
        "ai_orchestration": ["Responder sem citar fonte do material.", "Aplicar perfil de IA errado ao contexto atual."],
        "materials_ingestion": ["Aceitar ficheiros sem validar tipo/tamanho.", "Indexar sem separar contexto aluno/professor/turma."],
        "classroom_teacher": ["Permitir acesso a disciplina sem inscricao.", "Publicar material oficial sem revisão de permissões."],
        "projects_assessment": ["Gerar testes sem chave de correção consistente.", "Registar progresso sem granularidade por tópico."],
        "collaboration": ["Expor dados de sala a não-membros.", "Não persistir histórico de sessão/co-estudo."],
        "notifications": ["Ignorar preferências de canal do utilizador.", "Disparar notificações acima da quota definida."],
        "privacy_rgpd": ["Não registar prova de consentimento.", "Eliminar dados sem política de retenção definida."],
        "admin_governance": ["Alterar papeis sem trilho de auditoria.", "Aplicar quotas globais sem segmentar por contexto."],
        "ux_accessibility": ["Validar formulário apenas no backend.", "Quebrar contraste/foco teclado em componentes principais."],
        "performance_scalability": ["Medir latencia sem cenário reproduzível.", "Bloquear UI em tarefas assíncronas pesadas."],
        "security_hardening": ["Depender de segurança apenas no frontend.", "Não testar vetores negativos (XSS/CSRF/brute-force)."],
        "reliability_ops": ["Sem plano de recuperação após falha.", "Deploy sem rollback testado."],
        "quality_architecture": ["Testes sem cobrir módulos críticos.", "Acoplar domínios sem fronteiras claras."],
        "compatibility_browser": ["Validar só no browser do programador.", "Não congelar baseline de versões suportadas."],
        "localization": ["Misturar formatos de data em ecrãs distintos.", "Quebrar acentuação PT-PT em import/export."],
        "integrations": ["Importar duplicados por falta de idempotência.", "Não registar origem do material importado."],
    }.get(domain, ["Ignorar requisitos negativos obrigatórios.", "Fechar BK sem evidência executável."])


def domain_actions(domain: str) -> tuple[str, str, str]:
    mapping = {
        "learning_foundation": ("fluxo de conta/perfil em estado consistente", "regras de sessão/papel e transições de estado", "mapa de estados (novo, ativo, bloqueado)"),
        "ai_orchestration": ("pipeline IA com contexto e fontes citadas", "guardrails por perfil (aluno, turma, professor)", "amostras de prompts/respostas com fontes"),
        "materials_ingestion": ("ingestão e indexação assíncrona por tipo de material", "validação de MIME/tamanho e isolamento por contexto", "logs de parsing + índices criados"),
        "classroom_teacher": ("fluxo turma/disciplina/material oficial", "autorização por inscrição e papel docente", "evidência de acesso autorizado/negado"),
        "projects_assessment": ("criação de projeto/teste e avaliação", "rubrica de correção e persistência de desempenho", "resultados por tópico e turma"),
        "collaboration": ("sala/grupo com partilha e histórico", "controlo de membros e permissões de escrita", "histórico de sessão e autoria"),
        "notifications": ("despacho de notificação por contexto/canal", "respeito por preferências e quotas", "eventos de envio, supressão e fallback"),
        "privacy_rgpd": ("exportação/eliminação/consentimento com estado auditável", "política de retenção e trilho de prova", "registo de pedido + execução"),
        "admin_governance": ("painel admin para papéis, auditoria e quotas", "limites por aluno/turma/grupo/modelo", "alterações administrativas rastreadas"),
        "ux_accessibility": ("comportamentos UX críticos (form, feedback, navegação)", "acessibilidade básica (labels, foco, contraste)", "capturas/relatório de usabilidade"),
        "performance_scalability": ("cenário de carga e medição de latência", "timeouts, filas e controlo de concorrência", "métricas comparáveis pré/pós"),
        "security_hardening": ("proteções de canal/sessão/entrada", "mitigações XSS/CSRF/injection/brute-force", "evidência de bloqueio em testes negativos"),
        "reliability_ops": ("health, backup/recovery e operação segura", "circuit-breaker/retry/rollback", "runbook de falha + recuperação"),
        "quality_architecture": ("fronteiras de domínio + testes críticos", "contratos entre módulos e cobertura mínima", "suite automatizada em CI local"),
        "compatibility_browser": ("matriz de browsers suportados com testes E2E", "normalização de APIs e fallbacks", "relatório por navegador/versão"),
        "localization": ("locale PT-PT em UI e export/import", "normalização de datas/números e encoding", "evidência de UI + ficheiros gerados"),
        "integrations": ("importação unidirecional via conector externo", "idempotência e mapeamento de origem", "histórico de sincronização"),
    }
    return mapping.get(domain, ("fluxo principal do requisito", "regras de controlo associadas", "evidência técnica verificável"))


def domain_validation_points(domain: str) -> list[str]:
    points = {
        "ai_orchestration": ["Resposta referencia fontes reais (doc/página/secção).", "Perfil de IA aplicado corresponde ao contexto do pedido."],
        "materials_ingestion": ["Documento indexado gera entradas pesquisáveis.", "Falha de parsing não bloqueia interface do utilizador."],
        "notifications": ["Preferência de canal é respeitada por utilizador.", "Quota máxima impede spam em eventos repetidos."],
        "privacy_rgpd": ["Pedido RGPD deixa trilho auditável com timestamp.", "Exportação/eliminação trata dados relacionais sem fuga."],
        "performance_scalability": ["Métrica alvo do BK é medida e comparável.", "Caminho crítico mantém-se dentro do orçamento definido."],
        "security_hardening": ["Endpoint crítico recusa tráfego inseguro.", "Vetores negativos conhecidos geram erro controlado."],
        "compatibility_browser": ["Fluxos críticos passam em Chrome/Edge/Firefox/Safari.", "Sem regressão visual/funcional em browser alternativo."],
        "localization": ["Interface e datas seguem PT-PT sem exceções no fluxo.", "Importação/exportação preserva UTF-8 e acentuação."],
    }
    return points.get(domain, ["Fluxo do requisito cumpre contrato de entrada/saída.", "Persistência e leitura dos dados mantêm consistência."])


def domain_negative_examples(domain: str) -> list[str]:
    examples = {
        "ai_orchestration": ["pedido sem contexto documental", "pedido que tenta contornar guardrails", "pedido com perfil errado de utilizador"],
        "materials_ingestion": ["ficheiro com formato não suportado", "upload acima do limite", "URL inacessível ou inválida"],
        "security_hardening": ["pedido HTTP sem TLS", "payload com tentativa de injection", "token/cookie inválido"],
        "privacy_rgpd": ["exportação sem autenticação forte", "eliminação sem confirmação de titular", "consentimento retirado em uso ativo"],
        "compatibility_browser": ["funcionalidade em browser sem API nativa", "render com layout quebrado", "evento de teclado sem fallback"],
    }
    return examples.get(domain, ["entrada obrigatória em falta", "estado inválido de negócio", "permissão insuficiente"])


def choose_snippet(row: dict[str, str], domain: str) -> tuple[str, str, str, str]:
    bk_id = row["bk_id"]
    req = first_req(row["rf_rnf"])

    snippets: dict[str, tuple[str, str, str, str]] = {
        "learning_foundation": (
            "Handler de registo e sessão",
            "ts",
            f"""type Credenciais = {{ email: string; password: string }};

export async function registarAluno(input: Credenciais) {{
  if (!input.email.includes('@')) throw new Error('Email invalido');
  if (input.password.length < 12) throw new Error('Password fraca');
  return {{ bkId: '{bk_id}', req: '{req}', estado: 'REGISTADO' }};
}}
""",
            "Garante validação mínima de identidade no arranque do fluxo de conta.",
        ),
        "ai_orchestration": (
            "Resposta IA com guardrails e fontes",
            "ts",
            f"""type Fonte = {{ doc: string; secao: string }};

export function responderIA(perfil: 'ALUNO' | 'TURMA' | 'PROFESSOR', pergunta: string, fontes: Fonte[]) {{
  if (!pergunta.trim()) throw new Error('Pergunta vazia');
  if (!fontes.length) throw new Error('Resposta sem fonte permitida');
  return {{ bkId: '{bk_id}', req: '{req}', perfil, resposta: 'Gerada com base documental', fontes }};
}}
""",
            "Força citação de fonte e aplica perfil de guardrail por contexto.",
        ),
        "materials_ingestion": (
            "Pipeline de ingestão assíncrona",
            "ts",
            f"""type Material = {{ id: string; tipo: 'PDF' | 'DOCX' | 'URL'; bytes: number }};

export function enfileirarIndexacao(material: Material) {{
  if (material.bytes <= 0 || material.bytes > 25 * 1024 * 1024) throw new Error('Tamanho invalido');
  return {{ bkId: '{bk_id}', req: '{req}', job: `IDX-${{material.id}}`, estado: 'PENDING' }};
}}
""",
            "Separa validação e indexação para não bloquear o utilizador.",
        ),
        "classroom_teacher": (
            "Autorização por turma e disciplina",
            "ts",
            f"""type Contexto = {{ turmaId: string; disciplinaId: string; papel: 'ALUNO' | 'PROFESSOR' }};

export function autorizarContexto(c: Contexto) {{
  if (!c.turmaId || !c.disciplinaId) throw new Error('Contexto incompleto');
  if (c.papel !== 'PROFESSOR') throw new Error('Apenas docente pode executar esta ação');
  return {{ bkId: '{bk_id}', req: '{req}', autorizado: true }};
}}
""",
            "Evita operações docentes fora do contexto da turma/disciplina.",
        ),
        "projects_assessment": (
            "Correção de mini-teste com rubrica",
            "ts",
            f"""type Resposta = {{ topico: string; correta: boolean }};

export function calcularDesempenho(respostas: Resposta[]) {{
  if (!respostas.length) throw new Error('Sem respostas para avaliar');
  const corretas = respostas.filter((r) => r.correta).length;
  return {{ bkId: '{bk_id}', req: '{req}', score: Math.round((corretas / respostas.length) * 100) }};
}}
""",
            "Produz saída objetiva por tópico para acompanhamento docente.",
        ),
        "collaboration": (
            "Controlo de acesso de sala/grupo",
            "ts",
            f"""type Membro = {{ userId: string; salaId: string; ativo: boolean }};

export function validarMembro(m: Membro) {{
  if (!m.ativo) throw new Error('Membro sem acesso');
  return {{ bkId: '{bk_id}', req: '{req}', permissao: 'OK', salaId: m.salaId }};
}}
""",
            "Garante que partilha/chat só ocorre para membros ativos.",
        ),
        "notifications": (
            "Despacho de notificações com quota",
            "ts",
            f"""type Preferencia = {{ canal: 'app' | 'email' | 'push'; ativo: boolean }};

export function podeNotificar(pref: Preferencia, enviadosHoje: number, quota: number) {{
  if (!pref.ativo) return {{ bkId: '{bk_id}', req: '{req}', enviar: false, motivo: 'opt-out' }};
  return {{ bkId: '{bk_id}', req: '{req}', enviar: enviadosHoje < quota }};
}}
""",
            "Impõe preferências e quota máxima antes do envio.",
        ),
        "privacy_rgpd": (
            "Registo de consentimento versionado",
            "ts",
            f"""type Consentimento = {{ userId: string; finalidade: string; aceite: boolean; versao: string }};

export function registarConsentimento(c: Consentimento) {{
  if (!c.versao) throw new Error('Versao obrigatoria');
  return {{ bkId: '{bk_id}', req: '{req}', evento: 'CONSENTIMENTO_REGISTADO', consentimento: c }};
}}
""",
            "Cria trilho auditável obrigatório para RGPD.",
        ),
        "admin_governance": (
            "Política de quotas por contexto",
            "ts",
            f"""type Quota = {{ contexto: 'ALUNO' | 'TURMA' | 'GRUPO'; limiteMensal: number }};

export function validarQuota(q: Quota, consumoAtual: number) {{
  if (q.limiteMensal <= 0) throw new Error('Limite invalido');
  return {{ bkId: '{bk_id}', req: '{req}', excedido: consumoAtual >= q.limiteMensal }};
}}
""",
            "Permite governança operacional de consumo de IA.",
        ),
        "ux_accessibility": (
            "Validação de formulário com feedback acessível",
            "ts",
            f"""type FormState = {{ email: string; nome: string }};

export function validarFormulario(state: FormState) {{
  const erros: string[] = [];
  if (!state.nome.trim()) erros.push('Nome obrigatório');
  if (!state.email.includes('@')) erros.push('Email inválido');
  return {{ bkId: '{bk_id}', req: '{req}', valido: erros.length === 0, erros }};
}}
""",
            "Cria feedback imediato e determinístico no fluxo de UI.",
        ),
        "performance_scalability": (
            "Consulta de latência por janela",
            "ts",
            f"""// BK: {bk_id} / {req}
const porJanela = await metricasLatencyModel.aggregate([
  {{ $match: {{ contexto }} }},
  {{
    $group: {{
      _id: {{ $dateTrunc: {{ date: '$createdAt', unit: 'minute' }} }},
      latMedia: {{ $avg: '$latenciaMs' }},
      latenciasMs: {{ $push: '$latenciaMs' }},
    }},
  }},
  {{ $sort: {{ _id: -1 }} }},
  {{ $limit: 60 }},
]);

const resultado = porJanela.map((janela) => ({{
  janela: janela._id,
  latMedia: janela.latMedia,
  p95: calcularPercentil(janela.latenciasMs, 95),
}});
""",
            "Base para validar SLA do caminho crítico com p95 mensurável.",
        ),
        "security_hardening": (
            "Middlewares de segurança obrigatórios",
            "ts",
            f"""export function exigirHTTPS(proto: string) {{
  if (proto !== 'https') throw new Error('Canal inseguro');
}}

export function validarRateLimit(tentativasMinuto: number, limite: number) {{
  if (tentativasMinuto > limite) throw new Error('Rate limit excedido');
  return {{ bkId: '{bk_id}', req: '{req}', ok: true }};
}}
""",
            "Aplica proteção ativa no perímetro do endpoint crítico.",
        ),
        "reliability_ops": (
            "Health-check e retry controlado",
            "ts",
            f"""export function healthCheck(dbOk: boolean, filaOk: boolean) {{
  const status = dbOk && filaOk ? 'UP' : 'DEGRADED';
  return {{ bkId: '{bk_id}', req: '{req}', status }};
}}
""",
            "Suporta operação e diagnóstico rápido em incidente.",
        ),
        "quality_architecture": (
            "Teste automatizado de módulo crítico",
            "ts",
            f"""import {{ describe, it, expect }} from 'vitest';

describe('{bk_id}', () => {{
  it('cumpre contrato principal', () => {{
    const output = {{ ok: true, bkId: '{bk_id}', req: '{req}' }};
    expect(output.ok).toBe(true);
  }});
}});
""",
            "Fixa comportamento esperado e previne regressões no módulo.",
        ),
        "compatibility_browser": (
            "Teste E2E cross-browser",
            "ts",
            f"""import {{ test, expect }} from '@playwright/test';

test('{bk_id} fluxo crítico', async ({{ page }}) => {{
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
}});
""",
            "Permite executar a mesma verificação em Chromium, Firefox e WebKit.",
        ),
        "localization": (
            "Normalização de locale PT-PT",
            "ts",
            f"""export function formatarDataPT(dataIso: string) {{
  const d = new Date(dataIso);
  return d.toLocaleDateString('pt-PT');
}}
""",
            "Garante coerência de apresentação de datas em PT-PT.",
        ),
        "integrations": (
            "Importação unidirecional com idempotência",
            "ts",
            f"""type FicheiroExterno = {{ sourceId: string; hash: string }};

export function deduplicarImportacao(existente: Set<string>, f: FicheiroExterno) {{
  const chave = `${{f.sourceId}}:${{f.hash}}`;
  return {{ bkId: '{bk_id}', req: '{req}', importar: !existente.has(chave), chave }};
}}
""",
            "Evita duplicados na sincronização de materiais externos.",
        ),
    }
    return snippets.get(
        domain,
        (
            "Validação de contrato de entrada",
            "ts",
            f"""export function validarContrato(payload: Record<string, unknown>) {{
  if (!payload) throw new Error('Payload vazio');
  return {{ bkId: '{bk_id}', req: '{req}', ok: true }};
}}
""",
            "Barreira mínima para estabilizar integrações do BK.",
        ),
    )


def render_guide(row: dict[str, str]) -> str:
    bk_id = row["bk_id"]
    macro = row["macro"]
    prioridade = row["prioridade"]
    deps = parse_items(row["dependencias"])
    deps_fmt = ", ".join(deps) if deps else "-"
    req = first_req(row["rf_rnf"])
    min_neg = NEG_MIN_BY_PRIORITY.get(prioridade, 1)
    domain = classify_domain(row)
    objetivo = domain_objective(domain)
    erros = domain_errors(domain)
    acao_principal, acao_controle, acao_evidencia = domain_actions(domain)
    validacoes = domain_validation_points(domain)
    negativos_exemplos = domain_negative_examples(domain)

    steps = [
        f"Confirmar no backlog e na matriz o escopo de `{bk_id}` e do requisito `{req}`.",
        f"Validar pre-condicoes técnicas e dependencias declaradas: `{deps_fmt}`.",
        f"Modelar contratos de dados e estados para `{acao_principal}`.",
        f"Implementar o caminho principal de `{acao_principal}`.",
        f"Aplicar controlos para `{acao_controle}`.",
        f"Preparar evidencia operacional: `{acao_evidencia}`.",
        "Executar smoke test completo do fluxo principal e registar o resultado.",
        f"Executar cenarios negativos obrigatorios (minimo {min_neg}) e validar erro controlado.",
    ]
    if prioridade == "P0":
        steps.extend(
            [
                "Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).",
                "Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.",
            ]
        )

    steps_md = "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps))
    validacao_md = "\n".join(f"- {v}" for v in validacoes)
    negativos_md = "\n".join(f"- {e}" for e in negativos_exemplos[:min_neg])
    erros_md = "\n".join(f"- {e}" for e in erros)
    snippet_name, snippet_lang, snippet_code, snippet_desc = choose_snippet(row, domain)

    return f"""# {bk_id} - {row['titulo']}

## Header
- `doc_id`: `GUIA-{bk_id}`
- `bk_id`: `{bk_id}`
- `macro`: `{macro}`
- `owner`: `{row['owner']}`
- `apoio`: `{row['apoio']}`
- `prioridade`: `{prioridade}`
- `estado`: `{row['estado']}`
- `real_dev_status`: `{row['real_dev_status']}`
- `esforco`: `{row['esforco']}`
- `dependencias`: `{deps_fmt}`
- `rf_rnf`: `{row['rf_rnf']}`
- `fase_documental`: `{row['fase_documental']}`
- `sprint`: `{assigned_sprint(row)}`
- `core_or_reforco`: `{core_or_reforco(prioridade)}`
- `proximo_bk`: `{row['proximo_bk']}`
- `guia_path`: `{guide_path(row)}`
- `last_updated`: `{TODAY}`

## Contexto do BK
- Entrega alvo: `{row['titulo']}` com rastreabilidade direta para `{row['rf_rnf']}`.
- Foco da macro `{macro}`: {MACRO_LABEL.get(macro, 'execucao funcional orientada a defesa PAP')}.
- Dominio semântico aplicado: `{domain}`.

## Bloco pedagogico
### Objetivo
{objetivo}

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `{deps_fmt}`.

### Erros comuns
{erros_md}
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `{req}` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `{'+20-40 min' if prioridade == 'P0' else 'n/a'}`

## Bloco operacional
### Entrada
- BK: `{bk_id}`
- Requisito: `{row['rf_rnf']}`
- Dependencias: `{deps_fmt}`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
{steps_md}

### Cenarios negativos recomendados
{negativos_md}

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `{min_neg}` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
{chr(10).join(f"- [ ] {v}" for v in validacoes)}

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `{row['proximo_bk']}`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**{snippet_name}**
- BK vinculado: `{bk_id}`.

```{snippet_lang}
{snippet_code.rstrip()}
```

{snippet_desc}
- Requisitos alvo deste BK: `{row['rf_rnf']}`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `{min_neg}` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`{prioridade}`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`{row['proximo_bk']}`

## Changelog
- `{TODAY}`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
"""


# ----------------------------
# write plan docs
# ----------------------------


def write_readme(plan_root: Path) -> None:
    rf_count = len(set(re.findall(r"\bRF\d{2}\b", (plan_root.parent / "RF.md").read_text(encoding="utf-8"))))
    rnf_count = len(set(re.findall(r"\bRNF\d{2}\b", (plan_root.parent / "RNF.md").read_text(encoding="utf-8"))))

    content = f"""# PLANIFICACAO-STUDYFLOW

## Header
- `doc_id`: `PLANIFICACAO-STUDYFLOW`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Normalizar a planificacao da StudyFlow ao padrao OPSA/FaithFlix com governanca completa, cobertura rastreavel e foco pedagogico para 12o ano.

## Hierarquia canónica (ordem oficial)
1. `PLANO-IMPLEMENTACAO-TOTAL.md`
2. `DISTRIBUICAO-RESPONSABILIDADES.md`
3. `sprints/PLANO-SPRINTS.md`
4. `sprints/SCORECARD-SPRINTS.md`
5. `sprints/GUIAO-DOCENTE-SEMANAL.md`
6. `sprints/GATES-S4-S8-S12.md`
7. `sprints/OPERACAO-DEPLOY-ROLLBACK.md`
8. `CORE-DUAL-CONTRATO.md`
9. `scripts/plan_constraints_studyflow.json`
10. `scripts/solver_reassignments.json`
11. `backlogs/MATRIZ-CANONICA-BK.md`
12. `backlogs/BACKLOG-MVP.md`
13. `backlogs/MF-VIEWS.md`
14. `backlogs/CONTRATO-CAMPOS-BK.md`
15. `backlogs/ANEXO-RF-PARA-BKS.md`
16. `backlogs/ANEXO-RNF-PARA-BKS.md`
17. `backlogs/ANEXO-BK-SPRINT-OWNER.md`
18. `backlogs/ANEXO-CORE-DUAL-BK.md`
19. `guias-bk/README.md`
20. `ESTADO-REFERENCIA-REAL_DEV.md` (autoridade manual da implementação/evidence)
21. `CONFORMIDADE-PLANIFICACAO.md`

## Regra de precedencia
- Em conflito sobre implementação real, prevalece `ESTADO-REFERENCIA-REAL_DEV.md`; o normalizador falha e nunca sobrescreve a decisão/evidence manual.
- Em conflito pedagógico, prevalece a ordem da hierarquia canónica.
- `MATRIZ-CANONICA-BK.md` e a fonte de referencia para ownership/prioridade/dependencias/rf_rnf.
- `BACKLOG-MVP.md` e `guias-bk` herdam os metadados da matriz sem excecoes.

## Dois estados independentes
- `estado`: `TODO|IN_PROGRESS|DONE|BLOCKED`, apenas progresso pedagógico.
- `real_dev_status`: `VALIDADO|IMPLEMENTADO_NAO_VALIDADO|PARCIAL|MITIGADO_POR_ESCOPO|BLOQUEADO_OPERADOR|NAO_IMPLEMENTADO|NAO_APLICAVEL`, apenas referência.
- É proibido inferir um estado a partir do outro.

## Regra de atualizacao em cadeia
1. Executar solver com constraints formais (`scripts/plan_constraints_studyflow.json` -> `scripts/solver_reassignments.json`).
2. Atualizar matriz.
3. Regenerar backlog e MF views.
4. Atualizar apenas headers em falta e anexos; corpos/evidence manuais dos guias são preservados.
5. Atualizar sprints/scorecard/gates.
6. Executar `scripts/validate-planificacao.sh` e publicar relatorio de conformidade.

## Contrato de scorecard (pesos oficiais)
- Cobertura/rastreabilidade: `25`
- Coerencia documental: `20`
- Pedagogia/guidance/step-by-step: `25`
- Adequacao ao 12o: `20`
- Governanca/avaliacao: `10`

## Contagem oficial de requisitos
- Total RF: **{rf_count}**
- Total RNF: **{rnf_count}**

## Meta documental oficial
- Meta: `>=97/100`
- Estado alvo apos normalizacao: `PASS` em auditoria automatica.
- `PASS` é exclusivamente documental e não constitui release nem prontidão para produção.

## Changelog
- `{TODAY}`: estrutura/layout normalizados para alinhamento total com baseline OPSA+FaithFlix.
"""
    (plan_root / "README.md").write_text(content, encoding="utf-8")


def write_plano_implementacao(plan_root: Path, rows: list[dict[str, str]]) -> None:
    by_macro = Counter(r["macro"] for r in rows)
    lines = [
        "# PLANO-IMPLEMENTACAO-TOTAL",
        "",
        "## Header",
        "- `doc_id`: `PLANO-IMPLEMENTACAO-TOTAL`",
        "- `path`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Objetivo",
        "Definir a linha temporal canónica de 12 sprints para executar os BK da StudyFlow com rastreabilidade RF/RNF, coerencia documental e preparacao para defesa PAP.",
        "",
        "## Contrato canónico",
        "- Pesos oficiais: `25/20/25/20/10`.",
        "- Politica Core/Reforco: `P0 => Reforco`, `P1/P2 => Core`.",
        "- Gates obrigatorios de revisao: `S4`, `S8`, `S12`.",
        "- Replaneamento deterministico por constraints: `scripts/plan_constraints_studyflow.json`.",
        "- Output operacional do solver: `scripts/solver_reassignments.json`.",
        "- Invariantes: IDs BK preservados e cobertura `RF/RNF/BK` sem orfaos.",
        "- `estado` pedagógico e `real_dev_status` da referência são independentes; evidence manual nunca é regenerada.",
        "",
        "## Calendario macro",
    ]

    for macro in MACRO_ORDER:
        lines.append(f"- `{macro}` ({MACRO_LABEL[macro]}): janela `{macro_window_from_rows(rows, macro)}` com `{by_macro.get(macro, 0)}` BK.")

    lines.extend(
        [
            "",
            "## Fases",
            "1. Fase 1 (S01-S06): fundacoes + nucleo funcional aluno/professor.",
            "2. Fase 2 (S07-S10): capacidades de produto, governanca e UX.",
            "3. Fase 3 (S10-S12): qualidade, seguranca, compliance e fecho documental.",
            "",
            "## Entregaveis obrigatorios por gate",
            "- Gate S4: backlog/matriz/guias sincronizados para MF0-MF1.",
            "- Gate S8: rastreabilidade completa MF0-MF4 com evidencias de validacao.",
            "- Gate S12: pacote final de defesa com UI alinhada ao mockup, funcionalidades MF8 expandidas antes dos testes finais, testes finais executados, erros corrigidos e auditoria automatica em PASS.",
            "",
            "## Changelog",
            f"- `{TODAY}`: plano reescrito para horizonte canónico de 12 sprints com gates S4/S8/S12.",
            "",
        ]
    )

    (plan_root / "PLANO-IMPLEMENTACAO-TOTAL.md").write_text("\n".join(lines), encoding="utf-8")


def write_distribuicao(plan_root: Path, rows: list[dict[str, str]], constraints: dict) -> None:
    owner_counts = Counter(r["owner"] for r in rows)
    owner_effort = defaultdict(int)
    owner_prio = defaultdict(Counter)
    for r in rows:
        owner_effort[r["owner"]] += effort_units(r["esforco"])
        owner_prio[r["owner"]][r["prioridade"]] += 1
    owner_caps_cfg = {k: float(v) for k, v in constraints["owner_capacity_weekly"].items()}
    owner_order = constraints.get("owner_target_order", list(owner_caps_cfg.keys()))
    owner_list = [o for o in owner_order if o in owner_counts]
    owner_list.extend(sorted(set(owner_counts.keys()) - set(owner_list)))

    table = fmt_md_table(
        ["owner", "total_bk", "esforco_unidades", "P0", "P1", "P2", "capacidade_u_semana", "responsabilidade"],
        [
            [
                owner,
                str(owner_counts[owner]),
                str(owner_effort[owner]),
                str(owner_prio[owner]["P0"]),
                str(owner_prio[owner]["P1"]),
                str(owner_prio[owner]["P2"]),
                format_number(owner_caps_cfg.get(owner, 0.0)),
                "Execucao tecnica e garantia de evidencia por BK",
            ]
            for owner in owner_list
        ],
    )

    content = f"""# DISTRIBUICAO-RESPONSABILIDADES

## Header
- `doc_id`: `DISTRIBUICAO-RESPONSABILIDADES`
- `path`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Formalizar ownership canónico dos BK da StudyFlow para evitar drift entre matriz, backlog, sprints e guias.

## Regra de ownership
- Cada BK tem `owner` principal e `apoio` secundario.
- Alteracoes de owner exigem atualizacao em cadeia (matriz -> backlog -> guias -> anexos).
- Gate semanal valida distribuicao de carga e bloqueios >48h.

## Distribuicao consolidada
{table}

## Changelog
- `{TODAY}`: distribuicao normalizada com capacidade diferenciada e rastreio `P0/P1/P2` por owner.
"""
    (plan_root / "DISTRIBUICAO-RESPONSABILIDADES.md").write_text(content, encoding="utf-8")


def write_plano_sprints(plan_root: Path, rows: list[dict[str, str]], constraints: dict) -> None:
    sprint_loads = compute_sprint_loads(rows)
    owner_caps_cfg = {k: float(v) for k, v in constraints["owner_capacity_weekly"].items()}
    owner_order = constraints.get("owner_target_order", list(owner_caps_cfg.keys()))
    owner_list = [o for o in owner_order if o in owner_caps_cfg]
    owner_list.extend(sorted(set(owner_caps_cfg.keys()) - set(owner_list)))
    owner_capacity_rows = [[owner, format_number(owner_caps_cfg[owner])] for owner in owner_list]
    owner_capacity_rows.append(["Total equipa", format_number(sum(owner_caps_cfg.values()))])
    total_unique_effort = sum(effort_units(r["esforco"]) for r in rows)
    gate_set = set(constraints["sprint_capacity"].get("gates", []))
    cap_default = float(constraints["sprint_capacity"]["default"])
    cap_gate = float(constraints["sprint_capacity"]["gate"])
    total_capacity = 0.0

    table_rows = []
    for sprint, start, end, foco, _ in SPRINTS:
        total_capacity += cap_gate if sprint in gate_set else cap_default
        gate = "SIM" if sprint in {"S04", "S08", "S12"} else "NAO"
        descricao = "Carga planeada e entrega com evidence completa"
        if sprint == "S12":
            descricao = "Fecho de produto, funcionalidades MF8 expandidas, testes finais e evidence completa"
        table_rows.append(
            [
                sprint,
                f"{start} a {end}",
                foco,
                descricao,
                format_number(sprint_loads.get(sprint, 0.0)),
                gate,
            ]
        )

    content = f"""# PLANO-SPRINTS

## Header
- `doc_id`: `PLANO-SPRINTS`
- `path`: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Conversao S/M/L
- `S`: 1 unidade
- `M`: 2 unidades
- `L`: 3 unidades

## Capacidade semanal por aluno
{fmt_md_table(['Pessoa', 'Capacidade alvo (u/semana)'], owner_capacity_rows)}

## Carga global planeada (modelo normalizado)
- BK totais: `{len(rows)}`
- `esforco_unico_total_u`: `{total_unique_effort}` (cada BK conta 1x com `S=1`, `M=2`, `L=3`)
- `carga_planeada_sprint_u`: distribuicao do esforco pelas janelas declaradas (`Sxx-Syy`)
- Janela de execucao: `12` sprints (`2026-04-13` a `2026-07-05`)
- Capacidade total da janela: `{format_number(total_capacity)}` unidades
- Margem operacional global (capacidade - esforco_unico_total_u): `{format_number(total_capacity - total_unique_effort)}` unidades

## Linha temporal oficial (12 sprints)
{fmt_md_table(['sprint', 'periodo', 'foco_macro', 'objetivo_operacional', 'carga_planeada_u', 'gate'], table_rows)}

## Regra de replaneamento
1. Replaneamento apenas no fecho da sprint, exceto bloqueio critico.
2. Prioridade de execucao: `P0 > P1 > P2`.
3. Qualquer desvio exige sincronizacao de `MATRIZ-CANONICA-BK`, `BACKLOG-MVP`, `MF-VIEWS` e `guias-bk`.
4. Em sobrecarga, reduzir primeiro paralelismo `P1/P2` sem perder cobertura RF/RNF.

## Matriz minima de testes por prioridade
- `P0`: evidencias obrigatorias de `unit + integration + e2e` e minimo `3` negativos.
- `P1`: evidencias obrigatorias de `unit/integration` e minimo `2` negativos.
- `P2`: teste focal do fluxo alterado e minimo `1` negativo.
- Aplicacao canónica: BK em `Sxx-Syy` distribui carga `50/50` por sprint para auditoria.

## KPI minimos por sprint
- Cobertura de BK planeados concluida >= 85%.
- Checklists smoke/negativos/tecnico completos por BK >= 90%.
- Bloqueios >48h com escalacao no scorecard.
- Esforco em core dual (CORE-IA + CORE-COM + CORE-HIBRIDO) >= 70%.

## Artefactos obrigatorios
- `SCORECARD-SPRINTS.md`
- `GUIAO-DOCENTE-SEMANAL.md`
- `GATES-S4-S8-S12.md`
- `OPERACAO-DEPLOY-ROLLBACK.md`
- `ANEXO-CORE-DUAL-BK.md`

## Changelog
- `{TODAY}`: plano de sprints reduzido e sincronizado para horizonte canónico `S01..S12`.
"""
    (plan_root / "sprints" / "PLANO-SPRINTS.md").write_text(content, encoding="utf-8")


def write_scorecard(plan_root: Path, rows: list[dict[str, str]]) -> None:
    sprint_loads = compute_sprint_loads(rows)
    core_percent = compute_core_dual_percent_by_sprint(rows)
    table_rows: list[list[str]] = []
    for sprint, *_ in SPRINTS:
        carga = format_number(sprint_loads.get(sprint, 0.0))
        pct = format_number(core_percent.get(sprint, 100.0))
        table_rows.append(
            [
                sprint,
                "PLANEADA",
                "-",
                "-",
                "-",
                "-",
                "-",
                "S=1,M=2,L=3 + split 50/50",
                carga,
                pct,
                "SIM" if float(pct) >= 70 else "NAO",
                "-",
                "-",
                "N/A",
                "-",
            ]
        )

    content = f"""# SCORECARD-SPRINTS

## Header
- `doc_id`: `SCORECARD-SPRINTS`
- `path`: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Contrato de avaliacao (pesos oficiais)
| criterio | peso |
| --- | --- |
| Cobertura/rastreabilidade | 25 |
| Coerencia documental | 20 |
| Pedagogia/guidance/step-by-step | 25 |
| Adequacao ao 12o | 20 |
| Governanca/avaliacao | 10 |
| Total | 100 |

## Scorecard por sprint
{fmt_md_table([
    'sprint',
    'estado_sprint',
    'cobertura',
    'coerencia',
    'pedagogia_guidance_step_by_step',
    'adequacao_12o',
    'governanca',
    'modelo_carga',
    'carga_planeada_u',
    'core_dual_percent',
    'core_dual_ok',
    'carga_real_u',
    'desvio_u',
    'risco_semaforo',
    'acao_corretiva',
], table_rows)}

## Regra de preenchimento
1. `estado_sprint` so pode ser `PLANEADA`, `EM_CURSO` ou `FECHADA`.
2. Quando `carga_real_u` estiver vazia (`-`), `desvio_u` deve ficar `-` e `risco_semaforo` deve ficar `N/A`.
3. Sprint com total < 93 exige plano corretivo na sprint seguinte.
4. Gates `S4/S8/S12` exigem evidencias anexas de cobertura e coerencia.
5. `acao_corretiva` deve registar mitigacao quando `core_dual_percent < 70%`.

## Regras de semaforo
- `Verde`: desvio absoluto <= 2 unidades e sem bloqueio critico.
- `Amarelo`: desvio entre 3 e 4 unidades ou bloqueio >48h em BK `P1/P2`.
- `Vermelho`: desvio >= 5 unidades, bloqueio em BK `P0` ou quebra de rastreabilidade.

## Changelog
- `{TODAY}`: scorecard migrado para schema canónico único entre as PAPs.
"""
    (plan_root / "sprints" / "SCORECARD-SPRINTS.md").write_text(content, encoding="utf-8")


def write_guiao_docente(plan_root: Path) -> None:
    rows = []
    for sprint, _, _, foco, objetivo in SPRINTS:
        rows.append([sprint, foco, objetivo, "Rever 3 BK criticos + 1 negativo por BK", "Pendente"])

    content = f"""# GUIAO-DOCENTE-SEMANAL

## Header
- `doc_id`: `GUIAO-DOCENTE-SEMANAL`
- `path`: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Fornecer guiao semanal para acompanhamento docente da execucao BK por alunos do 12o ano.

## Plano semanal
{fmt_md_table(['sprint', 'foco_macro', 'objetivo_docente', 'evidencia_minima', 'estado'], rows)}

## Checklist docente obrigatoria
- Verificar se os guias BK usados na semana têm `Bloco pedagogico` e `Bloco operacional` completos.
- Confirmar execucao de negativos conforme prioridade (`P0=>3`, `P1/P2=>2`).
- Validar se handoff para proximo BK esta preenchido e sem ambiguidades.

## Changelog
- `{TODAY}`: guiao docente semanal criado como artefacto oficial de governanca pedagogica.
"""
    (plan_root / "sprints" / "GUIAO-DOCENTE-SEMANAL.md").write_text(content, encoding="utf-8")


def write_relatorio_gates(plan_root: Path) -> None:
    content = f"""# GATES-S4-S8-S12

## Header
- `doc_id`: `GATES-S4-S8-S12`
- `path`: `docs/planificacao/sprints/GATES-S4-S8-S12.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Estabelecer baseline oficial de validacao para os gates S4, S8 e S12.

## Gates
| gate | data_planeada | escopo_macro | criterios_minimos | estado |
| --- | --- | --- | --- | --- |
| S4 | 2026-05-10 | MF0-MF1 | Cobertura RF sem orfaos + 100% guias com header canónico | PENDING |
| S8 | 2026-06-07 | MF0-MF4 | Coerencia matriz/backlog/guias + score >=97/100 | PENDING |
| S12 | 2026-07-05 | MF0-MF8 | Funcionalidades MF8 expandidas antes dos testes finais + testes finais executados + erros corrigidos + auditoria automatica PASS | PENDING |

## Evidencias obrigatorias por gate
- JSON da auditoria automatica (`scripts/latest-audit.json`).
- Snapshot do scorecard da sprint de gate.
- Lista de desvios e acoes corretivas (se existir).

## Changelog
- `{TODAY}`: baseline de gates definido com campos nao ambiguos para execucao futura.
"""
    (plan_root / "sprints" / "GATES-S4-S8-S12.md").write_text(content, encoding="utf-8")


def write_operacao_deploy_rollback(plan_root: Path) -> None:
    content = f"""# OPERACAO-DEPLOY-ROLLBACK

## Header
- `doc_id`: `OPERACAO-DEPLOY-ROLLBACK`
- `path`: `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Definir protocolo operacional minimo para deploy e rollback no contexto PAP, com evidencias verificaveis para gates `S4`, `S8` e `S12`.

## Deploy (baseline)
1. Confirmar BKs da sprint em estado elegivel para release e sem bloqueios `P0`.
2. Executar validacao documental e tecnica (`validate-planificacao` + checks de regressao).
3. Publicar versao com changelog curto e identificador de release.
4. Validar smoke funcional dos fluxos centrais da StudyFlow.

## Rollback
1. Acionar rollback se houver falha critica em fluxo `P0` ou quebra de rastreabilidade.
2. Repor versao estavel anterior e confirmar integridade de dados.
3. Reexecutar smoke dos fluxos centrais e registar impacto.
4. Abrir acao corretiva no scorecard da sprint.

## Verificacao pos-deploy
- Smoke obrigatorio para autenticacao, estudo assistido e colaboracao/turma.
- Confirmar logs sem erro critico e tempos dentro do alvo documental.
- Validar alinhamento dos artefactos de sprint/gate apos release.

## Incidentes
- Severidade `Alta`: indisponibilidade de fluxo core da app.
- Severidade `Media`: regressao parcial com workaround.
- Severidade `Baixa`: falha cosmetica sem impacto funcional core.
- Todo incidente deve registar causa, mitigacao e acao preventiva.

## Evidencias
- Identificador de release e timestamp.
- Resultado dos checks pre e pos deploy.
- Registo de rollback (quando aplicavel).
- Referencia no scorecard e no gate da sprint.

## Changelog
- `{TODAY}`: artefacto criado para cumprir contrato canónico de operacao/deploy/rollback.
"""
    (plan_root / "sprints" / "OPERACAO-DEPLOY-ROLLBACK.md").write_text(content, encoding="utf-8")


def write_core_dual_contract(plan_root: Path) -> None:
    content = f"""# CORE-DUAL-CONTRATO

## Header
- `doc_id`: `CORE-DUAL-CONTRATO`
- `path`: `docs/planificacao/CORE-DUAL-CONTRATO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Definicao oficial
A StudyFlow opera em core dual:
1. `Aprendizagem inteligente` (explicacoes, personalizacao, tutor IA e progresso academico).
2. `Operacao pedagogica` (turmas, projetos, avaliacao, colaboracao e rotina de estudo).

## Regras canónicas
- Regra de equilibrio: por sprint, `>=70%` do esforco deve estar em `CORE-IA`, `CORE-COM` ou `CORE-HIBRIDO`.
- Regra de entrada BK (GO/NO-GO): BK novo so entra no MVP se reforcar aprendizagem inteligente, operacao pedagogica, ou ambos.
- Regra anti-desvio: BK sem contribuicao direta para os eixos core deve ser classificado como `SUPORTE`.
- Regra de evidencias: BK `CORE-*` exige evidencia tecnica e evidencia de impacto academico.
- Regra de viabilidade: quando necessario, o solver pode reclassificar `SUPORTE -> CORE-HIBRIDO` de forma minima e criterial.

## Classes e significado
- `CORE-IA`: entrega direta no eixo de aprendizagem inteligente.
- `CORE-COM`: entrega direta no eixo de operacao pedagogica.
- `CORE-HIBRIDO`: entrega com impacto simultaneo nos dois eixos.
- `SUPORTE`: habilitador transversal de operacao, qualidade ou governanca.

## KPIs minimos de acompanhamento
- `CORE-IA`: `taxa_resposta_util`, `tempo_resposta_p95`.
- `CORE-COM`: `adesao_turma_semana`, `taxa_tarefas_concluidas`.
- `CORE-HIBRIDO`: `tempo_estudo_semana`, `taxa_retencao_30d`.
- `SUPORTE`: `taxa_incidentes_criticos`, `taxa_conformidade_gates`.

## Fonte de verdade
- Classificacao por BK: `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`.
- Planeamento de sprint: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Governanca de gate: `docs/planificacao/sprints/GATES-S4-S8-S12.md`.

## Changelog
- `{TODAY}`: contrato criado para institucionalizar o core dual e controlar desvio de conceito.
"""
    (plan_root / "CORE-DUAL-CONTRATO.md").write_text(content, encoding="utf-8")


def write_core_dual_annex(plan_root: Path, rows: list[dict[str, str]]) -> None:
    table_rows: list[list[str]] = []
    for row in rows:
        classe, eixo, kpi1, kpi2, justificacao = classify_core_dual(row)
        table_rows.append([row["bk_id"], classe, eixo, kpi1, kpi2, justificacao])

    content = f"""# ANEXO-CORE-DUAL-BK

## Header
- `doc_id`: `ANEXO-CORE-DUAL-BK`
- `path`: `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Classificar cada BK no contrato de core dual da StudyFlow e ligar cada item a KPI primario/secundario auditavel.

## Rubrica deterministica
- `CORE-IA`: impacto direto em explicacoes, personalizacao e tutor IA.
- `CORE-COM`: impacto direto em operacao pedagogica de turma/projeto/avaliacao.
- `CORE-HIBRIDO`: impacto simultaneo real nos dois eixos.
- `SUPORTE`: qualidade/operacao/governanca sem impacto funcional core direto.
- Reclassificacao minima (quando aplicada) segue output do solver deterministico em `scripts/solver_reassignments.json`.

## Schema
- Colunas oficiais: `bk_id | classe_core_dual | eixo_primario | kpi_primario | kpi_secundario | justificacao_classe`.
- Classes permitidas: `CORE-IA`, `CORE-COM`, `CORE-HIBRIDO`, `SUPORTE`.

## Mapeamento BK -> Core Dual
{fmt_md_table(
    ['bk_id', 'classe_core_dual', 'eixo_primario', 'kpi_primario', 'kpi_secundario', 'justificacao_classe'],
    table_rows,
)}

## Changelog
- `{TODAY}`: anexo atualizado com rubrica deterministica e coluna `justificacao_classe`.
"""
    (plan_root / "backlogs" / "ANEXO-CORE-DUAL-BK.md").write_text(content, encoding="utf-8")


def write_matrix(plan_root: Path, rows: list[dict[str, str]]) -> None:
    table_rows = []
    for r in rows:
        table_rows.append(
            [
                r["bk_id"],
                r["macro"],
                r["titulo"],
                r["owner"],
                r["apoio"],
                r["prioridade"],
                r["estado"],
                r["real_dev_status"],
                r["esforco"],
                r["dependencias"],
                r["rf_rnf"],
                r["fase_documental"],
                assigned_sprint(r),
                core_or_reforco(r["prioridade"]),
                r["proximo_bk"],
                guide_path(r),
            ]
        )

    content = f"""# MATRIZ-CANONICA-BK

## Header
- `doc_id`: `MATRIZ-CANONICA-BK`
- `path`: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Matriz unica e canónica para garantir rastreabilidade `RF/RNF -> BK -> Sprint -> Guia` sem drift operacional.

## Tabela canonica
{fmt_md_table([
    'bk_id',
    'macro',
    'titulo',
    'owner',
    'apoio',
    'prioridade',
    'estado',
    'real_dev_status',
    'esforco',
    'dependencias',
    'rf_rnf',
    'fase_documental',
    'sprint',
    'core_or_reforco',
    'proximo_bk_recomendado',
    'guia_path',
], table_rows)}

## Validacao inicial
- BK duplicado: nao detetado.
- BK orfao: nao detetado.
- Dependencias invalidas: nao detetadas.

## Changelog
- `{TODAY}`: matriz expandida com `sprint`, `core_or_reforco` e `guia_path` para contrato canónico completo.
"""
    (plan_root / "backlogs" / "MATRIZ-CANONICA-BK.md").write_text(content, encoding="utf-8")


def write_backlog(plan_root: Path, rows: list[dict[str, str]]) -> None:
    prio_by_macro = defaultdict(Counter)
    for r in rows:
        prio_by_macro[r["macro"]][r["prioridade"]] += 1

    snapshot_rows = []
    for macro in MACRO_ORDER:
        total = sum(prio_by_macro[macro].values())
        snapshot_rows.append(
            [
                macro,
                str(total),
                str(prio_by_macro[macro]["P0"]),
                str(prio_by_macro[macro]["P1"]),
                str(prio_by_macro[macro]["P2"]),
            ]
        )

    global_rows = []
    for r in rows:
        global_rows.append(
            [
                r["bk_id"],
                r["macro"],
                r["titulo"],
                r["owner"],
                r["apoio"],
                r["prioridade"],
                r["estado"],
                r["real_dev_status"],
                r["esforco"],
                r["dependencias"],
                r["rf_rnf"],
                r["fase_documental"],
                assigned_sprint(r),
                core_or_reforco(r["prioridade"]),
                r["proximo_bk"],
                f"[guia]({guide_rel(r)})",
            ]
        )

    lines = [
        "# BACKLOG-MVP",
        "",
        "## Header",
        "- `doc_id`: `BACKLOG-MVP`",
        "- `path`: `docs/planificacao/backlogs/BACKLOG-MVP.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Legenda",
        "- Prioridade: `P0` (Must), `P1` (Should), `P2` (Could).",
        "- Politica pedagogica: `P0=>Reforco`, `P1/P2=>Core`.",
        "- Estado: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.",
        "- Real dev: estado independente vindo de `ESTADO-REFERENCIA-REAL_DEV.md`; nunca é inferido de `estado`.",
        "- Esforco: `S`, `M`, `L`.",
        "",
        "## Snapshot por macro",
        fmt_md_table(["Macro", "Total BK", "P0", "P1", "P2"], snapshot_rows),
        "",
        "## Tabela global de ligacao BK -> guia -> estado documental",
        fmt_md_table(
            [
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
            ],
            global_rows,
        ),
        "",
    ]

    for macro in MACRO_ORDER:
        macro_rows = [r for r in rows if r["macro"] == macro]
        if not macro_rows:
            continue
        lines.append(f"## {macro} - {MACRO_LABEL[macro]}")
        lines.append(
            fmt_md_table(
                ["bk_id", "titulo", "owner", "apoio", "prioridade", "estado", "real_dev_status", "esforco", "dependencias", "rf_rnf", "sprint", "core_or_reforco", "proximo_bk"],
                [
                    [
                        r["bk_id"],
                        r["titulo"],
                        r["owner"],
                        r["apoio"],
                        r["prioridade"],
                        r["estado"],
                        r["real_dev_status"],
                        r["esforco"],
                        r["dependencias"],
                        r["rf_rnf"],
                        assigned_sprint(r),
                        core_or_reforco(r["prioridade"]),
                        r["proximo_bk"],
                    ]
                    for r in macro_rows
                ],
            )
        )
        lines.append("")

    lines.extend(
        [
            "## Changelog",
            f"- `{TODAY}`: backlog global normalizado com campos `sprint` e `core_or_reforco` alinhados ao contrato canónico.",
            "",
        ]
    )

    (plan_root / "backlogs" / "BACKLOG-MVP.md").write_text("\n".join(lines), encoding="utf-8")


def write_mf_views(plan_root: Path, rows: list[dict[str, str]]) -> None:
    lines = [
        "# MF-VIEWS",
        "",
        "## Header",
        "- `doc_id`: `MF-VIEWS`",
        "- `path`: `docs/planificacao/backlogs/MF-VIEWS.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Criterio de pronto pedagogico por macro",
        "- 100% BK com guia canónico completo e snippet tecnico aplicavel.",
        "- Minimo de passos por BK: `P0=>8`, `P1/P2=>6`.",
        "- Minimo de negativos por BK: `P0=>3`, `P1/P2=>2`.",
        "",
        "## Sequencia macro",
        "MF0 -> MF1 -> MF2 -> MF3 -> MF4 -> MF5 -> MF6 -> MF7 -> MF8",
        "",
    ]

    for macro in MACRO_ORDER:
        macro_rows = [r for r in rows if r["macro"] == macro]
        if not macro_rows:
            continue

        seq = ", ".join(r["bk_id"] for r in macro_rows)
        lines.append(f"## {macro} - {MACRO_LABEL[macro]}")
        lines.append("### Sequencia por macro")
        lines.append(seq)
        lines.append("")

        lines.append("### Guias disponiveis")
        for r in macro_rows:
            lines.append(f"- [{r['bk_id']} - {r['titulo']}]({guide_rel(r)})")
        lines.append("")

        lines.append("### Step-by-step macro")
        lines.append("1. Confirmar dependencias desbloqueadas antes de iniciar BK.")
        lines.append("2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.")
        lines.append("3. Validar smoke e negativos por BK antes do handoff.")
        lines.append("4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.")
        lines.append("5. Fechar macro apenas com criterios de pronto cumpridos.")
        lines.append("")

        lines.append("### Pronto da macro")
        lines.append("- Todos os BK da macro com guia e evidence minima.")
        lines.append("- Sem dependencias invalidas para a macro seguinte.")
        lines.append("")

    lines.extend(
        [
            "## Changelog",
            f"- `{TODAY}`: MF views sincronizadas com naming slug e contrato canónico de pronto pedagogico.",
            "",
        ]
    )

    (plan_root / "backlogs" / "MF-VIEWS.md").write_text("\n".join(lines), encoding="utf-8")


def add_missing_real_dev_status(text: str, bk_id: str, expected: str) -> str:
    """Acrescenta apenas um header ausente; nunca altera um estado manual."""

    current = re.search(r"^- `real_dev_status`: `([^`]+)`", text, flags=re.MULTILINE)
    if current:
        actual = validate_real_dev_status(current.group(1), bk_id)
        if actual != expected:
            raise RuntimeError(
                f"{bk_id}: real_dev_status manual={actual} diverge da autoridade={expected}; correção manual obrigatória"
            )
        return text
    pedagogical = re.search(r"^- `estado`: `[^`]+`$", text, flags=re.MULTILINE)
    if not pedagogical:
        raise RuntimeError(f"{bk_id}: header estado ausente; não é seguro inserir real_dev_status")
    insertion = pedagogical.group(0) + f"\n- `real_dev_status`: `{expected}`"
    return text[: pedagogical.start()] + insertion + text[pedagogical.end() :]


def index_existing_guides(guides_root: Path) -> dict[str, Path]:
    indexed: dict[str, Path] = {}
    for path in sorted(guides_root.glob("MF*/BK-MF*.md")):
        text = path.read_text(encoding="utf-8")
        match = re.search(r"^- `bk_id`: `([^`]+)`", text, flags=re.MULTILINE)
        if not match:
            continue
        bk_id = match.group(1)
        if bk_id in indexed:
            raise RuntimeError(f"Guias duplicados para {bk_id}: {indexed[bk_id]} e {path}")
        indexed[bk_id] = path
    return indexed


def write_guias_docs(
    plan_root: Path,
    rows: list[dict[str, str]],
    *,
    check: bool = False,
) -> list[str]:
    guides_root = plan_root / "guias-bk"
    existing = index_existing_guides(guides_root)
    issues: list[str] = []

    for r in rows:
        d = guides_root / r["macro"]
        target = existing.get(r["bk_id"], d / guide_filename(r))
        if target.exists():
            current = target.read_text(encoding="utf-8")
            updated = add_missing_real_dev_status(
                current,
                r["bk_id"],
                r["real_dev_status"],
            )
            if updated != current:
                issues.append(f"{r['bk_id']}: header real_dev_status ausente")
                if not check:
                    target.write_text(updated, encoding="utf-8")
            continue
        issues.append(f"{r['bk_id']}: guia ausente")
        if not check:
            d.mkdir(parents=True, exist_ok=True)
            target.write_text(render_guide(r), encoding="utf-8")

    if check:
        return issues

    # README
    lines = [
        "# GUIAS-BK-README",
        "",
        "## Header",
        "- `doc_id`: `GUIAS-BK-README`",
        "- `path`: `docs/planificacao/guias-bk/README.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Regra de naming oficial",
        "- Formato obrigatorio: `BK-MF*-**-slug-semantico.md`.",
        "- IDs BK mantidos sem alteracao.",
        "",
        "## Contrato de header obrigatorio",
        "- Campos obrigatorios: `bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `real_dev_status`, `esforco`, `dependencias`, `rf_rnf`, `fase_documental`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`, `last_updated`.",
        "- `real_dev_status` vem exclusivamente de `ESTADO-REFERENCIA-REAL_DEV.md`; nunca é inferido de `estado`.",
        "",
        "## Contrato semântico obrigatório",
        "- O `rf_rnf` do header deve estar refletido nos `Passos`, `Validacao` e `Cenarios negativos recomendados`.",
        "- O `Snippet tecnico aplicavel` deve pertencer ao dominio funcional do BK (nao sao aceites snippets genéricos).",
        "- `Evidence` deve incluir prova do caminho principal e prova de falha controlada.",
        "- Politica de negativos: `P0=>3`, `P1=>2`, `P2=>1`.",
        "",
        "## Indice completo",
    ]
    for macro in MACRO_ORDER:
        macro_rows = [r for r in rows if r["macro"] == macro]
        if not macro_rows:
            continue
        lines.append(f"### {macro}")
        for r in macro_rows:
            lines.append(f"- [{r['bk_id']} - {r['titulo']}]({r['macro']}/{guide_filename(r)})")
        lines.append("")

    lines.extend(["## Changelog", f"- `{TODAY}`: indice regenerado com naming semantico e layout canónico.", ""])
    (guides_root / "README.md").write_text("\n".join(lines), encoding="utf-8")

    # Template
    template = f"""# BK-MF*-** - Titulo do BK

## Header
- `doc_id`: `GUIA-BK-MF*-**`
- `bk_id`: `BK-MF*-**`
- `macro`: `MF*`
- `owner`: `...`
- `apoio`: `...`
- `prioridade`: `P0|P1|P2`
- `estado`: `TODO|IN_PROGRESS|DONE|BLOCKED`
- `real_dev_status`: `VALIDADO|IMPLEMENTADO_NAO_VALIDADO|PARCIAL|MITIGADO_POR_ESCOPO|BLOQUEADO_OPERADOR|NAO_IMPLEMENTADO|NAO_APLICAVEL`
- `esforco`: `S|M|L`
- `dependencias`: `BK-...|-`
- `rf_rnf`: `RFxx|RNFxx`
- `fase_documental`: `Fase 1|Fase 2|Fase 3`
- `sprint`: `Sxx-Syy`
- `core_or_reforco`: `Core|Reforco`
- `proximo_bk`: `BK-...|-`
- `guia_path`: `docs/planificacao/guias-bk/MF*/BK-MF*-**-slug-semantico.md`
- `last_updated`: `{TODAY}`

## Contexto do BK
## Bloco pedagogico
### Objetivo
### Pre-requisitos
### Erros comuns
### Check de compreensao
### Tempo estimado

## Bloco operacional
### Entrada
### Passos
### Cenarios negativos recomendados
### Validacao
### Matriz minima de testes por prioridade
### Handoff

## Snippet tecnico aplicavel
```ts
// Snippet obrigatoriamente especifico do dominio do BK (nao generico)
```

## Criterios de aceite
## Evidence para PR/defesa
## Proximo BK recomendado
## Changelog
"""
    (guides_root / "_TEMPLATE-BK.md").write_text(template, encoding="utf-8")

    # Roadmap
    roadmap = [
        "# ROADMAP-BKS-RESTANTES",
        "",
        "## Header",
        "- `doc_id`: `ROADMAP-BKS-RESTANTES`",
        "- `path`: `docs/planificacao/guias-bk/ROADMAP-BKS-RESTANTES.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Objetivo",
        "Explicitar sequencia canónica de implementacao BK por macro e sprint, sem alterar IDs.",
        "",
        "## Sequencia resumida",
    ]
    for macro in MACRO_ORDER:
        macro_rows = [r for r in rows if r["macro"] == macro]
        if not macro_rows:
            continue
        roadmap.append(f"- `{macro}` ({macro_window_from_rows(rows, macro)}): " + ", ".join(r["bk_id"] for r in macro_rows))

    roadmap.extend(["", "## Changelog", f"- `{TODAY}`: roadmap alinhado ao horizonte S01..S12.", ""])
    (guides_root / "ROADMAP-BKS-RESTANTES.md").write_text("\n".join(roadmap), encoding="utf-8")

    # Migration map
    map_lines = [
        "# MAPA-MIGRACAO-LEGACY-PARA-CANONICO",
        "",
        "## Header",
        "- `doc_id`: `MAPA-MIGRACAO`",
        "- `path`: `docs/planificacao/guias-bk/MAPA-MIGRACAO-LEGACY-PARA-CANONICO.md`",
        "- `owner`: `Nuno`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Nota",
        "- IDs BK mantidos sem alteracao.",
        "- Mudanca aplicada apenas no naming para slug semantico.",
        "",
        "## Mapa",
        "| origem_legacy | destino_canonico |",
        "| --- | --- |",
    ]
    for r in rows:
        map_lines.append(f"| {r['macro']}/{r['bk_id']}.md | {r['macro']}/{guide_filename(r)} |")
    map_lines.extend(["", "## Changelog", f"- `{TODAY}`: migracao de naming concluida.", ""])
    (guides_root / "MAPA-MIGRACAO-LEGACY-PARA-CANONICO.md").write_text("\n".join(map_lines), encoding="utf-8")
    return issues


def write_relatorio_placeholder(plan_root: Path) -> None:
    output_path = plan_root / "CONFORMIDADE-PLANIFICACAO.md"
    if output_path.exists():
        # O relatório contém evidence gerada pela auditoria; o normalizador não o substitui.
        return
    content = f"""# CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Estado
Relatorio gerado automaticamente pelo pipeline de validacao (`scripts/validate-planificacao.sh`).

## Meta oficial
- Objetivo documental: `>=97/100`.
- Resultado atual: consultar secao de score no relatorio mais recente.

## Evidencia de auditoria
- Ficheiro fonte: `docs/planificacao/scripts/latest-audit.json`.
- Dimensoes: cobertura, coerencia, pedagogia, adequacao 12o, governanca.

## Changelog
- `{TODAY}`: ficheiro preparado para atualizacao automatica no fecho da validacao.
"""
    output_path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Normaliza a planificação StudyFlow sem promover estados da referência.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Valida fontes e headers sem executar solver nem escrever documentos.",
    )
    args = parser.parse_args()
    plan_root = Path(__file__).resolve().parents[1]

    raw_rows = parse_global_rows_from_backlog(plan_root / "backlogs" / "BACKLOG-MVP.md")
    reference_statuses = parse_reference_real_dev_statuses(plan_root)
    guide_statuses = parse_existing_guide_statuses(plan_root)
    rows = normalize_rows(raw_rows, reference_statuses, guide_statuses)

    if args.check:
        issues = write_guias_docs(plan_root, rows, check=True)
        if issues:
            print("Normalização desatualizada:")
            for issue in issues:
                print(f"- {issue}")
            return 1
        print(f"Normalização consistente: {len(rows)} BK; nenhum ficheiro alterado.")
        return 0

    constraints = load_constraints_contract(plan_root)
    solver_payload = run_solver_and_load(plan_root)
    rows = apply_solver_assignments(rows, solver_payload)

    write_readme(plan_root)
    write_plano_implementacao(plan_root, rows)
    write_distribuicao(plan_root, rows, constraints)
    write_plano_sprints(plan_root, rows, constraints)
    write_scorecard(plan_root, rows)
    write_guiao_docente(plan_root)
    write_relatorio_gates(plan_root)
    write_operacao_deploy_rollback(plan_root)
    write_core_dual_contract(plan_root)

    write_matrix(plan_root, rows)
    write_backlog(plan_root, rows)
    write_mf_views(plan_root, rows)
    write_core_dual_annex(plan_root, rows)
    write_guias_docs(plan_root, rows)

    write_relatorio_placeholder(plan_root)

    print(f"Normalizacao concluida: {len(rows)} BK processados.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(f"CHECK_FAILED: {error}", file=sys.stderr)
        raise SystemExit(1) from None
