import { StudentClassSummary } from "../../classes/classes.service.js";

/**
 * Estado inicial do modo individual de estudo.
 */
export type SoloStudyStateDto = {
    studentName: string;
    hasOfficialClasses: boolean;
    officialClasses: StudentClassSummary[];
    studyAreasCount: number;
    routinesCount: number;
    materialsCount: number;
};
