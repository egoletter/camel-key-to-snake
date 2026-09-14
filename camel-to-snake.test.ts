/// <reference types="node" />
import { suite, test } from "node:test";
import assert from "node:assert/strict";
import { camelToSnake, camelKeyToSnake } from "./camel-to-snake";

suite("camelToSnake", () => {
    test("basic camelCase", () => {
        assert.equal(camelToSnake("helloWorld"), "hello_world");
    });

    test("PascalCase", () => {
        assert.equal(camelToSnake("HelloWorld"), "hello_world");
    });

    test("single lowercase char", () => {
        assert.equal(camelToSnake("a"), "a");
    });

    test("single uppercase char", () => {
        assert.equal(camelToSnake("A"), "a");
    });

    test("empty string", () => {
        assert.equal(camelToSnake(""), "");
    });

    test("already snake_case stays unchanged", () => {
        assert.equal(camelToSnake("already_snake"), "already_snake");
    });

    test("consecutive uppercase (acronym) in the middle", () => {
        assert.equal(camelToSnake("HTTPServerError"), "http_server_error");
    });

    test("acronym at the end", () => {
        assert.equal(camelToSnake("serverErrorHTTP"), "server_error_http");
    });

    test("numbers within the word", () => {
        assert.equal(camelToSnake("item2Count"), "item2count");
    });

    test("multiple words", () => {
        assert.equal(camelToSnake("thisIsALongVariableName"), "this_is_a_long_variable_name");
    });

    test("throws TypeError for non-string input", () => {
        // @ts-expect-error intentionally passing wrong type
        assert.throws(() => camelToSnake(123), TypeError);
        // @ts-expect-error intentionally passing wrong type
        assert.throws(() => camelToSnake(null), TypeError);
        // @ts-expect-error intentionally passing wrong type
        assert.throws(() => camelToSnake(undefined), TypeError);
    });
});

suite("camelKeyToSnake", () => {
    test("flat object", () => {
        const result = camelKeyToSnake({ userName: "Alice", userAge: 30 });
        assert.deepEqual(result, { user_name: "Alice", user_age: 30 });
    });

    test("nested object", () => {
        const result = camelKeyToSnake({
            userProfile: { firstName: "Alice", lastName: "Doe" },
        });
        assert.deepEqual(result, {
            user_profile: { first_name: "Alice", last_name: "Doe" },
        });
    });

    test("array of objects", () => {
        const result = camelKeyToSnake({
            items: [{ itemId: 1 }, { itemId: 2 }],
        });
        assert.deepEqual(result, {
            items: [{ item_id: 1 }, { item_id: 2 }],
        });
    });

    test("primitives pass through unchanged", () => {
        assert.equal(camelKeyToSnake(42), 42);
        assert.equal(camelKeyToSnake("plainString"), "plainString");
        assert.equal(camelKeyToSnake(true), true);
        assert.equal(camelKeyToSnake(null), null);
        assert.equal(camelKeyToSnake(undefined), undefined);
    });

    test("Date instances are preserved, not converted", () => {
        const date = new Date("2024-01-01T00:00:00.000Z");
        const result = camelKeyToSnake({ createdAt: date });
        assert.ok(result.created_at instanceof Date);
        assert.equal((result.created_at as Date).getTime(), date.getTime());
    });

    test("empty object and empty array", () => {
        assert.deepEqual(camelKeyToSnake({}), {});
        assert.deepEqual(camelKeyToSnake([]), []);
    });

    test("handles circular references without throwing", () => {
        type SelfRef = { selfRef?: unknown; someValue: number };
        const obj: SelfRef = { someValue: 1 };
        obj.selfRef = obj; // circular reference

        const result = camelKeyToSnake(obj) as { some_value: number; self_ref: unknown };

        assert.equal(result.some_value, 1);
        // the circular reference should point back to the converted result itself
        assert.equal(result.self_ref, result);
    });

    test("same nested object referenced twice keeps identity", () => {
        const shared = { sharedKey: "value" };
        const obj = { a: shared, b: shared };

        const result = camelKeyToSnake(obj);

        assert.deepEqual(result.a, { shared_key: "value" });
        // both properties should resolve to the exact same converted object
        assert.equal(result.a, result.b);
    });

    test("array containing null and primitives", () => {
        const result = camelKeyToSnake({ mixedList: [1, "two", null, undefined, true] });
        assert.deepEqual(result, { mixed_list: [1, "two", null, undefined, true] });
    });
});
