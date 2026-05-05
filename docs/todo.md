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

- [ ] #AUD-001 [P0] Réécrire createCard pour utiliser processFrontMatter #src/actions/createCard.ts #effort-s

  **Source** : Audit code 2026-05-05 — CRITIQUE
  **Problème** : Frontmatter construit par concaténation de chaînes → YAML invalide possible + violation de la contrainte fondamentale du projet
  **Checklist** :
  - [ ] Créer le fichier vide avec `vault.create(filePath, '')`
  - [ ] Injecter les champs via `app.fileManager.processFrontMatter()`
  - [ ] Supprimer `yamlEscape` devenu inutile

- [ ] #AUD-002 [P0] Corriger path traversal backlogDir + configPath #src/settings.ts #effort-s

  **Source** : Audit sécurité 2026-05-05 — HAUTE (bloquant catalogue Obsidian)
  **Problème** : `../` non neutralisé → lecture de fichiers hors vault possible
  **Checklist** :
  - [ ] Ajouter validation anti-traversal sur `backlogDir` (refuser tout segment `..`)
  - [ ] Ajouter même validation sur `configPath` dans settings.ts
  - [ ] Valider les types des champs de faru.config.json après JSON.parse

- [ ] #AUD-003 [P0] Alternative clavier pour le drag & drop #src/views/BoardView.ts #effort-m

  **Source** : Audit a11y 2026-05-05 — WCAG SC 2.1.1 niveau A (CRITIQUE)
  **Problème** : Déplacer une carte est impossible sans souris
  **Checklist** :
  - [ ] Ajouter bouton "Déplacer" sur chaque carte avec menu listbox (colonnes cibles)
  - [ ] Navigation clavier dans le menu (Arrow keys, Enter, Escape)
  - [ ] Utiliser MIME type `application/x-faru-card` pour le dataTransfer (sécu)

- [ ] #AUD-004 [P1] Remplacer modal custom par Obsidian Modal API #src/views/BoardView.ts #effort-s

  **Source** : Audit code 2026-05-05 — HAUTE + Audit a11y WCAG SC 2.1.2 niveau A
  **Problème** : Modal `<div>` sans lifecycle, sans focus trap, sans Escape, sans role="dialog"
  **Checklist** :
  - [ ] Utiliser `new Modal(this.app)` avec `onOpen()` / `onClose()`
  - [ ] Ajouter `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
  - [ ] Focus automatique sur le premier champ à l'ouverture

- [ ] #AUD-005 [P1] Cartes et badges accessibles au clavier #src/views/CardTile.ts #effort-s

  **Source** : Audit a11y 2026-05-05 — WCAG SC 2.1.1 + SC 4.1.2 niveau A
  **Checklist** :
  - [ ] `role="article"` + `tabindex="0"` + `aria-label` sur chaque carte
  - [ ] `keydown` Enter/Space → ouvrir le fichier
  - [ ] `role="button"` + `tabindex="0"` + `aria-label` sur le badge milestone
  - [ ] `keydown` Enter/Space → ouvrir le fichier milestones
  - [ ] Ajouter `:focus-visible` sur tous les éléments interactifs (styles.css)

- [ ] #AUD-006 [P1] Corriger contraste badges couleur (5/6 échouent WCAG AA) #styles.css #effort-xs

  **Source** : Audit a11y 2026-05-05 — WCAG SC 1.4.3 niveau AA
  **Problème** : Texte `#fff` sur fonds `--faru-cat-0/1/2/3/5` → ratio < 4.5:1
  **Checklist** :
  - [ ] Foncer `--faru-cat-0` à `#1a5fa8` (ratio ~6.5:1)
  - [ ] Foncer `--faru-cat-1` à `#1a7a42` (ratio ~5.8:1)
  - [ ] Foncer `--faru-cat-2` à `#b52a1c` (ratio ~6.1:1)
  - [ ] Foncer `--faru-cat-3` à `#9a5200` (ratio ~5.2:1)
  - [ ] Foncer `--faru-cat-5` à `#0d6b58` (ratio ~5.4:1)

- [ ] #AUD-007 [P1] Séparer render() de refresh() — filtres sans re-parse #src/views/BoardView.ts #effort-s

  **Source** : Audit performance 2026-05-05 — CRITIQUE
  **Problème** : Changement de filtre déclenche re-parse complet du vault inutilement
  **Checklist** :
  - [ ] Créer `renderBoard(cards: FaruCard[])` pour la partie DOM uniquement
  - [ ] `refresh()` = I/O + renderBoard
  - [ ] `onFilterChange()` = renderBoard(applyFilters(this.cards)) sans I/O
  - [ ] Ne recharger `faru.config.json` que si `configChanged === true`

- [ ] #AUD-008 [P1] Paralléliser adapter.list dans parseBacklog #src/parser.ts #effort-s

  **Source** : Audit performance 2026-05-05 — CRITIQUE
  **Problème** : N+1 appels I/O séquentiels → lent sur 30+ cartes
  **Checklist** :
  - [ ] Remplacer `for...of await` par `Promise.all` pour les listings de dossiers-cartes
  - [ ] Stocker `milestonesFilePath` dans `FaruCard` (évite `vault.getFiles()` au clic)
  - [ ] Ajouter debounce maxWait 2000ms pour les rafales d'événements vault

- [ ] #AUD-009 [P1] Corriger labels filtres + propagation refresh settings #src/views/FilterBar.ts #effort-xs

  **Source** : Audit code + a11y 2026-05-05
  **Checklist** :
  - [ ] Associer `<label for="...">` aux `<select>` dans FilterBar (a11y WCAG SC 1.3.1)
  - [ ] Appeler `scheduleRefresh()` sur BoardView après changement de configPath dans settings.ts
  - [ ] Extraire `formatDate` en utilitaire partagé (supprime duplication moveCard/createCard)

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
- [x] #DEPLOY-001 Soumission Obsidian Community Plugins — PR #12559 ouverte <!--done:2026-05-05-->
- [x] #FEAT-004 [P0] Refonte densité & lisibilité des cartes (typo, line-clamp, badge conditionnel, empty states) <!--done:2026-05-05-->
- [x] #FEAT-001 [P1] Bannière weekly-goal.md au-dessus du board <!--done:2026-05-05-->
- [x] #FEAT-005 [P1] Refonte filter bar en pill-toggles (cohérence badges, a11y) <!--done:2026-05-05-->

## Archive

%% kanban:settings
{"kanban-plugin":"board","list-collapse":[false,false,false,false,false,true,true]}
%%
