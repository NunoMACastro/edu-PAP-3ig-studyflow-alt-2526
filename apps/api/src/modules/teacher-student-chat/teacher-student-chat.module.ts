/**
 * Regista providers, controller, gateway e schemas do chat professor-aluno.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountLifecycleModule } from "../../common/account-lifecycle/account-lifecycle.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { ClassLearningActivityModule } from "../class-learning-activity/class-learning-activity.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { StudentSubjectChatReadState, StudentSubjectChatReadStateSchema } from "./schemas/student-subject-chat-read-state.schema.js";
import {
    TeacherStudentChatMessage,
    TeacherStudentChatMessageSchema,
} from "./schemas/teacher-student-chat-message.schema.js";
import {
    TeacherStudentChatThread,
    TeacherStudentChatThreadSchema,
} from "./schemas/teacher-student-chat-thread.schema.js";
import { TeacherStudentChatController } from "./teacher-student-chat.controller.js";
import { TeacherStudentChatGateway } from "./teacher-student-chat.gateway.js";
import { TeacherStudentChatService } from "./teacher-student-chat.service.js";

/**
 * Módulo isolado para o chat em tempo real entre professor e alunos por disciplina.
 */
@Module({
    imports: [
        AccountLifecycleModule,
        AuthModule,
        ClassLearningActivityModule,
        SubjectsModule,
        ClassesModule,
        MongooseModule.forFeature([
            {
                name: TeacherStudentChatThread.name,
                schema: TeacherStudentChatThreadSchema,
            },
            {
                name: TeacherStudentChatMessage.name,
                schema: TeacherStudentChatMessageSchema,
            },
            {
                name: StudentSubjectChatReadState.name,
                schema: StudentSubjectChatReadStateSchema,
            },
        ]),
    ],
    controllers: [TeacherStudentChatController],
    providers: [TeacherStudentChatService, TeacherStudentChatGateway],
    exports: [TeacherStudentChatService],
})
export class TeacherStudentChatModule {}
