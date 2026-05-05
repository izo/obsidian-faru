# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`obsidian-faru` is an Obsidian plugin that renders a 3-column kanban board (Todo / WIP / Done) for [Faru](https://github.com/fluado/faru) backlogs — a git-native card system where each card is a folder inside `backlog/` containing Markdown files with YAML frontmatter.

The plugin reads `faru.config.json` from the vault root, scans `backlogDir`, parses card folders, and lets users move cards between columns via HTML5 drag & drop (updating `status` in the frontmatter using Obsidian's `processFrontMatter()` API).

## Commands

```bash
npm run dev        # watch build (esbuild, outputs main.js)
npm run build      # production build
npm run test       # run all vitest tests
npx vitest run src/parser.test.ts   # run a single test file
```

The build outputs `main.js`, `manifest.json`, and `styles.css` at the repo root — the three files Obsidian loads from the plugin directory.

## Architecture

### Data flow

```
faru.config.json
      │
      ▼
  settings.ts  ─── resolves backlogDir, cardCategories
      │
      ▼
  parser.ts    ─── scans vault, parses CARD.md frontmatter, computes milestone ratios
      │
      ▼
  BoardView.ts ─── ItemView with 3 columns, FilterBar, CardTile components
      │
      ├─ drag & drop ──▶ actions/moveCard.ts   (processFrontMatter)
      └─ create modal ──▶ actions/createCard.ts (vault.createFolder + vault.create)
```

### Key files

| File | Responsibility |
|------|---------------|
| `src/main.ts` | Plugin entry: registers the `BoardView` ItemView, ribbon icon, command, settings tab, and vault event listeners for live reload |
| `src/settings.ts` | `FaruSettingTab` (Obsidian settings UI) + reads `faru.config.json` at load time |
| `src/types.ts` | `FaruCard`, `FaruConfig`, `FaruColumn` interfaces — single source of truth for data shapes |
| `src/parser.ts` | Pure logic: resolves the primary `.md` file per card folder, parses frontmatter, calculates milestone progress |
| `src/views/BoardView.ts` | `ItemView` subclass; orchestrates columns, wires drag events, calls parser and renders everything |
| `src/views/CardTile.ts` | Renders a single card DOM element (title, type badge, assignee, milestone indicator) |
| `src/views/FilterBar.ts` | Type / assignee filter dropdowns; emits filter state back to `BoardView` |
| `src/actions/moveCard.ts` | Updates `status` and `edited` in frontmatter via `app.fileManager.processFrontMatter()` |
| `src/actions/createCard.ts` | Creates the `YYYY-MM-DD-TYPE-TITLE` folder + `CARD.md` with default frontmatter |

### Vault event live reload

`main.ts` registers `vault.on('modify' | 'create' | 'delete' | 'rename')`. All handlers debounce at **300 ms minimum** before triggering a full re-render of the board. This is critical — vault events fire very frequently.

### Primary file resolution (per card folder)

`parser.ts` selects the card's primary `.md` in this priority order:
1. `*-milestones.md`
2. `CARD.md`
3. `*-spec.md`
4. First `.md` found

### Milestone calculation

If a card folder contains `PREFIX-milestones.md`, count headings matching `## PREFIX-N:` for total, then count existing `PREFIX-N-report.md` files for completed. Displayed as `● completed/total`.

## Hard constraints

- **Zero external dependencies** — only `obsidian` (and its bundled types) is allowed. No React, Svelte, or any UI framework.
- **Vanilla DOM only** — build elements with `document.createElement` / `el.createEl` (Obsidian helper). No template engines.
- **`processFrontMatter()` is the only allowed way to write frontmatter** — never use regex or string replace on raw file content.
- **Never write files outside `backlogDir`** — the sole exception is `weekly-goal.md` at the vault root (P2 feature).
- **Card folder naming**: `YYYY-MM-DD-TYPE-TITLE` where TYPE is uppercase and TITLE words are separated by hyphens in uppercase (e.g. `2026-05-04-PRODUCT-OAUTH-LOGIN`).
- **Mobile compatibility** — columns must stack vertically below 600 px viewport width.

## Faru data conventions

**`faru.config.json`** (vault root):
```json
{
  "backlogDir": "./backlog",
  "port": 3333,
  "cardCategories": ["feat", "fix", "qa", "docs"],
  "autoSync": true,
  "archiveDoneAfterDays": 14
}
```
Fields read by the plugin: `backlogDir`, `cardCategories`, `archiveDoneAfterDays`.
Fields ignored by the plugin (Faru CLI only): `port`, `autoSync`.
Defaults when absent: `backlogDir = "./backlog"`, `cardCategories = ["product", "ops", "bug"]`, `archiveDoneAfterDays = 14`.

**Card frontmatter** (`CARD.md`):
```yaml
---
title: Implement OAuth flow
type: product
status: todo | wip | done
assigned: alice
created: 2026-05-04
edited: 2026-05-04
description: One-line summary.
links:
  - specs/oauth-design.md
---
```
Invalid `status` values are treated as `todo`. Cards with unparseable frontmatter are silently ignored (console log only).

## Styling

`styles.css` uses only Obsidian CSS variables (`--background-primary`, `--text-normal`, `--interactive-accent`, etc.) — no hardcoded colours. Type badge colours are generated via a hash of the category name or a fixed palette of 6 CSS custom properties. Key classes: `.faru-board`, `.faru-column`, `.faru-card`, `.faru-badge-type`, `.faru-badge-assignee`, `.faru-badge-milestone`, `.faru-filter-bar`.

## Manifest

```json
{
  "id": "obsidian-faru",
  "name": "Faru",
  "version": "0.1.0",
  "minAppVersion": "1.4.0",
  "isDesktopOnly": false
}
```

## Tests

Unit tests use **vitest** and cover `parser.ts` (backlog scanning, primary file resolution, milestone calculation), `actions/moveCard.ts` (frontmatter update with mocked vault), and `actions/createCard.ts` (folder naming convention).

## Development state

- **P0 + P1** : fully implemented and tested (24 tests passing)
- **P2 + quality** : tracked in `backlog/` (5 cards) and `docs/todo.md`
- **Build artifacts** : `main.js` is gitignored — run `npm install && npm run build` after cloning
- **Dogfooding** : this repo uses its own Faru backlog (`backlog/`, `faru.config.json`, `weekly-goal.md`) to track remaining work
