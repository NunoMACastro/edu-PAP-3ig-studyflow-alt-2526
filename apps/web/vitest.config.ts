/**
 * Configura testes unitários e de componentes do frontend real.
 */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        include: [
            "src/**/*.{test,spec}.{ts,tsx}",
            "scripts/**/*.test.mjs",
        ],
        exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
        setupFiles: ["./src/test/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/main.tsx", "src/test/**"],
            thresholds: {
                lines: 70,
                branches: 60,
                "src/hooks/useSession.ts": { lines: 90, branches: 85 },
                "src/hooks/usePollingTask.ts": { lines: 90, branches: 85 },
                "src/features/mf5/form-validation.ts": {
                    lines: 90,
                    branches: 85,
                },
                "src/routes/safeReturnTo.ts": { lines: 90, branches: 85 },
            },
        },
    },
});
