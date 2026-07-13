/**
 * Liga um hash estável à abertura de um painel lateral sem alterar a rota.
 */
import { useEffect, type Dispatch, type SetStateAction } from "react";

/** Abre o painel no carregamento inicial e em alterações posteriores do hash. */
export function useHashSidePanel(hash: `#${string}`, setOpen: Dispatch<SetStateAction<boolean>>): void {
    useEffect(() => {
        const openForHash = (): void => {
            if (window.location.hash === hash) setOpen(true);
        };
        openForHash();
        window.addEventListener("hashchange", openForHash);
        return () => window.removeEventListener("hashchange", openForHash);
    }, [hash, setOpen]);
}
