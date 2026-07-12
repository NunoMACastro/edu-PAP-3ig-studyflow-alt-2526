/**
 * Testa o fallback seguro do error boundary global.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "./AppErrorBoundary.js";

function BrokenPage(): never {
    throw new Error("detalhe interno que não deve aparecer");
}

describe("AppErrorBoundary", () => {
    it("substitui uma página quebrada sem expor a stack", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        render(
            <AppErrorBoundary>
                <BrokenPage />
            </AppErrorBoundary>,
        );

        expect(
            screen.getByRole("heading", {
                name: "Não foi possível apresentar esta página",
            }),
        ).toBeTruthy();
        expect(
            screen.queryByText(/detalhe interno/),
        ).toBeNull();
    });
});
