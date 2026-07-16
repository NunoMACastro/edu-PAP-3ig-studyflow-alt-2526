/** Testes unitários do contrato privado antes de qualquer escrita persistente. */
import {
    cp,
    mkdtemp,
    readFile,
    rm,
    symlink,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
    normalizeSeedMarkdown,
    parsePrivateSeedData,
    parsePrivateSeedQuizzes,
    preflightPrivateSeedInput,
    splitSeedMarkdown,
} from "./private-seed-input.js";

describe("inputs privados da seed TIG", () => {
    const inputRoot = resolve(process.cwd(), "../seed-input-private");
    const workspaceRoot = resolve(process.cwd(), "../..");

    it("interpreta os dados reais e representa os 143 Markdown, incluindo README", async () => {
        const result = await preflightPrivateSeedInput({ inputRoot, workspaceRoot });

        expect(result.data.teacher.name).toBeTruthy();
        expect(result.data.students).toHaveLength(4);
        expect(result.data.classes).toHaveLength(2);
        expect(result.data.classes.flatMap(({ subjects }) => subjects)).toHaveLength(3);
        expect(result.sourceMarkdownCount).toBe(143);
        expect(result.sourcePdfCount).toBe(0);
        expect(result.materials.filter(({ sourceRelativePath }) =>
            sourceRelativePath.toLowerCase().endsWith("/readme.md"),
        )).toHaveLength(9);
        expect(result.materials.some(({ sourceRelativePath }) =>
            /\.js$|\.ds_store$|\.(?:png|jpe?g|gif|webp)$/i.test(sourceRelativePath),
        )).toBe(false);
    });

    it("indica o campo inválido, rejeita duplicados e confina pastas", async () => {
        const source = await readFile(resolve(inputRoot, "dados.md"), "utf8");

        expect(() => parsePrivateSeedData(
            source.replace("Estado: ACTIVE", "Estado: UNKNOWN"),
            { inputRoot, workspaceRoot },
        )).toThrow("Estado deve ser ACTIVE ou ARCHIVED");
        const teacherEmail = source.match(/Email de demonstração: (.+)/)?.[1];
        const studentEmail = [...source.matchAll(/Email de demonstração: (.+)/g)]
            .at(1)?.[1];
        expect(teacherEmail).toBeTruthy();
        expect(studentEmail).toBeTruthy();
        expect(() => parsePrivateSeedData(
            source.replace(String(studentEmail), String(teacherEmail)),
            { inputRoot, workspaceRoot },
        )).toThrow("emails duplicados");
        expect(() => parsePrivateSeedData(
            source.replace(
                "real_dev/seed-input-private/materiais/11 ano",
                "real_dev/docs",
            ),
            { inputRoot, workspaceRoot },
        )).toThrow("deve ficar dentro de seed-input-private");
    });

    it("rejeita extensões desconhecidas e symlinks antes de persistir", async () => {
        const fixtureWorkspace = await mkdtemp(join(tmpdir(), "studyflow-input-guard-"));
        const fixtureInput = join(
            fixtureWorkspace,
            "real_dev",
            "seed-input-private",
        );
        const materialFolder = join(fixtureInput, "materiais", "11 ano", "JavaScript");
        const unknownFile = join(materialFolder, "nao-suportado.txt");
        const linkedFile = join(materialFolder, "ligacao.md");

        try {
            await cp(inputRoot, fixtureInput, { recursive: true });
            await writeFile(unknownFile, "não importar", "utf8");
            await expect(
                preflightPrivateSeedInput({
                    inputRoot: fixtureInput,
                    workspaceRoot: fixtureWorkspace,
                }),
            ).rejects.toThrow("Extensão não suportada");

            await rm(unknownFile);
            await symlink(join(materialFolder, "README.md"), linkedFile);
            await expect(
                preflightPrivateSeedInput({
                    inputRoot: fixtureInput,
                    workspaceRoot: fixtureWorkspace,
                }),
            ).rejects.toThrow("Symlink não permitido");
        } finally {
            await rm(fixtureWorkspace, { recursive: true, force: true });
        }
    });

    it("normaliza anchors, imagens e referências sem quebrar links HTTP", () => {
        const normalized = normalizeSeedMarkdown([
            '<a id="inicio"></a>',
            "![Header](../Images/Header.png)",
            "![captura](./captura.png)",
            "[Outro módulo](../outro.md)",
            "[Documentação](https://example.test/docs)",
        ].join("\n"));

        expect(normalized).not.toContain("<a id=");
        expect(normalized).not.toContain("Header.png");
        expect(normalized).toContain("Imagem de referência omitida");
        expect(normalized).toContain("**Referência relacionada:** Outro módulo");
        expect(normalized).toContain("[Documentação](https://example.test/docs)");
    });

    it("divide apenas em fronteiras seguras e mantém code fences inteiros", () => {
        const source = [
            "# Parte A",
            "Texto inicial.",
            "```js",
            "const total = 2 + 2;",
            "```",
            "",
            "## Parte B",
            "Texto final com detalhe suficiente.",
        ].join("\n");
        const parts = splitSeedMarkdown(source, 70);

        expect(parts.length).toBeGreaterThan(1);
        expect(parts.join("\n\n")).toContain("```js\nconst total = 2 + 2;\n```");
        expect(parts.every((part) => (part.match(/```/g)?.length ?? 0) % 2 === 0)).toBe(true);
    });

    it("valida perguntas, respostas e fontes do quizzes.json", async () => {
        const preflight = await preflightPrivateSeedInput({ inputRoot, workspaceRoot });
        const quizzesSource = await readFile(resolve(inputRoot, "quizzes.json"), "utf8");
        const paths = new Set(preflight.materials.map(({ sourceRelativePath }) => sourceRelativePath));

        expect(parsePrivateSeedQuizzes(quizzesSource, preflight.data, paths)).toHaveLength(9);
        expect(() => parsePrivateSeedQuizzes(
            quizzesSource.replace('"correctOptionIndex": 0', '"correctOptionIndex": 9'),
            preflight.data,
            paths,
        )).toThrow("correctOptionIndex inválido");
        expect(() => parsePrivateSeedQuizzes(
            quizzesSource.replace(/"sourcePaths": \[[^\]]+\]/, '"sourcePaths": ["materiais/inexistente.md"]'),
            preflight.data,
            paths,
        )).toThrow("fonte não encontrada");
    });
});
