/**
 * Implementa a funcionalidade frontend de navegação curricular e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Resposta tipada de navegação curricular devolvida pela API ou por um helper frontend.
 */
export type CurriculumNavigationResponse = {
    topics: {
        title: string;
        materialId: string;
        sections: { title: string; locator: string; excerpt: string }[];
    }[];
};

/**
 * Carrega tópicos curriculares a partir de jobs autorizados.
 *
 * @param input Jobs indexados.
 * @returns Tópicos e secções.
 */
export function loadCurriculumNavigation(input: {
    jobIds: string[];
}): Promise<CurriculumNavigationResponse> {
    return requestMf3Json<CurriculumNavigationResponse>(
        "/api/curriculum/navigation",
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
