/**
 * Implementa a funcionalidade frontend de alertas de estudo e o respetivo contrato com a API.
 */
import { NotificationContext } from "../notification-preferences/update-notification-preferences.js";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de alertas de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyAlert = {
    key: string;
    context: NotificationContext;
    title: string;
    body: string;
    dueAt?: string;
    sourceId: string;
};

/**
 * Carrega alertas internos de estudo.
 *
 * @param onlyUpcoming Filtra alertas futuros.
 * @returns Alertas visíveis.
 */
export function loadStudyAlerts(onlyUpcoming = true): Promise<StudyAlert[]> {
    return requestMf3Json<StudyAlert[]>(
        `/api/study-alerts?onlyUpcoming=${String(onlyUpcoming)}`,
    );
}
