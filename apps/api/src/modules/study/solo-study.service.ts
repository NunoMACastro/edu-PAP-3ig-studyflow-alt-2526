/**
 * Implementa as regras de negócio de study e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { ClassesService } from "../classes/classes.service.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudentProfileService } from "../students/student-profile.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { SoloStudyStateDto } from "./dto/solo-study-state.dto.js";
import { RoutinesService } from "./routines.service.js";

/**
 * Serviço do modo individual de estudo.
 *
 * RF04 fica garantido porque este estado não exige turma nem dados docentes.
 */
@Injectable()
export class SoloStudyService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param profileService Service injetado para reutilizar regras de profile sem duplicar validações.
     * @param routinesService Service injetado para reutilizar regras de routines sem duplicar validações.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param classesService Service que fornece as memberships oficiais do aluno.
     */
    constructor(
        private readonly profileService: StudentProfileService,
        private readonly routinesService: RoutinesService,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        private readonly classesService: ClassesService,
    ) {}

    /**
     * Constrói o estado base do dashboard individual.
     *
     * @param userId Identificador do aluno autenticado.
     * @returns Estado seguro para alunos com ou sem turma.
     */
    async getSoloStudyState(userId: string): Promise<SoloStudyStateDto> {
        const [
            profile,
            routinesCount,
            studyAreasCount,
            materialsCount,
            officialClasses,
        ] =
            await Promise.all([
            this.profileService.getMyProfile(userId),
            this.routinesService.countRoutines(userId),
            this.studyAreasService.countMyStudyAreas(userId),
            this.materialsService.countMine(userId),
            this.classesService.listStudentClassesById(userId),
        ]);

        return {
            studentName: profile?.name ?? "Aluno",
            hasOfficialClasses: officialClasses.length > 0,
            officialClasses,
            studyAreasCount,
            routinesCount,
            materialsCount,
        };
    }
}
