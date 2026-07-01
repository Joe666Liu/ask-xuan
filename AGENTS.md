<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Agent Guidelines

Ask Xuan is an AI SaaS starter built with TanStack Start.

## Essentials

- Package manager: `pnpm`
- Preserve user changes. Do not revert or overwrite work you did not make.
- Run focused validation, not after every tiny edit
- Do not edit generated output such as `src/routeTree.gen.ts`, `.intlayer/`,
  `.output/`, or `node_modules/` manually
- **Typesafety is paramount.** Never cast around type errors; fix at source
  instead. See [.agents/typescript.md](./.agents/typescript.md)

## Topic Guides

- [TypeScript Conventions](./.agents/typescript.md): Type inference, casting
  rules, generic naming
- [TanStack Patterns](./.agents/tanstack-patterns.md): Routes, loaders, server
  functions, URL state
- [UI Style Guide](./.agents/ui-style.md): Visual design principles for 2026
- [Web Interface Guidelines](./.agents/web-interface-guidelines.md):
  Accessibility, interaction, responsive behavior, performance
- [Workflow](./.agents/workflow.md): Commands, validation, generated files,
  local development
