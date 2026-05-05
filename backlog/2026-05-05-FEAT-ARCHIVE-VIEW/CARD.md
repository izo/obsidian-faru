---
title: Vue archive
type: feat
status: todo
assigned: mathieu
created: 2026-05-05
edited: 2026-05-05
description: Filtrer et afficher les cartes done archivées selon archiveDoneAfterDays depuis la date edited.
links:
  - src/views/BoardView.ts
  - src/parser.ts
  - src/types.ts
---

## Scope

- Calculer `isArchived = status === 'done' && daysSince(edited) >= archiveDoneAfterDays`
- Colonne "Archive" (optionnelle / toggle) ou filtre dédié dans FilterBar
- Les cartes archivées sont exclues du board principal par défaut
- Parser : exposer `archivedCards` séparément dans la valeur de retour
