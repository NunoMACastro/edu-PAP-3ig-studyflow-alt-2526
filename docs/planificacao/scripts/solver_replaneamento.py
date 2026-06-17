#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import re
import unicodedata
from collections import Counter, defaultdict, deque
from dataclasses import dataclass
from pathlib import Path

TODAY = "2026-04-19"
SPRINTS = [f"S{i:02d}" for i in range(1, 13)]
SPRINT_INDEX = {s: i for i, s in enumerate(SPRINTS, start=1)}


@dataclass
class Task:
    bk_id: str
    macro: str
    titulo: str
    owner_original: str
    owner_current: str
    apoio: str
    prioridade: str
    estado: str
    esforco: str
    dependencias: list[str]
    rf_rnf: str
    sprint_original: str
    preferred_sprint: int
    domain: str
    class_original: str
    class_current: str

    @property
    def effort(self) -> int:
        return {"S": 1, "M": 2, "L": 3}.get(self.esforco, 1)


def split_md_row(line: str) -> list[str]:
    return [p.strip() for p in line.strip().strip("|").split("|")]


def parse_items(raw: str) -> list[str]:
    raw = raw.strip().replace("`", "")
    if raw in {"", "-", "transversal"}:
        return []
    return [x.strip() for x in raw.split(",") if x.strip()]


def parse_sprint_tokens(raw: str) -> list[str]:
    text = raw.strip()
    if not text:
        return []
    m = re.fullmatch(r"(S\d{2})-(S\d{2})", text)
    if m:
        a = int(m.group(1)[1:])
        b = int(m.group(2)[1:])
        if a > b:
            return []
        return [f"S{i:02d}" for i in range(a, b + 1)]
    if re.fullmatch(r"S\d{2}(,S\d{2})*", text):
        return [p.strip() for p in text.split(",") if p.strip()]
    return []


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    return text.lower()


def first_req(rf_rnf: str) -> str:
    tokens = parse_items(rf_rnf)
    return tokens[0] if tokens else "RF00"


def classify_domain(titulo: str, rf_rnf: str) -> str:
    title = normalize_text(titulo)
    req = first_req(rf_rnf)

    if req in {"RNF38"} or any(k in title for k in ["chrome", "firefox", "safari", "edge", "compat"]):
        return "compatibility_browser"
    if req in {"RNF39", "RNF42", "RNF43", "RNF44"} or any(k in title for k in ["pt-pt", "portugu", "datas", "i18n", "utf-8"]):
        return "localization"
    if req in {"RNF14", "RNF15", "RNF16", "RNF17", "RNF18", "RNF19", "RNF20"} or any(
        k in title for k in ["https", "tls", "hashing", "password", "xss", "csrf", "injection", "brute", "sandbox seguro", "cookies"]
    ):
        return "security_hardening"
    if req in {"RNF21", "RNF22", "RNF23", "RNF24", "RNF29", "RNF30"} or any(
        k in title for k in ["backup", "recovery", "downtime", "health-check", "deploy", "rollback", "logs"]
    ):
        return "reliability_ops"
    if req in {"RNF25", "RNF26", "RNF27", "RNF28"} or any(
        k in title for k in ["backend modular", "frontend componentizado", "documentacao tecnica", "testes automatizados"]
    ):
        return "quality_architecture"
    if req in {"RNF08", "RNF09", "RNF10", "RNF11", "RNF12", "RNF13"} or any(
        k in title for k in ["2s", "4s", "simultaneos", "assincrona", "background", "escalar", "performance"]
    ):
        return "performance_scalability"
    if req in {"RF52", "RF53", "RF54"} or any(k in title for k in ["consentimentos", "exportar dados", "eliminar conta", "dados pessoais", "rgpd"]):
        return "privacy_rgpd"
    if req in {"RF55", "RF56", "RF57", "RF58"} or any(k in title for k in ["utilizadores", "auditoria completa", "modelos de ia", "quotas de ia", "administrador"]):
        return "admin_governance"
    if req in {"RF47", "RF48", "RF49", "RF50", "RF51"} or any(k in title for k in ["notific", "alerta", "avisos", "publicacoes"]):
        return "notifications"
    if req in {"RF41", "RF42", "RF43", "RF44"} or any(k in title for k in ["grupo", "chat", "coletiv", "sessoes de estudo"]):
        return "collaboration"
    if req in {"RF19", "RF20", "RF21", "RF22", "RF23", "RF24", "RF25"} or any(k in title for k in ["turmas", "disciplin", "docente", "professor"]):
        return "classroom_teacher"
    if req in {"RF26", "RF27", "RF28", "RF29", "RF30"} or any(k in title for k in ["projetos", "testes", "mini-testes", "aprovar conteudo", "metricas da turma"]):
        return "projects_assessment"
    if req in {"RF31", "RF32", "RF33", "RF34"} or any(k in title for k in ["indexacao", "extrair topicos", "versoes dos materiais", "separar materiais", "pdf", "docx", "urls"]):
        return "materials_ingestion"
    if req in {"RF35", "RF36", "RF37", "RF38", "RF39", "RF40"} or any(
        k in title for k in ["assistente ia", "guardrails", "citacoes obrigatorias", "nao pode inventar", "conhecimento externo", "adapta explicacoes"]
    ):
        return "ai_orchestration"
    if req in {"RNF01", "RNF02", "RNF03", "RNF04", "RNF05", "RNF06", "RNF07"} or any(
        k in title for k in ["interface intuitiva", "layout responsivo", "acessibilidade", "feedback imediato", "validacao de formularios", "navegacao consistente"]
    ):
        return "ux_accessibility"
    if req in {"RF61", "RNF41"} or any(k in title for k in ["drive", "onedrive", "ics", "lms", "integracao"]):
        return "integrations"
    return "learning_foundation"


