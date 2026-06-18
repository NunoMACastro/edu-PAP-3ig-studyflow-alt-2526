// apps/web/src/features/admin-users/admin-users-panel.tsx
import { useEffect, useState } from "react";
import { AdminUser, changeUserRole, loadAdminUsers } from "./admin-users-client.js";

/**
 * Painel administrativo de utilizadores.
 */
export function AdminUsersPanel() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAdminUsers().then(setUsers).catch((err: Error) => setError(err.message));
    }, []);

    async function promoteToTeacher(user: AdminUser) {
        const updated = await changeUserRole(user.id, "TEACHER", "Promoção administrativa validada.");
        setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    }

    return (
        <section aria-labelledby="admin-users-title">
            <h2 id="admin-users-title">Utilizadores</h2>
            {error ? <p role="alert">{error}</p> : null}
            <ul>{users.map((user) => <li key={user.id}>{user.email} - {user.role}<button type="button" onClick={() => promoteToTeacher(user)}>Tornar professor</button></li>)}</ul>
        </section>
    );
}