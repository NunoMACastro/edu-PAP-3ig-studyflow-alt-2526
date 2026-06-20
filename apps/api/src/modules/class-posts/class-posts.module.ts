/**
 * Regista providers, controllers e schemas necessários ao módulo de turma posts.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { ClassPostsController } from "./class-posts.controller.js";
import { ClassPostsService } from "./class-posts.service.js";
import { ClassPost, ClassPostSchema } from "./schemas/class-post.schema.js";

/**
 * Módulo de avisos e publicações oficiais.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        MongooseModule.forFeature([
            { name: ClassPost.name, schema: ClassPostSchema },
        ]),
    ],
    controllers: [ClassPostsController],
    providers: [ClassPostsService],
    exports: [ClassPostsService],
})
export class ClassPostsModule {}
