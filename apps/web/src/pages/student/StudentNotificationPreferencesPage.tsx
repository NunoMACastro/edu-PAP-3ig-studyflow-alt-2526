import { PageHeader } from "../../components/PageHeader.js";
import { NotificationPreferencesPanel } from "../../features/notification-preferences/notification-preferences-panel.js";

export function StudentNotificationPreferencesPage() {
    return <section className="max-w-4xl space-y-6"><PageHeader title="Preferências de notificações" description="Escolhe que atualizações queres receber na aplicação." /><NotificationPreferencesPanel /></section>;
}
