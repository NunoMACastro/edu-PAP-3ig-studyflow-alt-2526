// apps/web/src/features/account-deletion/account-deletion-panel.tsx
import { useState } from "react";
import { ACCOUNT_DELETION_CONFIRMATION, deleteOwnAccount } from "./account-deletion-client.js";

/**
 * Painel de eliminação de conta com confirmação forte.
 */
export function AccountDeletionPanel() {
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function handleDelete() {
        setError(null);
        try {
            await deleteOwnAccount(confirmation, "Pedido pelo painel de privacidade.");
            setDone(true);
        } catch (err) {
            // O erro do backend fica visível; não há fallback silencioso.
            setError(err instanceof Error ? err.message : "Não foi possível eliminar a conta.");
        }
    }

    return (
        <section aria-labelledby="account-deletion-title">
            <h2 id="account-deletion-title">Eliminar conta</h2>
            {error ? <p role="alert">{error}</p> : null}
            {done ? <p>A conta foi eliminada. Inicia sessão apenas se criares uma nova conta.</p> : null}
            <label>
                Escreve {ACCOUNT_DELETION_CONFIRMATION}
                <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </label>
            <button type="button" disabled={confirmation !== ACCOUNT_DELETION_CONFIRMATION} onClick={handleDelete}>Eliminar a minha conta</button>
        </section>
    );
}