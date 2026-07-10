/**
 * Expõe o registry central de dados pessoais a exportação e account deletion.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialsModule } from "../materials/materials.module.js";
import { PersonalDataRegistryService } from "./personal-data-registry.service.js";
import {
    PersonalDataRetention,
    PersonalDataRetentionSchema,
} from "./schemas/personal-data-retention.schema.js";

@Module({
    imports: [
        MaterialsModule,
        MongooseModule.forFeature([
            {
                name: PersonalDataRetention.name,
                schema: PersonalDataRetentionSchema,
            },
        ]),
    ],
    providers: [PersonalDataRegistryService],
    exports: [PersonalDataRegistryService],
})
export class PersonalDataModule {}
