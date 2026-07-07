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
 * Este store implementa apenas os comandos Redis usados por autenticação e
 * rate limiting. Não deve ser usado em produção porque perde estado ao reiniciar.
 * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
export function createInMemorySessionStore(): SessionStore {
    const entries = new Map<string, InMemoryEntry>();

    /**
     * Remove autenticação apenas depois das validações de acesso aplicáveis.
     * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
     *
     * @param key Valor de key usado pela função para executar delete if expired com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
         * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
         *
         * @param key Valor de key usado pela função para executar get com dados explícitos.
         * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
         */
        async get(key: string): Promise<string | null> {
            deleteIfExpired(key);
            return entries.get(key)?.value ?? null;
        },

        /**
         * Executa a operação set no domínio de autenticação com contrato explícito.
         * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
         *
         * @param key Valor de key usado pela função para executar set com dados explícitos.
         * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
         * @param mode Valor de mode usado pela função para executar set com dados explícitos.
         * @param seconds Valor temporal que controla expiração, retenção ou referência da operação.
         * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
         * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
         *
         * @param key Valor de key usado pela função para executar del com dados explícitos.
         * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
         */
        async del(key: string): Promise<number> {
            return entries.delete(key) ? 1 : 0;
        },

        /**
         * Executa a operação incr no domínio de autenticação com contrato explícito.
         * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
         *
         * @param key Valor de key usado pela função para executar incr com dados explícitos.
         * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
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
         * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
         *
         * @param key Valor de key usado pela função para executar expire com dados explícitos.
         * @param seconds Valor temporal que controla expiração, retenção ou referência da operação.
         * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
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