def class_for_domain(domain: str) -> str:
    mapping = {
        "ai_orchestration": "CORE-IA",
        "materials_ingestion": "CORE-IA",
        "classroom_teacher": "CORE-COM",
        "projects_assessment": "CORE-COM",
        "learning_foundation": "CORE-HIBRIDO",
        "collaboration": "CORE-HIBRIDO",
        "notifications": "CORE-HIBRIDO",
        "privacy_rgpd": "CORE-HIBRIDO",
        "integrations": "CORE-HIBRIDO",
        "admin_governance": "SUPORTE",
        "ux_accessibility": "SUPORTE",
        "performance_scalability": "SUPORTE",
        "security_hardening": "SUPORTE",
        "reliability_ops": "SUPORTE",
        "quality_architecture": "SUPORTE",
        "compatibility_browser": "SUPORTE",
        "localization": "SUPORTE",
    }
    return mapping.get(domain, "CORE-HIBRIDO")


def parse_backlog_rows(backlog_path: Path) -> list[dict[str, str]]:
    lines = backlog_path.read_text(encoding="utf-8").splitlines()
    header_idx = None
    for i, line in enumerate(lines):
        if line.startswith("| bk_id") and "| guia" in line:
            header_idx = i
            break
    if header_idx is None:
        raise RuntimeError("Tabela global do backlog nao encontrada.")

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
        row = dict(zip(headers, cols))
        if row.get("bk_id", "").startswith("BK-MF"):
            rows.append(row)

    if not rows:
        raise RuntimeError("Backlog sem linhas BK validas.")
    return rows


def parse_core_dual_annex(core_dual_path: Path) -> dict[str, str]:
    if not core_dual_path.exists():
        return {}
    lines = core_dual_path.read_text(encoding="utf-8").splitlines()
    header_idx = None
    for i, line in enumerate(lines):
        if line.startswith("| bk_id | classe_core_dual |"):
            header_idx = i
            break
    if header_idx is None:
        return {}

    headers = split_md_row(lines[header_idx])
    out: dict[str, str] = {}
    for line in lines[header_idx + 2 :]:
        if not line.strip().startswith("|"):
            continue
        cols = split_md_row(line)
        if len(cols) != len(headers):
            continue
        row = dict(zip(headers, cols))
        bk = row.get("bk_id", "").strip()
        cls = row.get("classe_core_dual", "").strip()
        if bk and cls:
            out[bk] = cls
    return out


def preferred_sprint_from_window(window: str) -> int:
    tokens = parse_sprint_tokens(window)
    if not tokens:
        return 12
    idxs = [SPRINT_INDEX[t] for t in tokens if t in SPRINT_INDEX]
    if not idxs:
        return 12
    return idxs[0]


