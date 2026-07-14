/** Módulo agregador da experiência inicial do aluno. */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AiContentReviewsModule } from "../ai-content-reviews/ai-content-reviews.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { ClassProjectsModule } from "../class-projects/class-projects.module.js";
import { ClassProject, ClassProjectSchema } from "../class-projects/schemas/class-project.schema.js";
import { StudentClassProjectState, StudentClassProjectStateSchema } from "../class-projects/schemas/student-class-project-state.schema.js";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module.js";
import { GuidedStudyRoom, GuidedStudyRoomSchema } from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import { OfficialTestAttempt, OfficialTestAttemptSchema } from "../official-tests/schemas/official-test-attempt.schema.js";
import { OfficialTest, OfficialTestSchema } from "../official-tests/schemas/official-test.schema.js";
import { OfficialTestsModule } from "../official-tests/official-tests.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import { UnifiedSearchModule } from "../unified-search/unified-search.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { StudyGroupSessionsModule } from "../study-group-sessions/study-group-sessions.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import { StudyModule } from "../study/study.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { TeacherStudentChatModule } from "../teacher-student-chat/teacher-student-chat.module.js";
import { StudentExperienceController } from "./student-experience.controller.js";
import { StudentExperienceService } from "./student-experience.service.js";
import { StudentRecentContext, StudentRecentContextSchema } from "./schemas/student-recent-context.schema.js";

@Module({
    imports: [
        AuthModule,
        AiContentReviewsModule,
        ClassesModule,
        SubjectsModule,
        TeacherStudentChatModule,
        StudyModule,
        StudyAreasModule,
        StudyRoomsModule,
        StudyGroupsModule,
        StudyGroupSessionsModule,
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        OfficialTestsModule,
        OfficialMaterialsModule,
        MaterialIndexModule,
        UnifiedSearchModule,
        MongooseModule.forFeature([
            { name: StudentRecentContext.name, schema: StudentRecentContextSchema },
            { name: OfficialTest.name, schema: OfficialTestSchema },
            { name: OfficialTestAttempt.name, schema: OfficialTestAttemptSchema },
            { name: ClassProject.name, schema: ClassProjectSchema },
            { name: StudentClassProjectState.name, schema: StudentClassProjectStateSchema },
            { name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema },
        ]),
    ],
    controllers: [StudentExperienceController],
    providers: [StudentExperienceService],
    exports: [StudentExperienceService],
})
export class StudentExperienceModule {}
