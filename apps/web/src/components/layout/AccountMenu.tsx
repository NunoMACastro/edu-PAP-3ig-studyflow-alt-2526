/** Menu de conta do aluno, separado dos destinos principais. */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "../../lib/apiClient.js";
import { ShellIcon } from "./shell-icons.js";

export function AccountMenu({ user, onLogout, pending }: {
    user: User;
    onLogout: () => void;
    pending: boolean;
}) {
    const primaryIdentity = user.displayName?.trim() || user.email;
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const close = () => {
            setOpen(false);
            requestAnimationFrame(() => triggerRef.current?.focus());
        };
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
        const onPointer = (event: PointerEvent) => {
            if (event.target instanceof Node && !menuRef.current?.contains(event.target) && !triggerRef.current?.contains(event.target)) close();
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onPointer);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onPointer);
        };
    }, [open]);
    return (
        <div className="relative">
            <button ref={triggerRef} aria-label={`Conta: ${primaryIdentity}`} aria-expanded={open} aria-haspopup="menu" className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-left hover:bg-studyflow-card" onClick={() => setOpen((value) => !value)} type="button">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-studyflow-brand/20 text-studyflow-brandText"><ShellIcon className="h-5 w-5" name="user" /></span>
                <span className="hidden max-w-44 truncate text-sm font-semibold xl:block">{primaryIdentity}</span>
            </button>
            {open ? (
                <div ref={menuRef} className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-studyflow-border/10 bg-studyflow-card p-2 shadow-2xl" role="menu">
                    <div className="border-b border-studyflow-border/10 px-3 py-3">
                        <p className="truncate text-sm font-semibold">{primaryIdentity}</p>
                        {primaryIdentity !== user.email ? <p className="mt-1 truncate text-xs text-studyflow-text/60">{user.email}</p> : null}
                    </div>
                    <AccountLink href="/app/perfil" icon="user" label="Perfil" />
                    <AccountLink href="/app/conta/notificacoes" icon="bell" label="Preferências de notificações" />
                    <AccountLink href="/app/privacidade" icon="shield" label="Privacidade e consentimentos" />
                    <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-studyflow-text/70 hover:bg-studyflow-page/50" disabled={pending} onClick={onLogout} role="menuitem" type="button"><ShellIcon className="h-5 w-5" name="logOut" />{pending ? "A sair..." : "Sair"}</button>
                </div>
            ) : null}
        </div>
    );
}

function AccountLink({ href, icon, label }: { href: string; icon: "user" | "bell" | "shield"; label: string }) {
    return <Link className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-studyflow-text/70 hover:bg-studyflow-page/50" role="menuitem" to={href}><ShellIcon className="h-5 w-5" name={icon} />{label}</Link>;
}
