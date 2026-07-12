/** Redação recursiva e limitada para logs/auditoria sem conteúdo sensível. */
const SENSITIVE_KEY_PARTS = [
    "password",
    "passwordhash",
    "cookie",
    "secret",
    "prompt",
    "answer",
    "response",
    "token",
    "apikey",
    "authorization",
];

const REDACTED = "[REDACTED]";
const TRUNCATED = "[TRUNCATED]";
const MAX_DEPTH = 6;
const MAX_ITEMS = 200;
const MAX_ARRAY_ITEMS = 50;
const MAX_STRING_LENGTH = 300;

/** Sanitiza objetos e arrays aninhados com limites contra ciclos e payloads enormes. */
export function redactMetadataRecursively(
    metadata: Record<string, unknown>,
): Record<string, unknown> {
    const seen = new WeakSet<object>();
    const budget = { remaining: MAX_ITEMS };
    return sanitizeObject(metadata, 0, seen, budget);
}

function sanitizeObject(
    value: Record<string, unknown>,
    depth: number,
    seen: WeakSet<object>,
    budget: { remaining: number },
): Record<string, unknown> {
    if (depth >= MAX_DEPTH || seen.has(value)) return { value: TRUNCATED };
    seen.add(value);
    const safe: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
        if (budget.remaining <= 0) {
            safe.__truncated__ = TRUNCATED;
            break;
        }
        budget.remaining -= 1;
        safe[key] = isSensitiveKey(key)
            ? REDACTED
            : sanitizeValue(item, depth + 1, seen, budget);
    }
    seen.delete(value);
    return safe;
}

function sanitizeValue(
    value: unknown,
    depth: number,
    seen: WeakSet<object>,
    budget: { remaining: number },
): unknown {
    if (value === null || typeof value === "number" || typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        return value.length > MAX_STRING_LENGTH
            ? `${value.slice(0, MAX_STRING_LENGTH)}...`
            : value;
    }
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) {
        if (depth >= MAX_DEPTH || seen.has(value)) return TRUNCATED;
        seen.add(value);
        const safe = value
            .slice(0, MAX_ARRAY_ITEMS)
            .map((item) => sanitizeValue(item, depth + 1, seen, budget));
        if (value.length > MAX_ARRAY_ITEMS) safe.push(TRUNCATED);
        seen.delete(value);
        return safe;
    }
    if (typeof value === "object" && value) {
        const prototype = Object.getPrototypeOf(value);
        if (prototype === Object.prototype || prototype === null) {
            return sanitizeObject(
                value as Record<string, unknown>,
                depth,
                seen,
                budget,
            );
        }
        return "[UNSUPPORTED_OBJECT]";
    }
    return "[UNSUPPORTED_VALUE]";
}

function isSensitiveKey(key: string): boolean {
    const normalized = key.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
    return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part));
}
