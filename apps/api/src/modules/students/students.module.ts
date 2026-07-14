/**
 * Regista providers, controllers e schemas necessários ao módulo de students.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { StudentProfileController } from "./student-profile.controller.js";
import { StudentProfileService } from "./student-profile.service.js";
import {
    StudentProfile,
    StudentProfileSchema,
} from "./schemas/student-profile.schema.js";

/**
 * Módulo do domínio aluno.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: StudentProfile.name, schema: StudentProfileSchema },
        ]),
    ],
    controllers: [StudentProfileController],
    providers: [StudentProfileService],
    exports: [StudentProfileService],
})
export class StudentsModule {}
