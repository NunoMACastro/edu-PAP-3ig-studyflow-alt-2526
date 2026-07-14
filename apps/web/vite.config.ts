/**
 * Configura a ferramenta associada a vite.config.ts para o ambiente real_dev da StudyFlow.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxyTarget =
    process.env.VITE_API_PROXY_TARGET ??
    `http://127.0.0.1:${process.env.STUDYFLOW_E2E_API_PORT ?? "3000"}`;

/**
 * Configuração Vite do frontend StudyFlow.
 *
 * O proxy mantém o contrato `/api/*` usado nos BKs e permite que o browser
 * envie cookies HttpOnly para a API local durante desenvolvimento.
 */
export default defineConfig({
    plugins: [react()],
    build: {
        // O gate de bundle usa o grafo real de imports para medir apenas os
        // chunks alcançáveis por cada papel, sem somar catálogos lazy mutuamente
        // exclusivos de aluno, professor e administração.
        manifest: true,
        rollupOptions: {
            output: {
                // O ecossistema unified/remark é modular. Separar parser, GFM e
                // adaptador React evita um único chunk Markdown monolítico sem
                // duplicar dependências entre as páginas de aluno e professor.
                manualChunks(id) {
                    if (!id.includes("/node_modules/")) return undefined;
                    if (
                        /\/(?:remark-gfm|mdast-util-gfm[^/]*|micromark-extension-gfm[^/]*)\//u.test(
                            id,
                        )
                    ) {
                        return "markdown-gfm";
                    }
                    if (
                        /\/(?:remark-parse|mdast-util-from-markdown|micromark(?:-core-commonmark|-util-[^/]+)?)\//u.test(
                            id,
                        )
                    ) {
                        return "markdown-parser";
                    }
                    if (
                        /\/(?:react-markdown|remark-rehype|mdast-util-to-hast|hast-util-to-jsx-runtime|property-information|space-separated-tokens|comma-separated-tokens|style-to-js|html-url-attributes)\//u.test(
                            id,
                        )
                    ) {
                        return "markdown-react";
                    }
                    if (
                        /\/(?:unified|bail|trough|vfile(?:-message)?|unist-util-[^/]+|devlop)\//u.test(
                            id,
                        )
                    ) {
                        return "markdown-runtime";
                    }
                    return undefined;
                },
            },
        },
    },
    server: {
        proxy: {
            "/api": {
                target: apiProxyTarget,
                changeOrigin: true,
            },
            "/socket.io": {
                target: apiProxyTarget,
                changeOrigin: true,
                ws: true,
            },
        },
    },
});
