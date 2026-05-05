---
title: Responsive mobile
type: feat
status: todo
assigned: mathieu
created: 2026-05-05
edited: 2026-05-05
description: Media query 600px — colonnes en flex-direction column pour Obsidian Mobile.
links:
  - styles.css
---

## Scope

- `@media (max-width: 600px)` sur `.faru-board` → `flex-direction: column`
- `.faru-column` → `min-width: unset; width: 100%`
- Vérifier que le drag & drop reste utilisable (touch events)
- Tester sur Obsidian Mobile iOS/Android
