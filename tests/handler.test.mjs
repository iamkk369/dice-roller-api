import assert from "node:assert/strict";
import test from "node:test";
import { handler } from "../lambda/index.mjs";

const invoke = async (queryStringParameters) => {
    const response = await handler({ queryStringParameters });
    return {
        statusCode: response.statusCode,
        body: JSON.parse(response.body)
    };
};

test("uses defaults when query parameters are omitted", async () => {
    const response = await invoke(undefined);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.sides, 6);
    assert.equal(response.body.count, 1);
    assert.equal(response.body.rolls.length, 1);
    assert.ok(response.body.rolls[0] >= 1 && response.body.rolls[0] <= 6);
    assert.equal(response.body.total, response.body.rolls[0]);
});

test("returns the requested number of rolls within the selected range", async () => {
    const response = await invoke({ sides: "20", count: "2" });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.sides, 20);
    assert.equal(response.body.count, 2);
    assert.equal(response.body.rolls.length, 2);
    assert.ok(response.body.rolls.every((roll) => roll >= 1 && roll <= 20));
    assert.equal(
        response.body.total,
        response.body.rolls.reduce((sum, roll) => sum + roll, 0)
    );
});

test("caps the number of rolls at ten", async () => {
    const response = await invoke({ sides: "6", count: "11" });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.count, 10);
    assert.equal(response.body.rolls.length, 10);
});

test("rejects sides outside the supported integer range", async () => {
    for (const sides of ["1", "101", "-4", "2.5", "not-a-number"]) {
        const response = await invoke({ sides, count: "1" });
        assert.equal(response.statusCode, 400, `sides=${sides}`);
        assert.match(response.body.error, /sides must be an integer/);
    }
});

test("rejects invalid roll counts", async () => {
    for (const count of ["0", "-2", "2.5", "not-a-number"]) {
        const response = await invoke({ sides: "6", count });
        assert.equal(response.statusCode, 400, `count=${count}`);
        assert.match(response.body.error, /count must be a positive integer/);
    }
});
