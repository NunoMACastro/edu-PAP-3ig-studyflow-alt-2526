/** Estado único e durável da inbox partilhado pela shell desktop e mobile. */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    archiveContextNotification,
    type ContextNotification,
    getNotificationInbox,
    markAllContextNotificationsRead,
    markContextNotificationRead,
} from "../mf4/mf4-client.js";

type NotificationContextValue = {
    items: ContextNotification[];
    unreadCount: number;
    nextCursor: string | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    markRead: (id: string) => Promise<void>;
    archive: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);
const POLLING_INTERVAL_MS = 30_000;

/** Mantém uma única cópia da inbox e atualiza-a apenas quando a página está visível. */
export function NotificationProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ContextNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(false);
    const generationRef = useRef(0);
    const refreshPromiseRef = useRef<Promise<void> | null>(null);
    const loadMorePromiseRef = useRef<Promise<void> | null>(null);

    const refresh = useCallback((): Promise<void> => {
        if (refreshPromiseRef.current) return refreshPromiseRef.current;
        const generation = ++generationRef.current;
        setRefreshing(true);
        setError(null);
        let request!: Promise<void>;
        request = (async () => {
            try {
                const inbox = await getNotificationInbox({ limit: 30 });
                if (!mountedRef.current || generation !== generationRef.current) return;
                setItems(inbox.items);
                setUnreadCount(inbox.unreadCount);
                setNextCursor(inbox.nextCursor);
            } catch (caught) {
                if (!mountedRef.current || generation !== generationRef.current) return;
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível atualizar as notificações.",
                );
            } finally {
                if (refreshPromiseRef.current === request) {
                    refreshPromiseRef.current = null;
                    if (mountedRef.current) {
                        setLoading(false);
                        setRefreshing(false);
                    }
                }
            }
        })();
        refreshPromiseRef.current = request;
        return request;
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        void refresh();
        const handleFocus = (): void => {
            if (document.visibilityState === "visible") void refresh();
        };
        const handleVisibility = (): void => {
            if (document.visibilityState === "visible") void refresh();
        };
        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibility);
        const interval = window.setInterval(() => {
            if (document.visibilityState === "visible") void refresh();
        }, POLLING_INTERVAL_MS);
        return () => {
            mountedRef.current = false;
            generationRef.current += 1;
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.clearInterval(interval);
        };
    }, [refresh]);

    const loadMore = useCallback((): Promise<void> => {
        if (!nextCursor) return Promise.resolve();
        if (loadMorePromiseRef.current) return loadMorePromiseRef.current;
        const generation = generationRef.current;
        const cursor = nextCursor;
        setRefreshing(true);
        setError(null);
        let request!: Promise<void>;
        request = (async () => {
            try {
                const inbox = await getNotificationInbox({ cursor, limit: 30 });
                if (!mountedRef.current || generation !== generationRef.current) return;
                setItems((current) => {
                    const known = new Set(current.map((item) => item.id));
                    return [...current, ...inbox.items.filter((item) => !known.has(item.id))];
                });
                setUnreadCount(inbox.unreadCount);
                setNextCursor(inbox.nextCursor);
            } catch (caught) {
                if (!mountedRef.current || generation !== generationRef.current) return;
                setError(caught instanceof Error ? caught.message : "Não foi possível carregar mais notificações.");
            } finally {
                if (loadMorePromiseRef.current === request) {
                    loadMorePromiseRef.current = null;
                    if (mountedRef.current && generation === generationRef.current) {
                        setRefreshing(false);
                    }
                }
            }
        })();
        loadMorePromiseRef.current = request;
        return request;
    }, [nextCursor]);

    const markRead = useCallback(async (id: string): Promise<void> => {
        const current = items.find((item) => item.id === id);
        if (!current || current.readAt) return;
        const updated = await markContextNotificationRead(id);
        generationRef.current += 1;
        setItems((list) => list.map((item) => (item.id === id ? { ...item, ...updated } : item)));
        setUnreadCount((count) => Math.max(0, count - 1));
    }, [items]);

    const archive = useCallback(async (id: string): Promise<void> => {
        const current = items.find((item) => item.id === id);
        await archiveContextNotification(id);
        generationRef.current += 1;
        setItems((list) => list.filter((item) => item.id !== id));
        if (current && !current.readAt) setUnreadCount((count) => Math.max(0, count - 1));
    }, [items]);

    const markAllRead = useCallback(async (): Promise<void> => {
        await markAllContextNotificationsRead();
        generationRef.current += 1;
        const readAt = new Date().toISOString();
        setItems((list) => list.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
        setUnreadCount(0);
    }, []);

    const value = useMemo<NotificationContextValue>(() => ({
        items,
        unreadCount,
        nextCursor,
        loading,
        refreshing,
        error,
        refresh,
        loadMore,
        markRead,
        archive,
        markAllRead,
    }), [archive, error, items, loadMore, loading, markAllRead, markRead, nextCursor, refresh, refreshing, unreadCount]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

/** Obtém o estado partilhado; a ausência do provider é um erro de integração explícito. */
export function useNotificationInbox(): NotificationContextValue {
    const value = useContext(NotificationContext);
    if (!value) throw new Error("NotificationTray deve estar dentro de NotificationProvider.");
    return value;
}