def load_tasks(rows: list[dict[str, str]], class_map: dict[str, str]) -> dict[str, Task]:
    tasks: dict[str, Task] = {}
    for row in rows:
        bk_id = row["bk_id"].strip()
        owner = row.get("owner", "-").strip()
        domain = classify_domain(row.get("titulo", ""), row.get("rf_rnf", ""))
        inferred_class = class_for_domain(domain)
        cls = class_map.get(bk_id, inferred_class)
        sprint_raw = row.get("sprint", "S12").strip() or "S12"
        tasks[bk_id] = Task(
            bk_id=bk_id,
            macro=row.get("macro", "-").strip(),
            titulo=row.get("titulo", "-").strip(),
            owner_original=owner,
            owner_current=owner,
            apoio=row.get("apoio", "-").strip(),
            prioridade=row.get("prioridade", "P1").strip(),
            estado=row.get("estado", "TODO").strip(),
            esforco=row.get("esforco", "S").strip(),
            dependencias=parse_items(row.get("dependencias", "-")),
            rf_rnf=row.get("rf_rnf", "-").strip(),
            sprint_original=sprint_raw,
            preferred_sprint=preferred_sprint_from_window(sprint_raw),
            domain=domain,
            class_original=cls,
            class_current=cls,
        )
    return tasks


def build_graph(tasks: dict[str, Task]) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    deps: dict[str, list[str]] = {}
    children: dict[str, list[str]] = {bk: [] for bk in tasks}
    for bk, task in tasks.items():
        valid = []
        for dep in task.dependencias:
            if dep in tasks:
                valid.append(dep)
                children[dep].append(bk)
        deps[bk] = sorted(valid)
    for bk in children:
        children[bk].sort()
    return deps, children


def topo_sort(tasks: dict[str, Task], deps: dict[str, list[str]]) -> list[str]:
    indeg = {bk: len(dep_list) for bk, dep_list in deps.items()}
    q = deque(sorted([bk for bk, d in indeg.items() if d == 0]))
    out: list[str] = []
    _, children = build_graph(tasks)

    while q:
        bk = q.popleft()
        out.append(bk)
        for child in children[bk]:
            indeg[child] -= 1
            if indeg[child] == 0:
                q.append(child)

    if len(out) != len(tasks):
        raise RuntimeError("Dependencias ciclicas detetadas no backlog BK.")
    return out


def compute_depths(order: list[str], deps: dict[str, list[str]]) -> dict[str, int]:
    depth: dict[str, int] = {}
    for bk in order:
        if not deps[bk]:
            depth[bk] = 0
        else:
            depth[bk] = max(depth[d] for d in deps[bk]) + 1
    return depth


def sprint_caps(constraints: dict) -> dict[int, float]:
    cap_default = float(constraints["sprint_capacity"]["default"])
    cap_gate = float(constraints["sprint_capacity"]["gate"])
    gates = set(constraints["sprint_capacity"].get("gates", []))
    out: dict[int, float] = {}
    for i in range(1, 13):
        tag = f"S{i:02d}"
        out[i] = cap_gate if tag in gates else cap_default
    return out


def owner_caps(constraints: dict) -> dict[str, float]:
    return {k: float(v) for k, v in constraints["owner_capacity_weekly"].items()}


def priority_move_penalty(prioridade: str, weights: dict) -> float:
    if prioridade == "P0":
        return float(weights["p0_move"])
    return float(weights["p1_p2_move"])


def owner_sequence(task: Task, owners: list[str]) -> list[str]:
    if task.owner_original in owners:
        rest = [o for o in owners if o != task.owner_original]
        return [task.owner_original] + rest
    return owners[:]


def owner_fit_score(owner: str, task: Task) -> float:
    domain = task.domain
    technical = domain in {
        "ai_orchestration",
        "materials_ingestion",
        "performance_scalability",
        "security_hardening",
        "quality_architecture",
        "reliability_ops",
    }
    ops = domain in {"admin_governance", "notifications", "privacy_rgpd", "reliability_ops"}

    if owner == "Natalia":
        return 3.0 if technical else 2.0
    if owner == "Guilherme":
        return 2.6 if technical else 2.1
    if owner == "Kaua":
        return 1.9
    if owner == "Daniel":
        if ops:
            return 2.5
        return 1.0
    return 1.5


