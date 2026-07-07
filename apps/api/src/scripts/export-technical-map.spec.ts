import {
    assertRequiredModules,
    buildTechnicalMapMarkdown,
    exportTechnicalMap,
    extractImportedModules,
    REQUIRED_MODULES,
    TECHNICAL_MAP,
} from "./export-technical-map.js";

describe("exportTechnicalMap", () => {
    it("exporta mapa tecnico com modulos, endpoints, modelos, fluxos e validacao", async () => {
        const markdown = await exportTechnicalMap();

        expect(markdown).toContain("# StudyFlow - mapa tecnico minimo");
        expect(markdown).toContain("## Modulos backend criticos");
        expect(markdown).toContain("## Rotas frontend criticas");
        expect(markdown).toContain("## Endpoints criticos");
        expect(markdown).toContain("## Modelos principais");
        expect(markdown).toContain("## Fluxos criticos");
        expect(markdown).toContain("## Como validar");
        expect(markdown).toContain("`SourceGroundedAiModule`");
        expect(markdown).toContain("`StudyRoomsModule`");
        expect(markdown).toContain("`StudentsModule`");
        expect(markdown).toContain("`/api/ai/source-grounded-answers`");
        expect(markdown).toContain("`/api/study-rooms/:roomId/ai/answers`");
        expect(markdown).toContain("`StudentProfile`");
        expect(markdown).toContain("IA da sala adaptada ao ano escolar");
        expect(markdown).not.toMatch(/password\s*[:=]|token\s*[:=]|cookie\s*[:=]/i);
    });

    it("extrai imports nomeados do AppModule sem depender de NestJS runtime", () => {
        const imported = extractImportedModules(`
            import { AuthModule } from "./modules/auth/auth.module.js";
            import { SourceGroundedAiModule } from "./modules/source-grounded-ai/source-grounded-ai.module.js";
            import { AuthModule } from "./modules/auth/auth.module.js";
        `);

        expect(imported).toEqual(["AuthModule", "SourceGroundedAiModule"]);
    });

    it("bloqueia mapa quando falta modulo critico no AppModule", () => {
        expect(() => assertRequiredModules(["AuthModule"], REQUIRED_MODULES)).toThrow(
            "Modulos criticos ausentes no AppModule",
        );
    });

    it("bloqueia endpoint critico sem regra de seguranca", () => {
        expect(() =>
            buildTechnicalMapMarkdown({
                ...TECHNICAL_MAP,
                endpoints: [
                    {
                        ...TECHNICAL_MAP.endpoints[0],
                        securityRule: "",
                    },
                ],
            }),
        ).toThrow("nao declara regra de seguranca");
    });
});
