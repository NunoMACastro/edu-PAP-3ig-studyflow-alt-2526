/**
 * Estado inicial do modo individual de estudo.
 */
export type SoloStudyStateDto = {
    studentName: string;
    hasClass: boolean;
    className: string | null;
    studyAreasCount: number;
    routinesCount: number;
    materialsCount: number;
};