def compute_reclass_candidates(tasks: dict[str, Task], constraints: dict) -> list[str]:
    eligible = set(constraints["reclassification"].get("eligible_domains", []))
    ineligible = set(constraints["reclassification"].get("ineligible_domains", []))

    impact = {
        "security_hardening": 5,
        "reliability_ops": 5,
        "performance_scalability": 5,
        "quality_architecture": 4,
        "ux_accessibility": 4,
        "compatibility_browser": 3,
        "localization": 3,
    }
    priority_rank = {"P0": 3, "P1": 2, "P2": 1}
    effort_rank = {"M": 3, "L": 2, "S": 1}

    candidates = []
    for bk, task in tasks.items():
        if task.class_current != "SUPORTE":
            continue
        if task.domain in ineligible:
            continue
        if task.domain not in eligible:
            continue
        candidates.append(
            (
                -impact.get(task.domain, 1),
                -priority_rank.get(task.prioridade, 1),
                -effort_rank.get(task.esforco, 1),
                bk,
            )
        )

    candidates.sort()
    return [c[3] for c in candidates]


def global_core_effort(tasks: dict[str, Task]) -> tuple[int, int, int]:
    total = 0
    core = 0
    support = 0
    for t in tasks.values():
        e = t.effort
        total += e
        if t.class_current == "SUPORTE":
            support += e
        else:
            core += e
    return total, core, support


def apply_min_viability_reclass(tasks: dict[str, Task], constraints: dict) -> dict[str, str]:
    min_pct = float(constraints["hard_rules"].get("core_dual_percent_min_per_sprint", 70.0))
    total, core, _ = global_core_effort(tasks)
    needed = max(0, math.ceil((min_pct / 100.0) * total - core))

    reasons: dict[str, str] = {}
    if needed <= 0:
        return reasons

    candidates = compute_reclass_candidates(tasks, constraints)
    acc = 0
    for bk in candidates:
        task = tasks[bk]
        task.class_current = constraints["reclassification"].get("target_class", "CORE-HIBRIDO")
        reasons[bk] = "global_viability_bound"
        acc += task.effort
        if acc >= needed:
            break

    if acc < needed:
        raise RuntimeError("Nao ha candidatos suficientes para reclassificacao minima de viabilidade global.")
    return reasons


def plan_assignments(tasks: dict[str, Task], constraints: dict) -> tuple[dict[str, int], dict[str, str]]:
    deps, _ = build_graph(tasks)
    order = topo_sort(tasks, deps)
    depths = compute_depths(order, deps)

    order = sorted(
        order,
        key=lambda bk: (
            depths[bk],
            tasks[bk].preferred_sprint,
            {"P0": 0, "P1": 1, "P2": 2}.get(tasks[bk].prioridade, 9),
            bk,
        ),
    )

    owners = list(owner_caps(constraints).keys())
    o_caps = owner_caps(constraints)
    s_caps = sprint_caps(constraints)
    weights = constraints.get("objective_weights", {})
    min_core_pct = float(constraints["hard_rules"].get("core_dual_percent_min_per_sprint", 70.0))

    sprint_load = defaultdict(float)
    sprint_core = defaultdict(float)
    sprint_support = defaultdict(float)
    owner_sprint = defaultdict(lambda: defaultdict(float))
    owner_total = defaultdict(float)

    total_effort = sum(t.effort for t in tasks.values())
    total_owner_cap = sum(o_caps.values())
    owner_target_total = {
        o: (total_effort * (o_caps[o] / total_owner_cap)) if total_owner_cap > 0 else 0.0
        for o in owners
    }

    assigned_sprint: dict[str, int] = {}
    assigned_owner: dict[str, str] = {}

    for bk in order:
        task = tasks[bk]
        deps_done = [assigned_sprint[d] for d in deps[bk] if d in assigned_sprint]
        earliest = max(deps_done) if deps_done else 1
        latest = 12
        if task.prioridade == "P0":
            latest = min(latest, SPRINT_INDEX.get(constraints["hard_rules"].get("p0_latest_sprint", "S12"), 12))

        best_choice = None
        best_cost = float("inf")

        for owner in owner_sequence(task, owners):
            fit = owner_fit_score(owner, task)
            for s in range(earliest, latest + 1):
                e = task.effort
                if sprint_load[s] + e > s_caps[s] + 1e-9:
                    continue
                if owner_sprint[owner][s] + e > o_caps.get(owner, 0.0) + 1e-9:
                    continue

                move_pen = priority_move_penalty(task.prioridade, weights) * abs(s - task.preferred_sprint)
                owner_change_pen = float(weights.get("owner_change", 120)) if owner != task.owner_original else 0.0
                load_pen = ((sprint_load[s] + e) / s_caps[s]) * 20.0
                owner_util_pen = ((owner_sprint[owner][s] + e) / o_caps.get(owner, 1.0)) * 15.0
                owner_balance_pen = abs((owner_total[owner] + e) - owner_target_total[owner]) * 4.0
                late_pen = float(weights.get("late_shift", 10)) * max(0, s - task.preferred_sprint)
                fit_pen = (3.0 - fit) * 20.0

                ratio_pen = 0.0
                proj_total = sprint_load[s] + e
                proj_core = sprint_core[s] + (e if task.class_current != "SUPORTE" else 0.0)
                proj_pct = 100.0 * proj_core / proj_total if proj_total > 0 else 100.0
                if proj_pct < min_core_pct:
                    ratio_pen += (min_core_pct - proj_pct) * 8.0

                cost = move_pen + owner_change_pen + load_pen + owner_util_pen + owner_balance_pen + late_pen + fit_pen + ratio_pen

                choice = (cost, owner == task.owner_original, s, owner)
                if cost < best_cost:
                    best_cost = cost
                    best_choice = choice
                elif abs(cost - best_cost) < 1e-9 and best_choice is not None:
                    # Deterministic tie-break: preserve owner, then earlier sprint, then owner name.
                    _, keep_owner_curr, s_curr, owner_curr = best_choice
                    _, keep_owner_new, s_new, owner_new = choice
                    if (keep_owner_new and not keep_owner_curr) or (
                        keep_owner_new == keep_owner_curr and (s_new < s_curr or (s_new == s_curr and owner_new < owner_curr))
                    ):
                        best_choice = choice

        if best_choice is None:
            raise RuntimeError(f"Nao foi possivel agendar BK {bk} sem violar capacidade/dependencias.")

        _, _, chosen_s, chosen_owner = best_choice
        assigned_sprint[bk] = chosen_s
        assigned_owner[bk] = chosen_owner
        task.owner_current = chosen_owner

        e = task.effort
        sprint_load[chosen_s] += e
        owner_sprint[chosen_owner][chosen_s] += e
        owner_total[chosen_owner] += e
        if task.class_current == "SUPORTE":
            sprint_support[chosen_s] += e
        else:
            sprint_core[chosen_s] += e

    return assigned_sprint, assigned_owner


