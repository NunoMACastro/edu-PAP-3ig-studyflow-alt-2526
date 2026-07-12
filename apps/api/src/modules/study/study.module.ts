/**
 * Regista providers, controllers e schemas necessários ao módulo de study.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { StudentsModule } from "../students/students.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { HistoryModule } from "./history.module.js";
import { RoutinesController } from "./routines.controller.js";
import { RoutinesService } from "./routines.service.js";
import { SoloStudyController } from "./solo-study.controller.js";
import { SoloStudyService } from "./solo-study.service.js";
import { StudyGoal, StudyGoalSchema } from "./schemas/study-goal.schema.js";
import {
    StudyRoutine,
    StudyRoutineSchema,
} from "./schemas/study-routine.schema.js";

/**
 * Módulo do estudo individual da MF0.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        StudentsModule,
        StudyAreasModule,
        MaterialsModule,
        HistoryModule,
        MongooseModule.forFeature([
            { name: StudyRoutine.name, schema: StudyRoutineSchema },
            { name: StudyGoal.name, schema: StudyGoalSchema },
        ]),
    ],
    controllers: [SoloStudyController, RoutinesController],
    providers: [SoloStudyService, RoutinesService],
    exports: [SoloStudyService, RoutinesService],
})
export class StudyModule {}
