/** Testa a ligação estável entre hashes e painéis laterais. */
import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useHashSidePanel } from "./useHashSidePanel.js";

function Harness() {
    const [open, setOpen] = useState(false);
    useHashSidePanel("#criar-recurso", setOpen);
    return <p>{open ? "Aberto" : "Fechado"}</p>;
}

afterEach(() => {
    window.history.replaceState(null, "", "/");
});

describe("useHashSidePanel", () => {
    it("abre no carregamento inicial e quando o hash muda", () => {
        window.history.replaceState(null, "", "/#criar-recurso");
        const first = render(<Harness />);
        expect(screen.getByText("Aberto")).toBeTruthy();
        first.unmount();

        window.history.replaceState(null, "", "/");
        render(<Harness />);
        expect(screen.getByText("Fechado")).toBeTruthy();
        act(() => {
            window.location.hash = "criar-recurso";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        });
        expect(screen.getByText("Aberto")).toBeTruthy();
    });
});