def compute_metrics(tasks: dict[str, Task], assigned_sprint: dict[str, int], assigned_owner: dict[str, str]) -> dict:
    s_load = defaultdict(float)
    s_core = defaultdict(float)
    s_support = defaultdict(float)
    o_load = defaultdict(float)
    o_prio = defaultdict(Counter)

    for bk, task in tasks.items():
        s = assigned_sprint[bk]
        e = task.effort
        s_load[s] += e
        if task.class_current == "SUPORTE":
            s_support[s] += e
        else:
            s_core[s] += e
        owner = assigned_owner[bk]
        o_load[owner] += e
        o_prio[owner][task.prioridade] += 1

    s_ratio = {}
    for s in range(1, 13):
        total = s_load[s]
        core = s_core[s]
        s_ratio[s] = 100.0 if total == 0 else round((core / total) * 100.0, 1)

    return {
        "sprint_load": s_load,
        "sprint_core": s_core,
        "sprint_support": s_support,
        "sprint_ratio": s_ratio,
        "owner_load": o_load,
        "owner_prio": o_prio,
    }


def task_move_rank(task: Task) -> tuple[int, int, int, str]:
    # Rebalance order: P2 -> P1 -> P0 low risk.
    low_risk_domains = {
        "ux_accessibility",
        "compatibility_browser",
        "localization",
        "admin_governance",
        "notifications",
    }
    if task.prioridade == "P2":
        p_rank = 0
    elif task.prioridade == "P1":
        p_rank = 1
    elif task.prioridade == "P0" and task.domain in low_risk_domains:
        p_rank = 2
    else:
        p_rank = 3
    # Move heavier items first when trying to reduce overload/ratio.
    effort_rank = {"L": 0, "M": 1, "S": 2}.get(task.esforco, 2)
    return (p_rank, effort_rank, task.preferred_sprint, task.bk_id)


def move_window_bounds(bk_id: str, deps: dict[str, list[str]], children: dict[str, list[str]], assigned_sprint: dict[str, int]) -> tuple[int, int]:
    dep_s = [assigned_sprint[d] for d in deps[bk_id] if d in assigned_sprint]
    child_s = [assigned_sprint[c] for c in children[bk_id] if c in assigned_sprint]
    earliest = max(dep_s) if dep_s else 1
    latest = min(child_s) if child_s else 12
    return earliest, latest


