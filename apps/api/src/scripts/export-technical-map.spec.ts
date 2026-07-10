import {
    assertTechnicalMapContent,
    assertRequiredModules,
    buildTechnicalMapMarkdown,
    collectReachableModules,
    exportTechnicalMap,
    extractImportedModules,
    REQUIRED_INTERFACE_GROUPS,
    REQUIRED_MODULES,
    TECHNICAL_MAP,
} from "./export-technical-map.js";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("exportTechnicalMap", () => {
    it("exporta mapa tecnico com modulos, endpoints, modelos, fluxos e validacao", async () => {
        const markdown = await exportTechnicalMap();

        expect(markdown).toContain("# StudyFlow - mapa tecnico canonico");
        expect(markdown).toContain("## Modulos backend criticos");
        expect(markdown).toContain("## Rotas frontend criticas");
        expect(markdown).toContain("## Endpoints criticos");
        expect(markdown).toContain("## Modelos principais");
        expect(markdown).toContain("## Fluxos criticos");
        expect(markdown).toContain("## Controlos operacionais e limites de escopo");
        expect(markdown).toContain("## Como validar");
        expect(markdown).toContain("`SourceGroundedAiModule`");
        expect(markdown).toContain("`StudyRoomsModule`");
        expect(markdown).toContain("`StudentsModule`");
        expect(markdown).toContain("`/api/ai/source-grounded-answers`");
        expect(markdown).toContain("`/api/study-rooms/:roomId/ai/answers`");
        expect(markdown).toContain("`StudentProfile`");
        expect(markdown).toContain("IA da sala adaptada ao ano escolar");
        expect(markdown).toContain("SESSION_REVOKED");
        expect(markdown).toContain("latestByMaterial=true");
        expect(markdown).toContain("BEST_ATTEMPT");
        expect(markdown).toContain("PAP_LOCAL_ENDURECIDA");
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

    it("deriva todos os modulos obrigatorios da unica fonte tipada", () => {
        expect(REQUIRED_MODULES).toEqual(
            TECHNICAL_MAP.modules
                .filter(({ critical }) => critical)
                .map(({ name }) => name),
        );
        expect(REQUIRED_MODULES).toEqual(
            expect.arrayContaining([
                "TeacherDashboardModule",
                "FollowUpAlertsModule",
                "TeacherStudentChatModule",
                "GuidedStudyRoomsModule",
                "HealthModule",
                "OfficialTestsModule",
                "PersonalDataModule",
                "PrivacyDataExportsModule",
                "AccountDeletionModule",
            ]),
        );
    });

    it("documenta os nove grupos de interfaces finais numa unica fonte", () => {
        const documented = new Set(
            TECHNICAL_MAP.endpoints.flatMap(({ interfaceGroup }) =>
                interfaceGroup ? [interfaceGroup] : [],
            ),
        );

        expect([...documented].sort()).toEqual(
            [...REQUIRED_INTERFACE_GROUPS].sort(),
        );
        const markdown = buildTechnicalMapMarkdown(TECHNICAL_MAP);
        for (const group of REQUIRED_INTERFACE_GROUPS) {
            expect(markdown).toContain(`\`${group}\``);
        }
    });

    it("valida modulos nested alcancaveis a partir do AppModule", async () => {
        const root = await mkdtemp(join(tmpdir(), "studyflow-map-graph-"));
        const modulesRoot = join(root, "modules");
        await mkdir(modulesRoot, { recursive: true });
        const appModulePath = join(root, "app.module.ts");
        await Promise.all([
            writeFile(
                appModulePath,
                'import { Mf2Module } from "./modules/mf2.module.js";\n',
            ),
            writeFile(
                join(modulesRoot, "mf2.module.ts"),
                'import { GuidedStudyRoomsModule } from "./guided.module.js";\n',
            ),
            writeFile(join(modulesRoot, "guided.module.ts"), "export class GuidedStudyRoomsModule {}\n"),
        ]);

        await expect(collectReachableModules(appModulePath)).resolves.toEqual([
            "GuidedStudyRoomsModule",
            "Mf2Module",
        ]);
    });

    it("falha fechado perante qualquer drift do artefacto canonico", () => {
        expect(() => assertTechnicalMapContent("mapa\n", "mapa\n")).not.toThrow();
        expect(() => assertTechnicalMapContent("mapa novo\n", "mapa antigo\n")).toThrow(
            "Mapa tecnico canonico desatualizado",
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

    it("bloqueia mapa quando falta um grupo de interface final", () => {
        expect(() =>
            buildTechnicalMapMarkdown({
                ...TECHNICAL_MAP,
                endpoints: TECHNICAL_MAP.endpoints.filter(
                    ({ interfaceGroup }) => interfaceGroup !== "HEALTH",
                ),
            }),
        ).toThrow("Interfaces finais ausentes");
    });
});
