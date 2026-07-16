/** Testa renderização segura e edição explícita de documentos Markdown. */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MarkdownEditor } from "./MarkdownEditor.js";
import { MarkdownViewer } from "./MarkdownViewer.js";

describe("MarkdownViewer", () => {
    it("renderiza GFM sem HTML executável nem pedidos de imagens", () => {
        const { container } = render(
            <MarkdownViewer
                source={`# Apontamentos

<script>alert("não executar")</script>

- [x] Rever a matéria

| Tema | Estado |
| --- | --- |
| GFM | Pronto |

![pixel](https://tracker.example.test/pixel.png)

[Site seguro](https://example.test) · [Ataque](javascript:alert(1))`}
            />,
        );

        expect(screen.getByRole("heading", { name: "Apontamentos" })).toBeTruthy();
        expect(screen.getByRole("table")).toBeTruthy();
        expect(container.querySelector("script")).toBeNull();
        expect(container.querySelector("img")).toBeNull();
        expect(screen.getByRole("link", { name: /Imagem externa: pixel/ })).toHaveProperty(
            "href",
            "https://tracker.example.test/pixel.png",
        );
        expect(screen.getByRole("link", { name: "Site seguro" })).toMatchObject({
            target: "_blank",
            rel: "noopener noreferrer",
        });
        expect(screen.getByText("Ataque").closest("a")?.getAttribute("href") ?? "").not.toMatch(
            /^javascript:/iu,
        );
        expect(
            screen.getByRole("checkbox", { name: "Tarefa concluída" }),
        ).toMatchObject({ disabled: true });
    });

    it("mantém links relativos e bloqueia imagens relativas", () => {
        const { container } = render(
            <MarkdownViewer source="[Notas](notas/aula.md) ![local](imagem.png)" />,
        );

        expect(screen.getByRole("link", { name: "Notas" }).getAttribute("href")).toBe(
            "notas/aula.md",
        );
        expect(screen.getByText("Imagem externa bloqueada")).toBeTruthy();
        expect(container.querySelector("img")).toBeNull();
    });

    it("permite navegar por teclado em blocos e tabelas com scroll horizontal", () => {
        render(
            <MarkdownViewer
                source={`| Coluna extensa | Valor |
| --- | --- |
| Conteúdo | Exemplo |

\`\`\`ts
const resultado = "conteúdo potencialmente mais largo do que o viewport";
\`\`\``}
            />,
        );

        expect(
            screen
                .getByRole("region", {
                    name: "Tabela com deslocamento horizontal",
                })
                .getAttribute("tabindex"),
        ).toBe("0");
        expect(
            screen
                .getByLabelText("Bloco de código com deslocamento horizontal")
                .getAttribute("tabindex"),
        ).toBe("0");
    });
});

describe("MarkdownEditor", () => {
    it("aplica a toolbar, atualiza o preview e grava com Ctrl/Cmd+S", async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();

        function Harness() {
            const [value, setValue] = useState("# Documento\n\nConteúdo inicial.");
            return (
                <MarkdownEditor
                    isDirty
                    onChange={setValue}
                    onSave={onSave}
                    value={value}
                />
            );
        }

        render(<Harness />);
        const textarea = screen.getByLabelText("Fonte Markdown");
        textarea.focus();
        (textarea as HTMLTextAreaElement).setSelectionRange(
            (textarea as HTMLTextAreaElement).value.length,
            (textarea as HTMLTextAreaElement).value.length,
        );
        await user.click(screen.getByRole("button", { name: "Negrito" }));

        expect(textarea).toHaveProperty(
            "value",
            "# Documento\n\nConteúdo inicial.**texto**",
        );
        expect(screen.getByText("texto", { selector: "strong" })).toBeTruthy();

        await user.keyboard("{Control>}s{/Control}");
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/\/20 000 caracteres/)).toBeTruthy();
    });

    it("foca o primeiro erro de validação", () => {
        render(
            <MarkdownEditor
                error="O documento contém HTML raw."
                isDirty
                onChange={vi.fn()}
                onSave={vi.fn()}
                value="# Documento\n\nConteúdo válido."
            />,
        );

        expect(screen.getByRole("alert")).toBe(document.activeElement);
    });
});
