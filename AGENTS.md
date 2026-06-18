<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Agent Skills Guidelines

To maintain code simplicity, correct database patterns, and high visual quality, agents must adhere to the following rules regarding skills:
- **Code Simplicity:** Always use the `ponytail` skill when writing code to prevent over-engineering, bloat, and unnecessary dependencies.
- **Database & Backend:** Always use the appropriate `convex` skills (e.g., `convex-migration-helper`, `convex-create-component`) when touching the schema, migrations, or database queries.
- **UI & Styling:** Always use the `design-taste-frontend` (taste) skill for styling and user interface work to ensure custom, high-quality, and modern layouts.

## Mandatory Code Validation Rule

Before declaring any coding task complete, you MUST execute the non-interactive quality validation script:
```bash
npm run validate
```
This script runs the following sequence under non-interactive modes:
1. `npx biome check --write .` (code formatting and lint checks)
2. `npx knip` (dead code check)
3. `npx react-doctor -y --verbose` (non-interactive React environment and rules check)

Ensure that all tools report zero errors/warnings before presenting the solution. Do not run interactive versions of these tools.