def repair_core_ratio_with_reclass(
    tasks: dict[str, Task],
    assigned_sprint: dict[str, int],
    assigned_owner: dict[str, str],
    constraints: dict,
    reasons: dict[str, str],
) -> None:
    min_core_pct = float(constraints["hard_rules"].get("core_dual_percent_min_per_sprint", 70.0))
    s_caps = sprint_caps(constraints)
    o_caps = owner_caps(constraints)
    deps, children = build_graph(tasks)
    eligible = set(constraints["reclassification"].get("eligible_domains", []))
    ineligible = set(constraints["reclassification"].get("ineligible_domains", []))
    target_class = constraints["reclassification"].get("target_class", "CORE-HIBRIDO")

    impact = {
        "security_hardening": 5,
        "reliability_ops": 5,
        "performance_scalability": 5,
        "quality_architecture": 4,
        "ux_accessibility": 4,
        "compatibility_browser": 3,
        "localization": 3,
    }
    prio_rank = {"P0": 3, "P1": 2, "P2": 1}
    effort_rank = {"M": 3, "L": 2, "S": 1}

    while True:
        metrics = compute_metrics(tasks, assigned_sprint, assigned_owner)
        bad = [s for s in range(1, 13) if metrics["sprint_load"][s] > 0 and metrics["sprint_ratio"][s] < min_core_pct]
        if not bad:
            break

        sprint = bad[0]
        moved = False

        # 1) Move support out of a bad sprint first (P2 -> P1 -> P0 low risk).
        support_in_bad = [
            bk
            for bk, task in tasks.items()
            if assigned_sprint[bk] == sprint and task.class_current == "SUPORTE"
        ]
        support_in_bad.sort(key=lambda bk: task_move_rank(tasks[bk]))
        for bk in support_in_bad:
            task = tasks[bk]
            owner = assigned_owner[bk]
            e = task.effort
            earliest, latest = move_window_bounds(bk, deps, children, assigned_sprint)
            destinations = [s for s in range(earliest, latest + 1) if s != sprint]
            # Prefer nearby sprints with better core ratio.
            destinations.sort(key=lambda s: (abs(s - task.preferred_sprint), -metrics["sprint_ratio"][s], s))
            for dst in destinations:
                if metrics["sprint_load"][dst] + e > s_caps[dst] + 1e-9:
                    continue
                owner_dst = 0.0
                for x, ox in assigned_owner.items():
                    if ox == owner and assigned_sprint[x] == dst:
                        owner_dst += tasks[x].effort
                if owner_dst + e > o_caps.get(owner, 0.0) + 1e-9:
                    continue

                # Simulate source/destination ratio after move.
                src_total = metrics["sprint_load"][sprint] - e
                src_core = metrics["sprint_core"][sprint]
                src_ratio = 100.0 if src_total <= 0 else (src_core / src_total) * 100.0
                dst_total = metrics["sprint_load"][dst] + e
                dst_core = metrics["sprint_core"][dst]
                dst_ratio = 100.0 if dst_total <= 0 else (dst_core / dst_total) * 100.0
                if dst_total > 0 and dst_ratio + 1e-9 < min_core_pct:
                    continue
                if src_total > 0 and src_ratio + 1e-9 < min_core_pct and dst_ratio >= src_ratio:
                    # No meaningful recovery on the bad sprint.
                    continue

                assigned_sprint[bk] = dst
                moved = True
                break
            if moved:
                break
        if moved:
            continue

        # 2) Move core into bad sprint when feasible.
        core_candidates = [
            bk
            for bk, task in tasks.items()
            if assigned_sprint[bk] != sprint and task.class_current != "SUPORTE"
        ]
        core_candidates.sort(
            key=lambda bk: (
                abs(assigned_sprint[bk] - sprint),
                {"P0": 0, "P1": 1, "P2": 2}.get(tasks[bk].prioridade, 9),
                bk,
            )
        )
        for bk in core_candidates:
            task = tasks[bk]
            src = assigned_sprint[bk]
            owner = assigned_owner[bk]
            e = task.effort
            earliest, latest = move_window_bounds(bk, deps, children, assigned_sprint)
            if sprint < earliest or sprint > latest:
                continue
            if metrics["sprint_load"][sprint] + e > s_caps[sprint] + 1e-9:
                continue

            owner_dst = 0.0
            for x, ox in assigned_owner.items():
                if ox == owner and assigned_sprint[x] == sprint:
                    owner_dst += tasks[x].effort
            if owner_dst + e > o_caps.get(owner, 0.0) + 1e-9:
                continue

            src_total = metrics["sprint_load"][src] - e
            src_core = metrics["sprint_core"][src] - e
            src_ratio = 100.0 if src_total <= 0 else (src_core / src_total) * 100.0
            if src_total > 0 and src_ratio + 1e-9 < min_core_pct:
                continue

            dst_total = metrics["sprint_load"][sprint] + e
            dst_core = metrics["sprint_core"][sprint] + e
            dst_ratio = 100.0 if dst_total <= 0 else (dst_core / dst_total) * 100.0
            if dst_total > 0 and dst_ratio + 1e-9 < min_core_pct:
                continue

            assigned_sprint[bk] = sprint
            moved = True
            break
        if moved:
            continue

        # 3) Minimal reclassification only if moving is not enough.
        candidates = []
        for bk, task in tasks.items():
            if assigned_sprint[bk] != sprint:
                continue
            if task.class_current != "SUPORTE":
                continue
            if task.domain in ineligible:
                continue
            if task.domain not in eligible:
                continue
            candidates.append(
                (
                    -impact.get(task.domain, 1),
                    -prio_rank.get(task.prioridade, 1),
                    -effort_rank.get(task.esforco, 1),
                    bk,
                )
            )

        if not candidates:
            raise RuntimeError(
                f"Sprint {SPRINTS[sprint-1]} continua abaixo de {min_core_pct}% e nao ha candidatos elegiveis para reclassificacao minima."
            )

        candidates.sort()
        chosen_bk = candidates[0][3]
        tasks[chosen_bk].class_current = target_class
        reasons.setdefault(chosen_bk, "repair_sprint_core_ratio")


