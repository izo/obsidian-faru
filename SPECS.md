# SPECS — obsidian-faru

Spécifications d'implémentation par module. À lire en complément du CDC.txt.

---

## `src/types.ts`

```typescript
interface FaruConfig {
  backlogDir: string;           // chemin relatif à la racine du vault
  cardCategories: string[];
  archiveDoneAfterDays?: number;
}

interface FaruCard {
  folderPath: string;           // ex: "backlog/2026-05-04-PRODUCT-OAUTH-LOGIN"
  filePath: string;             // chemin du .md principal résolu
  title: string;
  type: string;
  status: FaruColumn;
  assigned: string;
  created: string;              // YYYY-MM-DD
  edited?: string;              // YYYY-MM-DD
  description: string;
  links?: string[];
  milestones?: { total: number; completed: number };
}

type FaruColumn = 'todo' | 'wip' | 'done';

interface FaruSettings {
  configPath: string;           // défaut: "faru.config.json"
  defaultAssignee: string;      // défaut: ""
}

const FARU_VIEW_TYPE = 'faru-board';
const FARU_DEFAULTS: FaruConfig = {
  backlogDir: './backlog',
  cardCategories: ['product', 'ops', 'bug'],
  archiveDoneAfterDays: 14,
};
```

---

## `src/main.ts`

- Étend `Plugin`
- `onload()` : charge les settings → lit `faru.config.json` → enregistre la vue → ajoute ruban + commande + onglet settings + listeners vault
- `activateView()` : ouvre ou focus le leaf `FARU_VIEW_TYPE` dans le volet droit
- `onFileChange(file)` : ignore les fichiers hors `backlogDir` et hors `.md` / `faru.config.json` ; sinon debounce 300 ms et appelle `boardView.refresh()`
- Stocker le debounce timer dans une propriété de classe, pas une variable module

---

## `src/settings.ts`

### `loadFaruConfig(app, configPath): Promise<FaruConfig>`

```typescript
async function loadFaruConfig(app: App, configPath: string): Promise<FaruConfig>
```

1. Tenter `app.vault.adapter.read(configPath)`
2. Si succès : `JSON.parse` + merger avec `FARU_DEFAULTS` (les clés manquantes prennent la valeur par défaut)
3. Si erreur (fichier absent ou JSON invalide) : `console.warn` + retourner `FARU_DEFAULTS`

### `FaruSettingTab`

- Étend `PluginSettingTab`
- Champ texte pour `configPath`
- Champ texte pour `defaultAssignee`
- `onChange` : sauvegarder + recharger la config + rafraîchir la vue

---

## `src/parser.ts`

### `resolveCardFile(files: string[]): string | null`

Sélectionne le fichier `.md` principal parmi la liste des fichiers d'un dossier carte :

```
priorité 1 : /.*-milestones\.md$/
priorité 2 : /CARD\.md$/
priorité 3 : /.*-spec\.md$/
priorité 4 : premier .md trouvé
```

Retourne `null` si aucun `.md`.

### `parseMilestones(app, folderPath, files): Promise<{ total: number; completed: number } | undefined>`

1. Trouver le fichier `*-milestones.md` dans `files` — si absent, retourner `undefined`
2. Lire le contenu, compter les headings `## PREFIX-N:` → `total`
3. Pour chaque N, vérifier si `PREFIX-N-report.md` existe dans `files` → `completed`
4. Retourner `{ total, completed }`

### `parseBacklog(app, config): Promise<FaruCard[]>`

1. Lire les entrées de `config.backlogDir` via `app.vault.adapter.list()`
2. Pour chaque sous-dossier : lister ses fichiers, appeler `resolveCardFile()`, lire le frontmatter via `app.metadataCache.getCache(filePath)?.frontmatter`
3. Ignorer silencieusement si : pas de `.md` principal, ou frontmatter absent/invalide
4. `status` invalide → forcer `'todo'`
5. Appeler `parseMilestones()` si un `*-milestones.md` est présent
6. Retourner les cartes triées par `created` décroissant

---

## `src/actions/moveCard.ts`

```typescript
async function moveCard(app: App, card: FaruCard, newStatus: FaruColumn): Promise<void>
```

1. `app.vault.getAbstractFileByPath(card.filePath)` → vérifier `instanceof TFile`
2. `app.fileManager.processFrontMatter(file, fm => { fm.status = newStatus; fm.edited = formatDate(new Date()); })`
3. `formatDate` : retourne `YYYY-MM-DD` en local time

