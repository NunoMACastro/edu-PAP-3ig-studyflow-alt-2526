/**
 * Regista providers, controllers e schemas necessários ao módulo de subjects.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { Subject, SubjectSchema } from "./schemas/subject.schema.js";
import { SubjectsController } from "./subjects.controller.js";
import { SubjectsService } from "./subjects.service.js";

/**
 * Módulo de disciplinas oficiais.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
    ],
    controllers: [SubjectsController],
    providers: [SubjectsService],
    exports: [SubjectsService],
})
export class SubjectsModule {}
