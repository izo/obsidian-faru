# obsidian-faru

Plugin [Obsidian](https://obsidian.md) pour visualiser et piloter un backlog [Faru](https://github.com/fluado/faru) directement dans le vault.

Faru est un système kanban git-native : chaque carte est un dossier dans `backlog/` contenant des fichiers Markdown avec frontmatter YAML. Ce plugin transforme Obsidian en interface de pilotage Faru sans dépendre du serveur local.

---

## Fonctionnalités

- **Vue kanban 3 colonnes** — Todo / WIP / Done
- **Multi-backlog** — détecte automatiquement tous les backlogs Faru du vault et affiche un sélecteur
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

> **Soumission en cours** — Le plugin est en attente de validation par l'équipe Obsidian ([PR #12559](https://github.com/obsidianmd/obsidian-releases/pull/12559)). En attendant, utilisez BRAT ou l'installation manuelle ci-dessous.

### Via BRAT (recommandé)

[BRAT](https://github.com/TfTHacker/obsidian42-brat) permet d'installer et de mettre à jour le plugin automatiquement depuis GitHub.

1. Installer **BRAT** depuis **Paramètres → Plugins communautaires** (rechercher "BRAT")
2. Dans BRAT → **Add Beta Plugin** → entrer `izo/obsidian-faru`
3. Activer le plugin dans **Paramètres → Plugins tiers**

Les mises à jour sont récupérées automatiquement à chaque nouvelle release.

### Manuellement

1. Télécharger `main.js`, `manifest.json` et `styles.css` depuis la [dernière release](https://github.com/izo/obsidian-faru/releases/latest)
2. Les copier dans `.obsidian/plugins/obsidian-faru/`
3. Activer le plugin dans **Paramètres → Plugins tiers**

---

Lancer le plugin : icône kanban dans le ruban ou commande **Open Faru Board** (`Ctrl/Cmd+P`).

---

## Configuration

### Multi-backlog

Le plugin détecte automatiquement tous les backlogs Faru présents dans votre vault (profondeur max 4 niveaux). Un sélecteur apparaît en haut du board dès qu'au moins deux backlogs sont trouvés.

**Détection hybride** :
- **Via config** — chaque `faru.config.json` trouvé dans le vault définit un backlog. Le `backlogDir` est résolu relativement au dossier du fichier.
- **Par heuristique** — tout dossier contenant des sous-dossiers `YYYY-MM-DD-TYPE-*/CARD.md` est reconnu comme backlog, même sans config (affiché avec le suffixe `(auto)`).

Exemple de structure avec plusieurs projets dans un même vault :

```
vault/
├── project-alpha/
│   ├── faru.config.json   ← backlog "project-alpha"
│   └── backlog/
├── project-beta/
│   ├── faru.config.json   ← backlog "project-beta"
│   └── backlog/
└── old-project/
    └── backlog/           ← détecté automatiquement (auto)
```

Le dernier backlog sélectionné est mémorisé et restauré à la prochaine ouverture.

---

### `faru.config.json`

Placer ce fichier à la racine du vault (ou du projet) :

```json
{
  "backlogDir": "./backlog",
  "port": 3333,
  "cardCategories": ["feat", "fix", "qa", "docs"],
  "autoSync": true,
  "archiveDoneAfterDays": 14
}
```

Si le fichier est absent, les valeurs par défaut sont : `backlogDir = "./backlog"`, `cardCategories = ["product", "ops", "bug"]`, `archiveDoneAfterDays = 14`.

> Les champs `port` et `autoSync` sont propres au serveur Faru CLI — ils sont ignorés par le plugin Obsidian.

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

## Crédits

Ce plugin est une **interface tierce** pour [**Faru**](https://github.com/fluado/faru), le système kanban git-natif créé et maintenu par [@fluado](https://github.com/fluado). Tout le mérite de la convention de cartes (structure de dossiers, frontmatter YAML, milestones) revient au projet Faru — ce plugin se contente d'en offrir une visualisation native dans Obsidian.

Si vous trouvez cette approche utile, soutenez le projet original :
**→ https://github.com/fluado/faru**

---

## Licence

MIT — voir [LICENSE](./LICENSE).

Ce plugin est distribué sous licence MIT et n'est **pas affilié officiellement** à Faru ni à son équipe. La convention de cartes Faru reste la propriété intellectuelle de [fluado/faru](https://github.com/fluado/faru) et est utilisée ici dans le respect de sa licence d'origine.
