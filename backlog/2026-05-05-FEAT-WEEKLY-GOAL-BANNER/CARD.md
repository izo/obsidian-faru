---
title: Bannière weekly-goal
type: feat
status: wip
assigned: mathieu
created: 2026-05-05
edited: 2026-05-05
description: Lire weekly-goal.md à la racine du vault et afficher en bannière au-dessus du board avec bouton d'édition inline.
links:
  - src/views/BoardView.ts
  - styles.css
---

## Scope

- Lire `weekly-goal.md` via `vault.read()` si présent
- Afficher le contenu en bannière `.faru-weekly-goal` au-dessus des colonnes
- Bouton edit → ouvre le fichier dans un leaf Obsidian
- Styles : `.faru-weekly-goal` (padding, border-left accent, fond subtle)
- Si absent → bannière masquée silencieusement