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
    server: {
        proxy: {
            "/api": {
                target: apiProxyTarget,
                changeOrigin: true,
            },
        },
    },
});
