# TypeScript

## Type Safety

- Do not cast around type errors.
- Prefer fixing the type source: schema, return type, API definition, or
  function signature.
- Use `unknown` at unsafe boundaries and narrow it with type guards or schemas.
- Avoid `any` unless a third-party boundary makes it unavoidable.

## Type Inference

Prefer inference from the most authoritative source:

1. Runtime schema or validated boundary.
2. Function return type.
3. API/server-function response type.
4. Component props.

Do not duplicate types that can be inferred from existing schemas or functions.

## Casting

- Avoid `as` assertions.
- Avoid manual generic parameters when inference can work.
- Use `as const` only for literal narrowing.
- If a third-party type requires a cast, keep it local and add a short comment
  explaining the boundary.

## Project Exceptions

- `as const` is acceptable for literal config, route maps, event names, and
  token-like objects where literal narrowing is the point.
- `satisfies` is acceptable for validating object shapes without widening
  literals.
- Local casts are acceptable at third-party boundaries when the library type is
  less precise than runtime behavior, including provider SDKs, Radix/shadcn
  adapter props, generated route unions, and browser APIs.
- Keep any exception close to the boundary. Do not let a cast leak into general
  business logic.

## Generic Names

Generic type parameters should be prefixed with `T`.

Examples: `T`, `TData`, `TError`, `TValue`, `TKey`, `TArgs`, `TReturn`.

## Error Handling

- In `catch` blocks, treat caught errors as `unknown`.
- Use `instanceof Error`, property checks, or schema validation before reading
  fields.
- Do not assume provider/API error shapes without narrowing.
