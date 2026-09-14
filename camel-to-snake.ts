type IsUpper<C extends string> = C extends Uppercase<C> ? (C extends Lowercase<C> ? false : true) : false;
type IsLower<C extends string> = C extends Lowercase<C> ? (C extends Uppercase<C> ? false : true) : false;
type IsAlpha<C extends string> = IsUpper<C> extends true ? true : IsLower<C> extends true ? true : false;

export type CamelToSnake<S extends string> = Lowercase<
    S extends `${infer C1}${infer C2}${infer C3}${infer Rest}`
        ? IsLower<C1> extends true
            ? IsUpper<C2> extends true
                ? IsAlpha<C3> extends true
                    ? `${C1}_${CamelToSnake<`${C2}${C3}${Rest}`>}`
                    : `${C1}${CamelToSnake<`${C2}${C3}${Rest}`>}`
                : `${C1}${CamelToSnake<`${C2}${C3}${Rest}`>}`
            : IsUpper<C1> extends true
              ? IsUpper<C2> extends true
                  ? IsLower<C3> extends true
                      ? `${C1}_${CamelToSnake<`${C2}${C3}${Rest}`>}`
                      : `${C1}${CamelToSnake<`${C2}${C3}${Rest}`>}`
                  : `${C1}${CamelToSnake<`${C2}${C3}${Rest}`>}`
              : `${C1}${CamelToSnake<`${C2}${C3}${Rest}`>}`
        : S
>;

export type SnakeKeys<T> = T extends Date
    ? T
    : T extends Array<infer U>
      ? Array<SnakeKeys<U>>
      : T extends object
        ? { [K in keyof T as CamelToSnake<K & string>]: SnakeKeys<T[K]> }
        : T;

/**
 * @see {@link https://stackoverflow.com/a/77731548}
 */
export function camelToSnake<T extends string>(str: T): CamelToSnake<T> {
    if (typeof str !== "string") {
        throw new TypeError("Expected input type to be a string");
    }
    return str.replace(/(([a-z])(?=[A-Z][a-zA-Z])|([A-Z])(?=[A-Z][a-z]))/g, "$1_").toLowerCase() as CamelToSnake<T>;
}

/**
 * Recursively converts every camelCase object key to snake_case.
 */
export function camelKeyToSnake<T>(sourceObj: T): SnakeKeys<T> {
    return camelKeyToSnakeImpl(sourceObj, new WeakMap()) as SnakeKeys<T>;
}

function camelKeyToSnakeImpl(sourceObj: unknown, seen: WeakMap<object, unknown>): unknown {
    if (sourceObj == null || typeof sourceObj != "object") {
        return sourceObj;
    }

    if (sourceObj instanceof Date) {
        return sourceObj;
    }

    if (seen.has(sourceObj)) {
        return seen.get(sourceObj);
    }

    if (Array.isArray(sourceObj)) {
        const result: unknown[] = [];
        seen.set(sourceObj, result);

        sourceObj.forEach(function (item, i) {
            result[i] = camelKeyToSnakeImpl(item, seen);
        });

        return result;
    }

    const temp: Record<string, unknown> = {};
    seen.set(sourceObj, temp);

    Object.keys(sourceObj).forEach(function (key) {
        const keySnakeCase = camelToSnake(key);
        temp[keySnakeCase] = camelKeyToSnakeImpl((sourceObj as Record<string, unknown>)[key], seen);
    });

    return temp;
}
