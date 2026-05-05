---
kanban-plugin: board
project: obsidian-faru
version: "0.2.0"
updated: 2026-05-05
priorities:
  P0: Critique (bloquant)
  P1: Élevée (important)
  P2: Moyenne (utile)
  P3: Faible (nice-to-have)
efforts:
  XS: "< 30min"
  S: 1-2h
  M: 2-4h
  L: 4-8h
  XL: 1-2j
prefixes:
  FEAT: Nouvelles fonctionnalités
  QA: Qualité et tests
  DEPLOY: Mise en production
---

## Backlog

- [ ] #DEPLOY-001 [P2] Préparer soumission Obsidian Community Plugins #deploy #effort-xl
- [ ] #DOC-001 [P3] Documentation utilisateur complète (guide + screenshots) #docs #effort-l

## Todo

- [ ] #FEAT-002 [P1] Vue archive — cartes done archivées #src/views/BoardView.ts #effort-m

  **Zone** : `src/views/BoardView.ts` + `src/parser.ts`
  **Effort** : M (2-4h)
  **Dépendances** : #FEAT-001

  **Checklist** :
  - [ ] `isArchived = status === 'done' && daysSince(edited) >= archiveDoneAfterDays`
  - [ ] Exclure les cartes archivées du board principal par défaut
  - [ ] Toggle ou filtre dans FilterBar pour afficher/masquer l'archive

- [ ] #FEAT-003 [P1] Responsive mobile — media query 600px #styles.css #effort-s

  **Zone** : `styles.css`
  **Effort** : S (1-2h)

  **Checklist** :
  - [ ] `@media (max-width: 600px)` → `.faru-board` en `flex-direction: column`
  - [ ] `.faru-column` → `min-width: unset; width: 100%`
  - [ ] Tester sur Obsidian Mobile

- [ ] #QA-001 [P1] Audit listeners vault — no double registration #src/main.ts #effort-s

  **Zone** : `src/main.ts`
  **Effort** : S (1-2h)

  **Checklist** :
  - [ ] Tous les `vault.on()` passent par `registerEvent()`
  - [ ] `refresh()` ne ré-enregistre pas de listeners
  - [ ] Vérifier `onunload()` — aucun listener orphelin
  - [ ] Test : toggle plugin off/on dans Obsidian Settings

- [ ] #QA-002 [P2] Tests thème clair/sombre et Obsidian Mobile #styles.css #effort-s

  **Zone** : `styles.css` + tests manuels
  **Effort** : S (1-2h)
  **Dépendances** : #FEAT-003

  **Checklist** :
  - [ ] Aucune couleur codée en dur (tout via variables Obsidian)
  - [ ] Basculer thème clair ↔ sombre : badges OK
  - [ ] Test Obsidian Mobile iOS/Android : colonnes empilées, drag & drop

## In Progress

- [~] #FEAT-001 [P1] Bannière weekly-goal.md au-dessus du board #src/views/BoardView.ts #effort-m <!--started:2026-05-05-->

## Blocked

## Review

## Done

- [x] #SETUP-001 Initialiser package.json, esbuild, tsconfig, vitest <!--done:2026-05-04-->
- [x] #P0-001 Types et interfaces (FaruConfig, FaruCard, FaruColumn, FaruSettings) <!--done:2026-05-04-->
- [x] #P0-002 loadFaruConfig() avec fallback FARU_DEFAULTS <!--done:2026-05-04-->
- [x] #P0-003 FaruSettingTab (configPath + defaultAssignee) <!--done:2026-05-04-->
- [x] #P0-004 resolveCardFile() — priorité 4 niveaux <!--done:2026-05-04-->
- [x] #P0-005 parseBacklog() — scan vault, frontmatter, tri date <!--done:2026-05-04-->
- [x] #P0-006 BoardView — squelette ItemView + 3 colonnes <!--done:2026-05-04-->
- [x] #P0-007 CardTile — rendu DOM (titre, badges) <!--done:2026-05-04-->
- [x] #P0-008 Drag & drop HTML5 entre colonnes <!--done:2026-05-04-->
- [x] #P0-009 moveCard() — processFrontMatter() status + edited <!--done:2026-05-04-->
- [x] #P0-010 main.ts — onload(), activateView(), debounce 300ms <!--done:2026-05-04-->
- [x] #P0-011 Styles P0 (board, columns, cards, badges) <!--done:2026-05-04-->
- [x] #P0-012 Tests P0 (parser 15 tests, moveCard 2 tests, createCard 7 tests) <!--done:2026-05-04-->
- [x] #P1-001 parseMilestones() + badge ● N/M <!--done:2026-05-04-->
- [x] #P1-002 FilterBar — select multiple type + assignee <!--done:2026-05-04-->
- [x] #P1-003 createCard() — normalisation nom, createFolder, CARD.md <!--done:2026-05-04-->
- [x] #P1-004 Modal création carte depuis bouton + colonne <!--done:2026-05-04-->
- [x] #P1-005 Styles P1 (milestone badge, filter bar) <!--done:2026-05-04-->
- [x] #FIX-001 4 bugs corrigés post code review <!--done:2026-05-05-->
- [x] #SETUP-002 Faru backlog dogfooding (faru.config.json + backlog/ + weekly-goal.md) <!--done:2026-05-05-->

## Archive

%% kanban:settings
{"kanban-plugin":"board","list-collapse":[false,false,false,false,false,true,true]}
%%
