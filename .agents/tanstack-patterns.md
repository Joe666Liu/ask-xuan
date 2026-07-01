# TanStack Patterns

## Routes

- Routes live in `src/routes/`.
- Route files use `createFileRoute`.
- `src/routeTree.gen.ts` is generated. Never edit it manually.
- Keep route files focused on route concerns: route config, search validation,
  loader wiring, and route-level composition.

## Loaders

- Prefer route loaders for route-owned data.
- Do not fetch loader-owned data with `useEffect` and local state.
- Loaders are isomorphic and can run on both server and client.
- Do not import database clients, `fs`, secrets, or other server-only modules
  directly into route loaders.
- Use server functions for server-only work that loaders need.

Bad:

```ts
import { db } from "@/db";

export const Route = createFileRoute("/admin/users")({
  loader: () => db.query.users.findMany(),
});
```

Good:

```ts
import { listUsers } from "@/actions/user.action";

export const Route = createFileRoute("/admin/users")({
  loader: () => listUsers(),
});
```

## loaderDeps

- Keep `loaderDeps` specific to the search params that actually affect loader
  output.
- Exclude UI-only search state from `loaderDeps` when it should not invalidate
  loader data.
- Pull loader dependency values from `deps`, not by reading hooks inside the
  loader.

Bad:

```ts
export const Route = createFileRoute("/posts")({
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listPosts(deps),
});
```

Good:

```ts
export const Route = createFileRoute("/posts")({
  loaderDeps: ({ search }) => ({
    page: search.page,
    q: search.q,
  }),
  loader: ({ deps }) => listPosts(deps),
});
```

## Server Functions

- Use TanStack Start `createServerFn` for server-side work.
- Put direct database, secret, filesystem, and provider SDK calls behind server
  functions or server-only modules called by server functions.
- Keep server function input validation close to the boundary.
- Prefer shared action/server-function modules over duplicating server logic in
  route files.

## Server-only Imports

- Code outside a `createServerFn` handler may be included in both client and
  server bundles.
- Keep secrets, database clients, filesystem access, and provider SDK calls
  inside server-function handlers or modules that are only imported there.
- `createServerFn` wrappers can be imported statically by routes and
  components.
- Do not dynamically import server-only code from client components.

Bad:

```ts
const apiKey = process.env.PROVIDER_API_KEY;

export const callProvider = createServerFn().handler(async () => {
  return fetchProvider(apiKey);
});
```

Good:

```ts
export const callProvider = createServerFn().handler(async () => {
  const { fetchProvider } = await import("@/integrations/provider.server");
  const apiKey = process.env.PROVIDER_API_KEY;
  return fetchProvider(apiKey);
});
```

## API Routes And React Query

- Use route loaders for route-owned data that should be available during route
  rendering.
- Use React Query for client-driven server state, shared widgets, repeated
  refetching, mutations, cache invalidation, and data that is not owned by a
  single route loader.
- Use API routes under `src/routes/api/` for HTTP endpoints, webhooks, external
  integrations, and public API surfaces.
- Keep auth, validation, and error mapping at API/server-function boundaries.
- Do not create an API route just to call it from a loader when a server
  function is the simpler boundary.
- Follow existing `@tanstack/react-router-ssr-query` patterns when SSR and
  React Query need to share cache state.

## URL State

- Use URL search params for state that should survive refresh, navigation,
  sharing, filters, tabs, pagination, or expanded panels.
- Use local React state for local-only UI state that does not need to be shared
  or restored.

## Navigation

- Use TanStack Router `Link` or `navigate` for internal navigation.
- Do not use `<div onClick>` for navigation.
- Preserve existing search params when navigation behavior depends on them.

## Parent Loader Data

- Reuse parent loader data with TanStack Router APIs instead of refetching in
  child components.
- Keep loader-derived values stable and pass them into client components instead
  of mirroring them with `useEffect` + `useState`.