---

## `src/actions/createCard.ts`

```typescript
async function createCard(app: App, config: FaruConfig, params: {
  title: string;
  type: string;
  assigned?: string;
}): Promise<FaruCard>
```

1. Normaliser : `title` → uppercase avec tirets (remplacer espaces et caractères non-alphanum par `-`, supprimer les tirets multiples)
2. Construire le nom du dossier : `YYYY-MM-DD-TYPE-TITLE` (date du jour en local time)
3. `folderPath = config.backlogDir + '/' + folderName`
4. `app.vault.createFolder(folderPath)`
5. Créer `CARD.md` avec frontmatter par défaut (status: `todo`, dates = aujourd'hui)
6. Retourner la `FaruCard` construite

---

## `src/views/BoardView.ts`

Étend `ItemView`. Vue principale du plugin.

### État interne

```typescript
private config: FaruConfig;
private cards: FaruCard[];
private filters: { types: string[]; assignees: string[] };
private debounceTimer: number | null;
```

### `getViewType()` → `FARU_VIEW_TYPE`
### `getDisplayText()` → `'Faru Board'`
### `getIcon()` → `'kanban'`

### `onOpen()`

1. Appeler `this.refresh()`

### `refresh()`

1. `cards = await parseBacklog(this.app, this.config)`
2. Vider `this.contentEl`, re-rendre FilterBar + 3 colonnes

### `render(cards)`

Appliquer les filtres actifs, puis :

```
contentEl
└── .faru-board
    ├── FilterBar
    └── [.faru-column × 3]
        ├── .faru-column-header  (titre + compteur)
        └── [CardTile × N]
```

### Drag & drop (HTML5 natif)

- `dragstart` sur `.faru-card` : `e.dataTransfer.setData('text/plain', card.folderPath)`
- `dragover` sur `.faru-column` : `e.preventDefault()` + classe `.drag-over`
- `dragleave` : retirer `.drag-over`
- `drop` : lire `folderPath`, trouver la carte, appeler `moveCard()`, puis `this.refresh()`

---

## `src/views/CardTile.ts`

```typescript
function createCardTile(app: App, card: FaruCard): HTMLElement
```

Structure DOM :

```
div.faru-card [draggable]
├── div.faru-card-title         (card.title)
├── div.faru-card-meta
│   ├── span.faru-badge-type    (card.type)
│   ├── span.faru-badge-assignee (@card.assigned) [si non vide]
│   └── span.faru-badge-milestone (● completed/total) [si milestones]
└── div.faru-card-description   (card.description) [optionnel, tronqué]
```

- Clic sur la carte : `app.workspace.openLinkText(card.filePath, '', false)`
- Clic sur `.faru-badge-milestone` : ouvre le fichier `*-milestones.md` du dossier carte

---

## `src/views/FilterBar.ts`

```typescript
function createFilterBar(
  categories: string[],
  assignees: string[],
  current: { types: string[]; assignees: string[] },
  onChange: (filters: { types: string[]; assignees: string[] }) => void
): HTMLElement
```

- Deux `<select multiple>` : un pour les types, un pour les assignees
- `assignees` est déduit dynamiquement des cartes existantes (passé par `BoardView`)
- `onChange` déclenche un re-render dans `BoardView` (pas un `refresh()` complet — les cartes sont déjà chargées)

---

## `styles.css` — palette des badges type

Les couleurs de badge sont assignées par index dans une palette fixe de 6 couleurs définies en CSS custom properties. L'index est `cardCategories.indexOf(type) % 6`. Cela garantit la cohérence entre les sessions sans hachage dynamique.

```css
--faru-cat-0: /* bleu */;
--faru-cat-1: /* vert */;
--faru-cat-2: /* rouge */;
--faru-cat-3: /* orange */;
--faru-cat-4: /* violet */;
--faru-cat-5: /* cyan */;
```

---

## Gestion des erreurs

| Cas | Comportement |
|-----|-------------|
| `faru.config.json` absent ou JSON invalide | `console.warn` + `FARU_DEFAULTS` |
| `backlogDir` n'existe pas | Afficher un message dans la vue : _"Dossier backlog introuvable. [Créer]"_ — le bouton crée le dossier via `vault.createFolder` |
| Frontmatter absent ou `status` invalide | Ignorer la carte (log console) / forcer `'todo'` |
| Dossier carte sans `.md` | Ignorer silencieusement |
| `moveCard` sur un fichier supprimé | `console.warn`, pas d'erreur UI |
