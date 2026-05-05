# obsidian-faru

Plugin [Obsidian](https://obsidian.md) pour visualiser et piloter un backlog [Faru](https://github.com/fluado/faru) directement dans le vault.

Faru est un système kanban git-native : chaque carte est un dossier dans `backlog/` contenant des fichiers Markdown avec frontmatter YAML. Ce plugin transforme Obsidian en interface de pilotage Faru sans dépendre du serveur local.

---

## Fonctionnalités

- **Vue kanban 3 colonnes** — Todo / WIP / Done
- **Drag & drop** entre colonnes — met à jour `status` dans le frontmatter automatiquement
- **Live reload** — la vue se rafraîchit à chaque modification du vault
- **Clic sur une carte** — ouvre le fichier principal dans l'éditeur Obsidian
- **Badge type et assignee** sur chaque carte
- **Indicateur de progression milestones** (`● 2/3`)
- **Filtres** par type et par assignee
- **Création de carte** depuis le plugin (crée le dossier + `CARD.md`)
- Compatible **thème clair/sombre** et **Obsidian Mobile**

---

## Installation

1. Copier `main.js`, `manifest.json` et `styles.css` dans `.obsidian/plugins/obsidian-faru/`
2. Activer le plugin dans **Paramètres → Plugins tiers**
3. Cliquer sur l'icône kanban dans le ruban, ou lancer la commande **Open Faru Board**

---

## Configuration

### `faru.config.json`

Placer ce fichier à la racine du vault (ou du projet) :

```json
{
  "backlogDir": "./backlog",
  "cardCategories": ["product", "ops", "bug"],
  "archiveDoneAfterDays": 14
}
```

Si le fichier est absent, les valeurs ci-dessus sont utilisées par défaut.

### Settings Obsidian

| Paramètre | Description | Défaut |
|---|---|---|
| `configPath` | Chemin vers `faru.config.json` | `faru.config.json` |
| `defaultAssignee` | Assignee par défaut pour les nouvelles cartes | _(vide)_ |

---

## Convention Faru

### Structure du backlog

```
backlog/
├── 2026-05-04-PRODUCT-OAUTH-LOGIN/
│   ├── CARD.md
│   ├── VX-milestones.md
│   └── VX-1-report.md
├── 2026-05-04-BUG-DASHBOARD-CRASH/
│   └── CARD.md
└── 2026-05-04-OPS-CI-PIPELINE/
    └── CARD.md
```

### Frontmatter d'une carte (`CARD.md`)

```yaml
---
title: Implement OAuth flow
type: product
status: todo
assigned: alice
created: 2026-05-04
edited: 2026-05-04
description: One-line summary.
links:
  - specs/oauth-design.md
---
```

Valeurs valides pour `status` : `todo`, `wip`, `done`.

---

## Développement

```bash
npm install
npm run dev      # build en mode watch
npm run build    # build de production
npm run test     # tests unitaires (vitest)
```

**Stack** : TypeScript strict · API Obsidian · DOM vanilla · esbuild · vitest  
**Zéro dépendance externe** — uniquement le package `obsidian`.

---

## Licence

MIT
