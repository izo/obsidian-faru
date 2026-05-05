---
project: obsidian-faru
version: 0.1.0
updated: 2026-05-05
status: near-done
stack: TypeScript · Obsidian Plugin API · Vanilla DOM · esbuild · vitest
---

# Spec — obsidian-faru

Plugin Obsidian qui transforme n'importe quel vault en interface de pilotage pour un backlog [Faru](https://github.com/fluado/faru) — un système kanban git-natif où chaque carte est un dossier Markdown.

---

## 1. Contexte et objectifs

Faru est un système de gestion de backlog git-natif : les cartes vivent dans `backlog/` comme dossiers avec frontmatter YAML, versionables et editables hors de tout outil propriétaire. Le serveur local `npx github:fluado/faru` offre une UI web, mais requiert Node.js et un port ouvert.

**Objectif** : donner aux utilisateurs Obsidian une interface kanban native — sans dépendance externe, sans serveur, intégrée dans leur workflow de notes.

---

## 2. Problème résolu

| Problème | Solution |
|---|---|
| Interface Faru CLI exige `npx` + serveur local | Plugin natif Obsidian, zéro serveur |
| Cartes non visibles dans Obsidian | Vue kanban 3 colonnes dans un leaf |
| Mise à jour du `status` = édition manuelle du YAML | Drag & drop → `processFrontMatter()` automatique |
| Pas de vue d'ensemble des assignees / types | FilterBar dynamique |

---

## 3. Utilisateurs et cas d'usage

**Utilisateur principal** : développeur/PM solo utilisant Faru pour son backlog projet, ayant Obsidian comme environnement de travail principal.

**Cas d'usage clés :**
1. Ouvrir le board → voir les 3 colonnes Todo/WIP/Done
2. Drag & drop une carte → `status` mis à jour dans le fichier
3. Cliquer sur une carte → ouvrir `CARD.md` dans l'éditeur
4. Créer une carte depuis le board → dossier + `CARD.md` générés
5. Filtrer par type ou assignee → vue ciblée
6. Voir les milestones d'une carte → `● 2/3`

---

## 4. Portée

### In scope (v0.1.0)
- Vue kanban 3 colonnes (Todo / WIP / Done)
- Drag & drop avec mise à jour frontmatter
- Live reload sur événements vault (debounce 300 ms)
- Badge type (palette 6 couleurs CSS variables)
- Badge assignee
- Indicateur milestones (`● completed/total`)
- FilterBar type + assignee
- Création de carte (modal + dossier + `CARD.md`)
- Clic carte → ouvrir fichier principal
- Thème clair/sombre (CSS variables Obsidian uniquement)
- Compatible Obsidian Mobile

### P2 (post-MVP, planifié)
- Bannière `weekly-goal.md` au-dessus du board
- Vue archive (cartes `done` archivées après `archiveDoneAfterDays`)
- Responsive mobile (media query 600 px)

### Hors scope
- Synchronisation git automatique (géré par Faru CLI)
- Éditeur de carte inline
- Notifications ou rappels
- Support multi-backlog simultané

---

## 5. Architecture et choix techniques

**Contraintes fortes :**
- Zéro dépendance externe (uniquement `obsidian` package)
- DOM vanilla — `document.createElement` / `el.createEl`
- `processFrontMatter()` = seule méthode autorisée pour écrire le frontmatter
- Aucune écriture hors `backlogDir` (exception : `weekly-goal.md` à la racine)

### Data flow

```
faru.config.json
      │
      ▼
  settings.ts  ── resolves backlogDir, cardCategories
      │
      ▼
  parser.ts    ── scans vault, parses frontmatter, milestones
      │
      ▼
  BoardView.ts ── ItemView, 3 colonnes, FilterBar, CardTile
      │
      ├─ drag & drop ──▶ actions/moveCard.ts
      └─ create modal ──▶ actions/createCard.ts
```

### Stack

| Composant | Choix | Raison |
|---|---|---|
| Langage | TypeScript strict | Type safety + API Obsidian typée |
| Build | esbuild | Rapide, bundle minimal, externe `obsidian` |
| Tests | vitest | Compatible ESM, rapide |
| DOM | Vanilla | Contrainte plugin Obsidian |
| Styles | CSS variables Obsidian | Thème auto clair/sombre |

---

## 6. Modules et responsabilités

| Fichier | Rôle |
|---|---|
| `src/main.ts` | Plugin entry : enregistre vue, ruban, commande, settings, listeners vault |
| `src/types.ts` | Interfaces `FaruCard`, `FaruConfig`, `FaruColumn`, `FaruSettings` + constantes |
| `src/settings.ts` | `loadFaruConfig()` + `FaruSettingTab` |
| `src/parser.ts` | `resolveCardFile()`, `parseBacklog()`, `parseMilestones()` — logique pure |
| `src/views/BoardView.ts` | `ItemView` : orchestre colonnes, drag & drop, refresh |
| `src/views/CardTile.ts` | Rendu DOM d'une carte |
| `src/views/FilterBar.ts` | Dropdowns type/assignee, émet état vers BoardView |
| `src/actions/moveCard.ts` | Met à jour `status` + `edited` via `processFrontMatter()` |
| `src/actions/createCard.ts` | Crée dossier `YYYY-MM-DD-TYPE-TITLE` + `CARD.md` |

---

## 7. Données et modèles

### `faru.config.json`

```json
{
  "backlogDir": "./backlog",
  "port": 3333,
  "cardCategories": ["feat", "fix", "qa", "docs"],
  "autoSync": true,
  "archiveDoneAfterDays": 14
}
```

