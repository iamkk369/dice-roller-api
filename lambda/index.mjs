import { randomInt } from "node:crypto";

const MAX_SIDES = 100;
const MAX_COUNT = 10;

const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
});

export const handler = async (event) => {
    const query = event?.queryStringParameters ?? {};
    const sides = query.sides === undefined ? 6 : Number(query.sides);
    const requestedCount = query.count === undefined ? 1 : Number(query.count);

    if (!Number.isInteger(sides) || sides < 2 || sides > MAX_SIDES) {
        return jsonResponse(400, {
            error: `sides must be an integer between 2 and ${MAX_SIDES}`
        });
    }

    if (!Number.isInteger(requestedCount) || requestedCount < 1) {
        return jsonResponse(400, {
            error: "count must be a positive integer"
        });
    }

    const count = Math.min(requestedCount, MAX_COUNT);
    const rolls = Array.from({ length: count }, () => randomInt(1, sides + 1));
    const total = rolls.reduce((sum, roll) => sum + roll, 0);

    return jsonResponse(200, { sides, count, rolls, total });
};