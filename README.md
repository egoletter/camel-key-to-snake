# Small utility functions to convert `camelCase` strings and object keys to `snake_case`.

## Functions

### `camelToSnake(str: string): string`

Converts a single `camelCase` (or `PascalCase`) string into `snake_case`.

- Throws a `TypeError` if the input is not a string.
- Handles consecutive uppercase letters (e.g. acronyms) sensibly.

```ts
camelToSnake("helloWorld"); // "hello_world"
camelToSnake("HTTPServerError"); // "http_server_error"
camelToSnake("already_snake"); // "already_snake"
camelToSnake("a"); // "a"
```

### `camelKeyToSnake<T>(sourceObj: T): SnakeKeys<T>`

Recursively converts every object key from `camelCase` to `snake_case`.

- Works on nested objects and arrays.
- Leaves `Date` instances untouched (not treated as plain objects).
- Handles circular references safely using an internal `WeakMap`.
- Primitives (`string`, `number`, `boolean`, `null`, `undefined`) are returned as-is.

```ts
camelKeyToSnake({ userName: "Alice", userAge: 30 });
// { user_name: "Alice", user_age: 30 }

camelKeyToSnake({ items: [{ itemId: 1 }, { itemId: 2 }] });
// { items: [{ item_id: 1 }, { item_id: 2 }] }
```

## Edge Cases Covered

| Case                                  | Behavior                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| Non-string input to `camelToSnake`    | Throws `TypeError`                                                                          |
| Empty string `""`                     | Returns `""`                                                                                |
| Single character `"a"` / `"A"`        | Returns unchanged (lowercased)                                                              |
| Consecutive uppercase (`HTTPError`)   | Splits before the last uppercase letter of the acronym (`http_error`)                       |
| Already `snake_case` input            | Left unchanged                                                                              |
| Numbers/digits in keys (`item2Count`) | Digits are not treated as upper/lowercase letters, so no underscore is inserted around them |
| `null` / `undefined` values           | Returned as-is (not treated as objects)                                                     |
| `Date` objects                        | Preserved as-is, not converted into a plain object                                          |
| Arrays                                | Each item is processed recursively, array shape preserved                                   |
| Circular references                   | Handled via `WeakMap`, does not throw / infinite loop                                       |
| Nested objects                        | Keys converted recursively at every level                                                   |

## Known Limitations

- `camelToSnake` is a runtime regex-based implementation. The `CamelToSnake<S>` type is a compile-time approximation and may not match 100% of edge cases the regex handles (e.g. some acronym boundaries).
- Non-plain objects with custom prototypes (class instances other than `Array`/`Date`) are treated as plain objects. Their own enumerable keys are converted, prototype methods are not preserved on the result.

## Reference

The camelToSnake regular expression is based on:
<https://stackoverflow.com/a/77731548>

## Licence

MIT
