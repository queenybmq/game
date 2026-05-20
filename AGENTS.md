# Repository Guidelines

## Project Structure & Module Organization

This repository is a dependency-free static browser game. The main files live at the repository root:

- `index.html`: DOM structure, overlays, HUD, controls, and Traditional Chinese UI copy.
- `styles.css`: global layout, responsive overlay styling, HUD treatment, theme variables, and animations.
- `game.js`: canvas game loop, state management, enemy waves, upgrades, settings, storage, and input handling.
There is currently no dedicated `src/`, `tests/`, or `assets/` directory. If the project grows, add runtime assets under `assets/` and keep test files under `tests/` or beside the module they cover.

## Build, Test, and Development Commands

No package manager or build step is required.

- Open `index.html` directly in a browser to run the game.
- `python3 -m http.server 8000` starts a local static server from the repo root; visit `http://127.0.0.1:8000/`.
- `git status --short` checks local changes before committing.

Avoid adding npm, bundlers, or external libraries unless clearly needed.

## Coding Style & Naming Conventions

Use 2-space indentation in HTML, CSS, and JavaScript. Keep JavaScript inside the existing IIFE pattern in `game.js` unless a larger module split is introduced. Prefer `const` for fixed values, `let` for mutable state, camelCase for variables and functions, and uppercase names for shared constants such as `BALANCE` and `QUALITY_PRESETS`.

CSS class names use kebab-case, while DOM IDs use camelCase. Keep shared theme colors in `:root`. When changing UI elements, keep `index.html` IDs synchronized with `requiredElement(...)` lookups in `game.js`.

## Testing Guidelines

There is no automated test framework yet. For every gameplay change, manually verify: new game, pause/resume, settings, level up, game over, record persistence, and narrow and desktop viewports. For rendering or input changes, test mouse movement, left-click active skill use, and `P`, `Esc`, and `O` shortcuts.

## Commit & Pull Request Guidelines

Recent commits use short imperative messages, for example `Add dark theme styles for game interface` and `Enhance upgrade card UI with progress indicators and improved styling`. Follow that style: start with a verb, describe the visible change, and avoid vague messages like `fix stuff`.

Pull requests should include a concise summary, manual test notes, linked issues when applicable, and screenshots or recordings for UI or gameplay changes.

## Agent-Specific Instructions

Keep edits tightly scoped. Do not reformat the large `game.js` file unless formatting is the task. Preserve Traditional Chinese player-facing copy unless the requested change explicitly updates language.
