/**
 * Regista providers, controllers e schemas necessários ao módulo de classes.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { ClassesController } from "./classes.controller.js";
import { ClassesService } from "./classes.service.js";
import { SchoolClass, SchoolClassSchema } from "./schemas/school-class.schema.js";

/**
 * Módulo de turmas oficiais da MF1.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: SchoolClass.name, schema: SchoolClassSchema },
        ]),
    ],
    controllers: [ClassesController],
    providers: [ClassesService],
    exports: [ClassesService],
})
export class ClassesModule {}
