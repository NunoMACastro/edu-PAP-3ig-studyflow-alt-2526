// apps/api/src/scripts/export-technical-map.spec.ts
import {
    TECHNICAL_MAP,
    assertRequiredModules,
    buildTechnicalMapMarkdown,
    extractImportedModules,
} from "./export-technical-map.js";

const APP_MODULE_SOURCE = `
import { AuthModule } from "./modules/auth/auth.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module.js";
import { SourceGroundedAiModule } from "./modules/source-grounded-ai/source-grounded-ai.module.js";
import { ClassAiModule } from "./modules/class-ai/class-ai.module.js";
import { AiModelPoliciesModule } from "./modules/ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "./modules/ai-quotas/ai-quotas.module.js";
import { AuditLogModule } from "./modules/audit-log/audit-log.module.js";
`;

describe("exportTechnicalMap", () => {
    it("gera mapa técnico com módulos e endpoints críticos", () => {
        const importedModules = extractImportedModules(APP_MODULE_SOURCE);

        assertRequiredModules(importedModules);
        const markdown = buildTechnicalMapMarkdown(TECHNICAL_MAP);

        // O teste valida conteúdo operacional, não apenas a existência da função.
        expect(markdown).toContain("AuthModule");
        expect(markdown).toContain("POST");
        expect(markdown).toContain("/api/student/subjects/:subjectId/ai/answers");
        expect(markdown).toContain("Membership da disciplina");
    });

    it("falha quando falta um módulo crítico no AppModule", () => {
        const importedModules = extractImportedModules(`
            import { AuthModule } from "./modules/auth/auth.module.js";
            import { MaterialsModule } from "./modules/materials/materials.module.js";
        `);

        // Este negativo impede que a documentação ignore a IA com fontes.
        expect(() => assertRequiredModules(importedModules)).toThrow(
            "Módulos críticos ausentes no AppModule",
        );
    });

    it("falha quando um endpoint crítico não declara regra de segurança", () => {
        const unsafeMap = {
            ...TECHNICAL_MAP,
            endpoints: [
                {
                    method: "POST",
                    path: "/api/study-areas/:studyAreaId/materials",
                    input: "material privado do aluno",
                    output: "material criado",
                    securityRule: "",
                },
            ],
        };

        // Cada endpoint crítico tem de explicar ownership, membership, role ou exposição mínima.
        expect(() => buildTechnicalMapMarkdown(unsafeMap)).toThrow(
            "não declara regra de segurança",
        );
    });
});