Champs lus par le plugin : `backlogDir`, `cardCategories`, `archiveDoneAfterDays`.
Champs ignorés par le plugin : `port`, `autoSync` (propres au serveur Faru CLI).

### `FaruCard`

```typescript
interface FaruCard {
  folderPath: string;   // "backlog/2026-05-05-FEAT-WEEKLY-GOAL-BANNER"
  filePath: string;     // fichier .md principal résolu
  title: string;
  type: string;         // correspond à cardCategories
  status: 'todo' | 'wip' | 'done';
  assigned: string;
  created: string;      // YYYY-MM-DD
  edited?: string;      // YYYY-MM-DD
  description: string;
  links?: string[];
  milestones?: { total: number; completed: number };
}
```

### Convention de nommage des dossiers

`YYYY-MM-DD-TYPE-TITLE` — TYPE en majuscules, TITLE en majuscules séparé par tirets.
Exemples : `2026-05-05-FEAT-WEEKLY-GOAL-BANNER`, `2026-05-05-QA-VAULT-LISTENERS`

---

## 8. UX et parcours clés

### Parcours 1 — Déplacer une carte

1. Utilisateur drag une carte `.faru-card`
2. `dragstart` → `dataTransfer.setData('text/plain', card.folderPath)`
3. Drop sur colonne cible → `moveCard(app, card, newStatus)`
4. `processFrontMatter()` met à jour `status` + `edited`
5. `refresh()` re-parse le backlog et re-rend le board

### Parcours 2 — Créer une carte

1. Clic bouton `+` sur une colonne
2. Modal : champs titre, type (dropdown cardCategories), assignee
3. `createCard()` → `vault.createFolder(folderPath)` + `vault.create(CARD.md)`
4. Live reload déclenche `refresh()` automatiquement (event vault `create`)

### Parcours 3 — Filtrer

1. FilterBar déduit dynamiquement les assignees des cartes chargées
2. Sélection dans `<select multiple>` → `onChange()` dans BoardView
3. Re-render sans re-fetch (cartes déjà en mémoire)

---

## 9. Qualité

### Tests (24 passants)

| Suite | Couverture |
|---|---|
| `parser.test.ts` | `resolveCardFile()` 4 cas, `parseBacklog()` status invalide + frontmatter absent |
| `moveCard.test.ts` | Mock vault, vérif `status` + `edited` mis à jour |
| `createCard.test.ts` | Convention nommage dossier (espaces, casse, caractères spéciaux) |

### Sécurité

- Aucune exécution de code externe
- Aucune requête réseau
- Écriture limitée à `backlogDir` + `weekly-goal.md`
- `processFrontMatter()` uniquement pour les écritures (API Obsidian sécurisée)

### Performance

- Debounce 300 ms sur les événements vault (évite les re-renders en cascade)
- `refresh()` re-parse uniquement ce qui est nécessaire — pas de cache complexe
- `onChange()` FilterBar ne re-parse pas le backlog (filtre en mémoire)

---

## 10. Risques et hypothèses

| Risque | Mitigation |
|---|---|
| API Obsidian `processFrontMatter()` deprecate | Contrainte explicite dans CLAUDE.md |
| Drag & drop non fonctionnel sur Mobile | P2 responsive + tests Mobile en backlog |
| Vault très grand (>1000 cartes) | `parseBacklog()` tri par date — pas d'optimisation pagination prévue |
| Double listener vault si `refresh()` re-crée la vue | QA-VAULT-LISTENERS en backlog |

---

## 11. Roadmap

### v0.1.0 — NEAR_DONE ✅
- [x] P0 : Vue kanban, drag & drop, live reload, badges, tests
- [x] P1 : Milestones, filtres, création carte, styles complets

### v0.2.0 — Planifié
- [ ] Bannière `weekly-goal.md` (`FEAT-WEEKLY-GOAL-BANNER`)
- [ ] Vue archive (`FEAT-ARCHIVE-VIEW`)
- [ ] Responsive mobile 600px (`FEAT-RESPONSIVE-MOBILE`)
- [ ] Audit listeners vault (`QA-VAULT-LISTENERS`)
- [ ] Tests thème + mobile (`QA-THEME-MOBILE-TESTING`)

### v1.0.0 — Future
- Soumission Obsidian Community Plugins
- Documentation utilisateur complète
- Tests e2e Obsidian

---

## 12. Backlog actif

Voir `backlog/` — 5 cartes actives (3 feat + 2 qa), toutes en `todo`.

```
backlog/
├── 2026-05-05-FEAT-ARCHIVE-VIEW/
├── 2026-05-05-FEAT-RESPONSIVE-MOBILE/
├── 2026-05-05-FEAT-WEEKLY-GOAL-BANNER/
├── 2026-05-05-QA-THEME-MOBILE-TESTING/
└── 2026-05-05-QA-VAULT-LISTENERS/
```

---

## 13. Annexes

### Glossaire

| Terme | Définition |
|---|---|
| **Faru** | Système kanban git-natif — cartes = dossiers Markdown dans `backlog/` |
| **CARD.md** | Fichier principal d'une carte Faru (frontmatter YAML + contenu Markdown) |
| **Milestone** | Fichier `PREFIX-milestones.md` dans le dossier carte, listant les étapes `## PREFIX-N:` |
| **`processFrontMatter()`** | API Obsidian pour lire/écrire le frontmatter YAML de façon atomique et safe |
| **Live reload** | Rafraîchissement automatique du board à chaque modification du vault |

### Références

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [Faru](https://github.com/fluado/faru) — système kanban git-natif
- `SPECS.md` — contrats d'implémentation par module
- `CDC.txt` — cahier des charges complet