def validate_solution(tasks: dict[str, Task], assigned_sprint: dict[str, int], assigned_owner: dict[str, str], constraints: dict) -> list[str]:
    errors: list[str] = []
    s_caps = sprint_caps(constraints)
    o_caps = owner_caps(constraints)
    min_core_pct = float(constraints["hard_rules"].get("core_dual_percent_min_per_sprint", 70.0))

    deps, _ = build_graph(tasks)
    for bk, dep_list in deps.items():
        for dep in dep_list:
            if assigned_sprint[dep] > assigned_sprint[bk]:
                errors.append(f"dependency_violation:{dep}->{bk}")

    metrics = compute_metrics(tasks, assigned_sprint, assigned_owner)

    for s in range(1, 13):
        if metrics["sprint_load"][s] > s_caps[s] + 1e-9:
            errors.append(f"sprint_capacity_violation:{SPRINTS[s-1]}")
        if metrics["sprint_load"][s] > 0 and metrics["sprint_ratio"][s] + 1e-9 < min_core_pct:
            errors.append(f"core_dual_below_min:{SPRINTS[s-1]}={metrics['sprint_ratio'][s]}")

    owner_week = defaultdict(lambda: defaultdict(float))
    for bk, owner in assigned_owner.items():
        s = assigned_sprint[bk]
        owner_week[owner][s] += tasks[bk].effort
    for owner, loads in owner_week.items():
        cap = o_caps.get(owner, 0.0)
        for s in range(1, 13):
            if loads[s] > cap + 1e-9:
                errors.append(f"owner_capacity_violation:{owner}:{SPRINTS[s-1]}")

    # Pedagogical guardrails.
    owner_total = metrics["owner_load"]
    if not (
        owner_total.get("Natalia", 0.0)
        > owner_total.get("Guilherme", 0.0)
        > owner_total.get("Kaua", 0.0)
        > owner_total.get("Daniel", 0.0)
    ):
        errors.append("owner_total_order_violation")

    p0_by_owner = metrics["owner_prio"]
    nat_p0 = p0_by_owner.get("Natalia", Counter()).get("P0", 0)
    max_other_p0 = max(
        p0_by_owner.get("Guilherme", Counter()).get("P0", 0),
        p0_by_owner.get("Kaua", Counter()).get("P0", 0),
        p0_by_owner.get("Daniel", Counter()).get("P0", 0),
    )
    if nat_p0 < max_other_p0:
        errors.append("p0_distribution_violation")

    return errors


