/**
 * Regista providers, controllers e schemas necessários ao módulo de turma projects.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { ContextNotificationsModule } from "../context-notifications/context-notifications.module.js";
import { ClassProjectsController } from "./class-projects.controller.js";
import { ClassProjectsService } from "./class-projects.service.js";
import { ClassProject, ClassProjectSchema } from "./schemas/class-project.schema.js";

/**
 * Módulo de projectos oficiais da turma.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        SubjectsModule,
        ContextNotificationsModule,
        MongooseModule.forFeature([
            { name: ClassProject.name, schema: ClassProjectSchema },
        ]),
    ],
    controllers: [ClassProjectsController],
    providers: [ClassProjectsService],
    exports: [ClassProjectsService],
})
export class ClassProjectsModule {}
