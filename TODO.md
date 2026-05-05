# TODO — obsidian-faru

Tâches d'implémentation par priorité. Voir CDC.txt pour le périmètre complet et SPECS.md pour les contrats d'implémentation.

---

## Setup initial

- [ ] Initialiser `package.json` (scripts `dev`, `build`, `test`)
- [ ] Configurer `esbuild.config.mjs` (entrée `src/main.ts`, sortie `main.js`, external `obsidian`)
- [ ] Configurer `tsconfig.json` (strict, target ES2018, moduleResolution node)
- [ ] Ajouter `vitest.config.ts`
- [ ] Créer `manifest.json` (`id: obsidian-faru`, `minAppVersion: 1.4.0`, `isDesktopOnly: false`)
- [ ] Créer `styles.css` vide avec les 6 variables `--faru-cat-N`

---

## P0 — MVP fonctionnel

### Types et config
- [ ] `src/types.ts` — interfaces `FaruConfig`, `FaruCard`, `FaruColumn`, `FaruSettings`, constantes `FARU_VIEW_TYPE` et `FARU_DEFAULTS`
- [ ] `src/settings.ts` — `loadFaruConfig()` avec fallback sur `FARU_DEFAULTS`
- [ ] `src/settings.ts` — `FaruSettingTab` (champs `configPath` et `defaultAssignee`)

### Parser
- [ ] `src/parser.ts` — `resolveCardFile()` (priorité 4 niveaux)
- [ ] `src/parser.ts` — `parseBacklog()` (scan dossier, lecture frontmatter via `metadataCache`, tri par date)

### Vue kanban
- [ ] `src/views/BoardView.ts` — squelette `ItemView` (`getViewType`, `getDisplayText`, `getIcon`, `onOpen`)
- [ ] `src/views/BoardView.ts` — `refresh()` + `render()` avec les 3 colonnes statiques
- [ ] `src/views/CardTile.ts` — rendu DOM d'une carte (titre, type badge, assignee)
- [ ] `src/views/BoardView.ts` — drag & drop HTML5 entre colonnes
- [ ] `src/actions/moveCard.ts` — mise à jour `status` + `edited` via `processFrontMatter()`

### Plugin principal
- [ ] `src/main.ts` — `onload()` complet (vue, ruban, commande, settings tab, listeners vault)
- [ ] `src/main.ts` — `onFileChange()` avec debounce 300 ms
- [ ] `src/main.ts` — `activateView()` (ouvre ou focus le leaf)

### Styles P0
- [ ] `.faru-board` — flex horizontal, gap 12px, hauteur 100%
- [ ] `.faru-column` — flex vertical, flex: 1, min-width 200px, overflow-y auto
- [ ] `.faru-column-header` — titre + compteur
- [ ] `.faru-card` — border-radius, padding, cursor grab, variables Obsidian
- [ ] `.faru-card.drag-over` — outline accent
- [ ] `.faru-badge-type` — pill colorée via `--faru-cat-N`
- [ ] `.faru-badge-assignee` — texte muted avec `@`

### Tests P0
- [ ] `src/parser.test.ts` — `resolveCardFile()` : les 4 cas de priorité
- [ ] `src/parser.test.ts` — `parseBacklog()` : status invalide → `'todo'`, frontmatter manquant → ignoré
- [ ] `src/actions/moveCard.test.ts` — mock vault, vérifier que `status` et `edited` sont mis à jour

---

## P1 — Fonctionnalités secondaires

### Milestones
- [ ] `src/parser.ts` — `parseMilestones()` (count headings `## PREFIX-N:`, check fichiers report)
- [ ] `src/views/CardTile.ts` — badge `.faru-badge-milestone` (`● N/M`)
- [ ] Clic sur badge milestone → ouvre `*-milestones.md`
- [ ] `src/parser.test.ts` — `parseMilestones()` : ratio correct, absent → `undefined`

### Filtres
- [ ] `src/views/FilterBar.ts` — `<select multiple>` type et assignee
- [ ] `src/views/BoardView.ts` — appliquer les filtres au render (sans re-fetch)
- [ ] Déduction dynamique de la liste des assignees depuis les cartes chargées

### Création de carte
- [ ] `src/actions/createCard.ts` — normalisation du nom de dossier, `createFolder`, création `CARD.md`
- [ ] `src/views/BoardView.ts` — bouton `+` par colonne → modal de création (champs titre, type, assignee)
- [ ] `src/actions/createCard.test.ts` — convention de nommage : espaces, caractères spéciaux, casse

### Styles P1
- [ ] `.faru-badge-milestone` — `●` + ratio
- [ ] `.faru-filter-bar` — flex row, gap 8px, padding-bottom 8px

---

## P2 — Fonctionnalités avancées

- [ ] `src/views/BoardView.ts` — bannière `weekly-goal.md` (lecture + bouton edit)
- [ ] Vue archive — filtrer les cartes `done` archivées (`edited` + `archiveDoneAfterDays`)
- [ ] Styles P2 — `.faru-weekly-goal`

---

## Responsive / Mobile

- [ ] `styles.css` — media query `max-width: 600px` : colonnes en `flex-direction: column`

---

## Qualité

- [ ] Vérifier qu'aucun listener vault n'est enregistré deux fois si `refresh()` recrée la vue
- [ ] S'assurer que tous les listeners sont nettoyés dans `onunload()` via `registerEvent()`
- [ ] Tester le basculement thème clair/sombre (aucune couleur codée en dur)
- [ ] Tester sur Obsidian Mobile (colonnes empilées, drag & drop touch)
