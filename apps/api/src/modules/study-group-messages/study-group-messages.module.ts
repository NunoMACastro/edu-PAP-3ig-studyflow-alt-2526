/**
 * Regista providers, controllers e schemas necessários ao módulo de mensagens de grupos de estudo.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AccountLifecycleModule } from "../../common/account-lifecycle/account-lifecycle.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import { StudentsModule } from "../students/students.module.js";
import {
    StudyGroupMessage,
    StudyGroupMessageSchema,
} from "./schemas/study-group-message.schema.js";
import { StudyGroupMessagesController } from "./study-group-messages.controller.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";
import { StudyGroupChatGateway } from "./study-group-chat.gateway.js";
import { StudentStudyGroupChatController } from "./student-study-group-chat.controller.js";
import {
    StudentStudyGroupChatReadState,
    StudentStudyGroupChatReadStateSchema,
} from "./schemas/student-study-group-chat-read-state.schema.js";
import { StudyRoomMessagesController } from "./study-room-messages.controller.js";
import { StudentStudyRoomChatController } from "./student-study-room-chat.controller.js";
import { StudyRoomChatGateway } from "./study-room-chat.gateway.js";

/**
 * Módulo MF3 para chat e notas coletivas.
 */
@Module({
    imports: [
        AccountLifecycleModule,
        AuthModule,
        StudyGroupsModule,
        StudyRoomsModule,
        StudentsModule,
        MongooseModule.forFeature([
            { name: StudyGroupMessage.name, schema: StudyGroupMessageSchema },
            {
                name: StudentStudyGroupChatReadState.name,
                schema: StudentStudyGroupChatReadStateSchema,
            },
        ]),
    ],
    controllers: [
        StudyGroupMessagesController,
        StudentStudyGroupChatController,
        StudyRoomMessagesController,
        StudentStudyRoomChatController,
    ],
    providers: [
        StudyGroupMessagesService,
        StudyGroupChatGateway,
        StudyRoomChatGateway,
    ],
    exports: [StudyGroupMessagesService],
})
export class StudyGroupMessagesModule {}
