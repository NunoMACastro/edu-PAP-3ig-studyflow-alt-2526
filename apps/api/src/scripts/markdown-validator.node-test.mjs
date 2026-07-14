/** Testes Node nativos do parser ESM usado na fronteira Markdown da API. */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    MAX_MARKDOWN_CHARACTERS,
    validateMarkdownSource,
    validateMarkdownUpload,
} from "../../dist/common/validators/markdown-material.validator.js";

/** Confirma que uma promessa falha com o código HTTP público esperado. */
async function rejectsWithCode(promise, expectedCode) {
    await assert.rejects(promise, (error) => {
        assert.equal(error?.response?.code, expectedCode);
        return true;
    });
}

describe("markdown-material.validator", () => {
    it("normaliza BOM, CRLF, Unicode e a quebra final", async () => {
        const result = await validateMarkdownSource(
            "\uFEFF# Func\u0327a\u0303o\r\n\r\nConteúdo de estudo.\r\n\r\n",
        );
        assert.equal(result.markdownSource, "# Função\n\nConteúdo de estudo.\n");
        assert.equal(result.sizeBytes, Buffer.byteLength(result.markdownSource));
    });

    for (const source of [
        "<script>alert(1)</script> Conteúdo suficiente.",
        "<!-- comentário --> Conteúdo suficiente.",
        "<svg><script>alert(1)</script></svg>",
    ]) {
        it(`rejeita HTML raw: ${source}`, async () => {
            await rejectsWithCode(
                validateMarkdownSource(source),
                "MARKDOWN_RAW_HTML_NOT_ALLOWED",
            );
        });
    }

    it("mantém HTML em code fences como texto inerte", async () => {
        const result = await validateMarkdownSource(
            "```html\n<script>alert(1)</script>\n```",
        );
        assert.equal(
            result.markdownSource,
            "```html\n<script>alert(1)</script>\n```\n",
        );
    });

    for (const source of [
        "[ligação](javascript:alert(1)) Conteúdo seguro.",
        "[ficheiro](file:///etc/passwd) Conteúdo seguro.",
        "![imagem](data:image/png;base64,AAAA) Conteúdo seguro.",
        "[protocol-relative](//example.test/path) Conteúdo seguro.",
    ]) {
        it(`rejeita URL perigoso: ${source}`, async () => {
            await rejectsWithCode(
                validateMarkdownSource(source),
                "MARKDOWN_UNSAFE_URL",
            );
        });
    }

    it("aceita links relativos, fragmentos, HTTPS e mailto", async () => {
        await assert.doesNotReject(
            validateMarkdownSource(
                "[Notas](notas/aula.md), [secção](#tema), [site](https://example.test) e [email](mailto:prof@example.test).",
            ),
        );
    });

    it("rejeita conteúdo sem caracteres visíveis suficientes", async () => {
        await rejectsWithCode(validateMarkdownSource("# a\n- b"), "MARKDOWN_EMPTY");
    });

    it("rejeita NUL e outros controlos", async () => {
        await rejectsWithCode(
            validateMarkdownSource("Conteúdo\u0000 inválido e perigoso."),
            "MARKDOWN_INVALID_UTF8",
        );
    });

    it("rejeita o limite de caracteres Unicode", async () => {
        await rejectsWithCode(
            validateMarkdownSource("a".repeat(MAX_MARKDOWN_CHARACTERS + 1)),
            "MARKDOWN_TOO_LARGE",
        );
    });

    it("rejeita uploads que não sejam UTF-8 estrito", async () => {
        await rejectsWithCode(
            validateMarkdownUpload({ buffer: Buffer.from([0xc3, 0x28]) }),
            "MARKDOWN_INVALID_UTF8",
        );
    });
});
