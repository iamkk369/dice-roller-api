import { randomInt } from "node:crypto";

const MAX_SIDES = 100;
const MAX_COUNT = 10;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const resolveAllowOrigin = (event) => {
    if (ALLOWED_ORIGINS.includes("*")) {
        return "*";
    }
    const origin =
        event?.headers?.origin ?? event?.headers?.Origin ?? "";
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return origin;
    }
    return ALLOWED_ORIGINS[0] ?? "";
};

const corsHeaders = (event) => {
    const allowOrigin = resolveAllowOrigin(event);
    return {
        "Content-Type": "application/json",
        ...(allowOrigin
            ? { "Access-Control-Allow-Origin": allowOrigin }
            : {}),
        Vary: "Origin",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-store",
    };
};

const jsonResponse = (statusCode, body, event) => ({
    statusCode,
    headers: corsHeaders(event),
    body: JSON.stringify(body),
});

const httpMethod = (event) =>
    event?.httpMethod ??
    event?.requestContext?.http?.method ??
    "GET";

const parseStrictPositiveInt = (value) => {
    if (typeof value === "number") {
        return Number.isSafeInteger(value) ? value : null;
    }
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
        return null;
    }
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) ? parsed : null;
};

export const handler = async (event) => {
    if (httpMethod(event) === "OPTIONS") {
        return {
            statusCode: 204,
            headers: corsHeaders(event),
            body: "",
        };
    }

    const query = event?.queryStringParameters ?? {};
    const sides =
        query.sides === undefined ? 6 : parseStrictPositiveInt(query.sides);
    const requestedCount =
        query.count === undefined ? 1 : parseStrictPositiveInt(query.count);

    if (sides === null || sides < 2 || sides > MAX_SIDES) {
        return jsonResponse(
            400,
            {
                error: `sides must be an integer between 2 and ${MAX_SIDES}`,
            },
            event
        );
    }

    if (requestedCount === null || requestedCount < 1) {
        return jsonResponse(
            400,
            {
                error: "count must be a positive integer",
            },
            event
        );
    }

    if (requestedCount > MAX_COUNT) {
        return jsonResponse(
            400,
            {
                error: `count must be an integer between 1 and ${MAX_COUNT}`,
            },
            event
        );
    }

    const count = requestedCount;
    const rolls = Array.from({ length: count }, () => randomInt(1, sides + 1));
    const total = rolls.reduce((sum, roll) => sum + roll, 0);

    return jsonResponse(200, { sides, count, rolls, total }, event);
};