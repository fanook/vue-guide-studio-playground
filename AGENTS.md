# Repository Guidelines

## Project Structure & Module Organization
Vue 3 source files live in `src/`, with `src/main.js` bootstrapping the app and `src/App.vue` holding the root layout. Components belong in `src/components/`; keep related icons or helpers inside subfolders such as `src/components/icons/`. Importable assets reside in `src/assets/`, while anything that must ship unchanged (favicons, manifest) belongs in `public/`. When adding sizable features, group composables or utilities next to the component that consumes them so reviewers can scan one directory for the full change.

## Build, Test, and Development Commands
- `npm install`: install dependencies listed in `package.json` (Node 20.19+ or 22.12+).
- `npm run dev`: launch the Vite dev server with hot reload for iterative work.
- `npm run build`: produce an optimized bundle in `dist/`; run before merging significant UI changes.
- `npm run preview`: serve the production build locally to confirm deploy behavior.

## Coding Style & Naming Conventions
Stick with `<script setup>` and Composition API patterns already present in `App.vue`. Use two-space indentation, align markup closing tags, and trim unused imports (Vite flags them). Name components in PascalCase (`FeaturePanel.vue`) and refer to them in templates with PascalCase as well. Keep utility modules and assets in kebab-case (`user-avatar.svg`, `date-tools.js`). Favor Prettier defaults or VS Code’s Vue extension formatting so diffs stay minimal.

## Testing Guidelines
Automated testing is not yet wired in; document manual verification steps in each pull request. When introducing a test runner such as Vitest, colocate specs under `src/__tests__/` or alongside the component (`ComponentName.spec.js`) and add a matching `npm run test` script. Surface new testing dependencies and setup steps in the PR description so the team can reproduce the checks locally.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) and keep scopes short but descriptive. Pull requests should explain the problem, outline the solution, and attach evidence—screenshots, console output, or a brief Loom demo. Link related issues, call out breaking changes, and split sweeping work into smaller PRs when practical.

## Environment & Configuration Tips
`vite.config.js` is the single source for build tweaks; update aliases or base paths there instead of scattering constants. Store secrets in `.env.local` (gitignored) and reference them via `import.meta.env`. If the team standardizes on a Node runtime, add an `.nvmrc` to guide contributors’ toolchains.