def run_solver(plan_root: Path, constraints_path: Path, backlog_path: Path, core_dual_path: Path, out_path: Path) -> dict:
    constraints = json.loads(constraints_path.read_text(encoding="utf-8"))
    rows = parse_backlog_rows(backlog_path)
    class_map = parse_core_dual_annex(core_dual_path)
    tasks = load_tasks(rows, class_map)

    reclass_reasons = apply_min_viability_reclass(tasks, constraints)
    assigned_sprint, assigned_owner = plan_assignments(tasks, constraints)
    repair_core_ratio_with_reclass(tasks, assigned_sprint, assigned_owner, constraints, reclass_reasons)

    errors = validate_solution(tasks, assigned_sprint, assigned_owner, constraints)
    if errors:
        raise RuntimeError("Solver produziu solucao invalida: " + ", ".join(errors[:10]))

    metrics = compute_metrics(tasks, assigned_sprint, assigned_owner)

    assignments = []
    for bk in sorted(tasks.keys(), key=lambda x: (int(x.split("-")[1][2:]), int(x.split("-")[2]))):
        t = tasks[bk]
        sprint_new = SPRINTS[assigned_sprint[bk] - 1]
        owner_new = assigned_owner[bk]
        assignments.append(
            {
                "bk_id": bk,
                "owner": owner_new,
                "sprint": sprint_new,
                "classe_core_dual": t.class_current,
                "owner_changed": owner_new != t.owner_original,
                "sprint_changed": sprint_new != t.sprint_original,
                "class_changed": t.class_current != t.class_original,
                "reclass_reason": reclass_reasons.get(bk, ""),
            }
        )

    per_sprint = []
    s_caps = sprint_caps(constraints)
    for s in range(1, 13):
        tag = SPRINTS[s - 1]
        per_sprint.append(
            {
                "sprint": tag,
                "capacity_u": s_caps[s],
                "load_u": round(metrics["sprint_load"][s], 2),
                "core_u": round(metrics["sprint_core"][s], 2),
                "support_u": round(metrics["sprint_support"][s], 2),
                "core_dual_percent": round(metrics["sprint_ratio"][s], 1),
            }
        )

    per_owner = []
    o_caps = owner_caps(constraints)
    for owner in o_caps:
        per_owner.append(
            {
                "owner": owner,
                "capacity_weekly_u": o_caps[owner],
                "total_effort_u": round(metrics["owner_load"].get(owner, 0.0), 2),
                "p0": int(metrics["owner_prio"].get(owner, Counter()).get("P0", 0)),
                "p1": int(metrics["owner_prio"].get(owner, Counter()).get("P1", 0)),
                "p2": int(metrics["owner_prio"].get(owner, Counter()).get("P2", 0)),
            }
        )

    total, core, support = global_core_effort(tasks)
    output = {
        "generated_at": TODAY,
        "project": "studyflow",
        "constraints_file": str(constraints_path.relative_to(plan_root)),
        "status": "feasible",
        "summary": {
            "total_bk": len(tasks),
            "total_effort_u": total,
            "core_effort_u": core,
            "support_effort_u": support,
            "global_core_dual_percent": round((core / total) * 100.0, 1) if total else 100.0,
            "reclassified_count": sum(1 for t in tasks.values() if t.class_current != t.class_original),
            "owner_changes": sum(1 for a in assignments if a["owner_changed"]),
            "sprint_changes": sum(1 for a in assignments if a["sprint_changed"]),
        },
        "assignments": assignments,
        "per_sprint": per_sprint,
        "per_owner": per_owner,
    }

    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description="Solver deterministico de replaneamento StudyFlow")
    parser.add_argument(
        "--constraints",
        default="plan_constraints_studyflow.json",
        help="Path para contrato de constraints (default: plan_constraints_studyflow.json)",
    )
    parser.add_argument(
        "--backlog",
        default="../backlogs/BACKLOG-MVP.md",
        help="Path para backlog canonico (default: ../backlogs/BACKLOG-MVP.md)",
    )
    parser.add_argument(
        "--core-dual",
        default="../backlogs/ANEXO-CORE-DUAL-BK.md",
        help="Path para anexo core dual (default: ../backlogs/ANEXO-CORE-DUAL-BK.md)",
    )
    parser.add_argument(
        "--out",
        default="solver_reassignments.json",
        help="Path de output do solver (default: solver_reassignments.json)",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    plan_root = script_dir.parent

    constraints_path = (script_dir / args.constraints).resolve()
    backlog_path = (script_dir / args.backlog).resolve()
    core_dual_path = (script_dir / args.core_dual).resolve()
    out_path = (script_dir / args.out).resolve()

    data = run_solver(plan_root, constraints_path, backlog_path, core_dual_path, out_path)
    print(json.dumps(data, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
