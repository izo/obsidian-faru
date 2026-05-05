---
title: Audit listeners vault
type: qa
status: todo
assigned: mathieu
created: 2026-05-05
edited: 2026-05-05
description: Vérifier qu'aucun listener vault n'est enregistré deux fois et que tous sont nettoyés dans onunload().
links:
  - src/main.ts
---

## Scope

- Auditer `main.ts` : tous les `vault.on(...)` passent bien par `registerEvent()`
- S'assurer que `refresh()` ne ré-enregistre pas des listeners si appelé plusieurs fois
- Vérifier `onunload()` : aucun listener orphelin
- Tester en rechargeant le plugin depuis les settings Obsidian (Community Plugins → toggle off/on)
