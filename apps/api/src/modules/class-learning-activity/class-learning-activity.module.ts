/** Regista a fonte canónica de atividade pedagógica por turma. */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
    ClassMembership,
    ClassMembershipSchema,
} from "../classes/schemas/class-membership.schema.js";
import { ClassLearningActivityService } from "./class-learning-activity.service.js";
import {
    ClassLearningActivity,
    ClassLearningActivitySchema,
} from "./schemas/class-learning-activity.schema.js";
import {
    StudentClassActivityState,
    StudentClassActivityStateSchema,
} from "./schemas/student-class-activity-state.schema.js";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ClassLearningActivity.name, schema: ClassLearningActivitySchema },
            {
                name: StudentClassActivityState.name,
                schema: StudentClassActivityStateSchema,
            },
            { name: ClassMembership.name, schema: ClassMembershipSchema },
        ]),
    ],
    providers: [ClassLearningActivityService],
    exports: [ClassLearningActivityService],
})
export class ClassLearningActivityModule {}
