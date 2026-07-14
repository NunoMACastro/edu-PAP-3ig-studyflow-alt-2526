/** Plano único com tabs de agenda, objetivos e histórico. */
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader.js";
import { WorkspaceTabs } from "../../components/student/StudentWorkspace.js";
import { RoutinesPage } from "./RoutinesPage.js";
import { StudyHistoryPage } from "./StudyHistoryPage.js";

type PlanTab = "agenda" | "objetivos" | "historico";

export function StudentPlanPage() {
    const [params] = useSearchParams();
    const raw = params.get("tab");
    const tab: PlanTab = raw === "objetivos" || raw === "historico" ? raw : "agenda";
    return <section className="space-y-6"><PageHeader title="Plano" description="Organiza quando estudas, acompanha objetivos e consulta o que já fizeste." /><WorkspaceTabs items={[{ label: "Agenda", href: "/app/plano?tab=agenda", active: tab === "agenda" }, { label: "Objetivos", href: "/app/plano?tab=objetivos", active: tab === "objetivos" }, { label: "Histórico", href: "/app/plano?tab=historico", active: tab === "historico" }]} />{tab === "agenda" ? <RoutinesPage embedded section="agenda" /> : null}{tab === "objetivos" ? <RoutinesPage embedded section="goals" /> : null}{tab === "historico" ? <StudyHistoryPage embedded /> : null}</section>;
}
