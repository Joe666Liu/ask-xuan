# Workflow

## Git Hygiene

- Check `git status --short` before and after edits.
- Preserve user changes. Do not revert or overwrite work you did not make.
- Keep changes scoped to the request.
- Do not reformat unrelated files.

## Validation

- Use `pnpm run check` for Biome checks.
- Use `pnpm test` when changing tested logic or adding tests.
- Use `pnpm run build` when changing routing, server functions, build config,
  generated content, deployment behavior, or production output.
- Do not run builds or full test suites after every small edit. Batch validation
  at the end of a coherent change unless the feedback is needed immediately.
- If validation cannot be run, state why and name the command that should be
  run.

## Command Reference

- `pnpm dev`: start the Vite dev server on port 3377.
- `pnpm run check`: run Biome checks.
- `pnpm run build`: run the production build.
- `pnpm test`: run Vitest.
- `pnpm db:generate`: generate Drizzle migrations.
- `pnpm db:migrate`: run Drizzle migrations.
- `pnpm db:studio`: open Drizzle Studio.

## Development Server

- `pnpm dev` starts the Vite dev server on port 3377.
- The dev server runs indefinitely; stop it when it is no longer needed.
- If port 3377 is occupied, use the next available port and report it.

## Generated And External Files

- Do not edit `src/routeTree.gen.ts` manually.
- Do not edit `.intlayer/` manually.
- Do not edit `.output/` manually.
- Do not edit `node_modules/`.
- Do not commit secrets, tokens, credentials, private keys, or local auth
  artifacts.

## UI Verification

For user-facing UI changes:

- Verify desktop and mobile behavior where practical.
- Check keyboard focus and accessible names for interactive controls.
- Check loading, empty, error, disabled, and long-content states when touched.
- Use rendered verification for visual claims; source inspection alone is not a
  visual check.
