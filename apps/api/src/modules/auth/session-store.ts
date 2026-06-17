/**
 * Documenta a responsabilidade de auth dentro de real_dev.
 */
export type SessionStore = {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode: "EX", seconds: number): Promise<unknown>;
    del(key: string): Promise<unknown>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<unknown>;
};

/**
 * Contrato de autenticação que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type InMemoryEntry = {
    value: string;
    expiresAt?: number;
};

/**
 * Cria um store de sessão volátil para testes E2E autocontidos.
 *
 * Este store implementa apenas os comandos Redis usados por autenticação e
 * rate limiting. Não deve ser usado em produção porque perde estado ao reiniciar.
 */
export function createInMemorySessionStore(): SessionStore {
    const entries = new Map<string, InMemoryEntry>();

    /**
     * Remove autenticação apenas depois das validações de acesso aplicáveis.
     *
     * @param key key necessário para executar delete if expired sem depender de estado global.
     */
    function deleteIfExpired(key: string): void {
        const entry = entries.get(key);
        if (entry?.expiresAt && entry.expiresAt <= Date.now()) {
            entries.delete(key);
        }
    }

    return {
                /**
         * Carrega autenticação no formato necessário ao próximo passo do fluxo.
         *
         * @param key key necessário para executar get sem depender de estado global.
         * @returns Entidade de autenticação já filtrada pelo contexto recebido.
         */
        async get(key: string): Promise<string | null> {
            deleteIfExpired(key);
            return entries.get(key)?.value ?? null;
        },

                /**
         * Executa a operação set no domínio de autenticação com contrato explícito.
         *
         * @param key key necessário para executar set sem depender de estado global.
         * @param value Valor bruto recebido antes de normalização, parsing ou validação.
         * @param mode mode necessário para executar set sem depender de estado global.
         * @param seconds seconds necessário para executar set sem depender de estado global.
         * @returns Valor de autenticação no contrato esperado pelo chamador.
         */
        async set(
            key: string,
            value: string,
            mode: "EX",
            seconds: number,
        ): Promise<"OK"> {
            entries.set(key, {
                value,
                expiresAt: mode === "EX" ? Date.now() + seconds * 1000 : undefined,
            });
            return "OK";
        },

                /**
         * Executa a operação del no domínio de autenticação com contrato explícito.
         *
         * @param key key necessário para executar del sem depender de estado global.
         * @returns Valor de autenticação no contrato esperado pelo chamador.
         */
        async del(key: string): Promise<number> {
            return entries.delete(key) ? 1 : 0;
        },

                /**
         * Executa a operação incr no domínio de autenticação com contrato explícito.
         *
         * @param key key necessário para executar incr sem depender de estado global.
         * @returns Valor de autenticação no contrato esperado pelo chamador.
         */
        async incr(key: string): Promise<number> {
            deleteIfExpired(key);
            const current = Number.parseInt(entries.get(key)?.value ?? "0", 10) || 0;
            const next = current + 1;
            const previousExpiry = entries.get(key)?.expiresAt;
            entries.set(key, { value: String(next), expiresAt: previousExpiry });
            return next;
        },

                /**
         * Executa a operação expire no domínio de autenticação com contrato explícito.
         *
         * @param key key necessário para executar expire sem depender de estado global.
         * @param seconds seconds necessário para executar expire sem depender de estado global.
         * @returns Valor de autenticação no contrato esperado pelo chamador.
         */
        async expire(key: string, seconds: number): Promise<number> {
            deleteIfExpired(key);
            const entry = entries.get(key);
            if (!entry) return 0;
            entries.set(key, {
                value: entry.value,
                expiresAt: Date.now() + seconds * 1000,
            });
            return 1;
        },
    };
}
