---
title: Refonte densité & lisibilité des cartes
type: feat
status: todo
assigned: mathieu
created: 2026-05-05
edited: 2026-05-05
description: Quick wins UI suite audit Agathe — hiérarchie typo, fin de la troncature agressive, badge assignee conditionnel, empty states.
links:
  - src/views/CardTile.ts
  - src/views/BoardView.ts
  - styles.css
---

## Contexte

Audit DA Agathe (2026-05-05) — score actuel : densité écrasante, hiérarchie titre/badge inversée, troncature aggressive, colonnes vides sans état.

## Scope (quick wins < 1 journée)

### 1. Hiérarchie typographique
- `.faru-card-title` : passer `font-weight` à 600, `font-size` de `0.9em` → `0.95em`
- `.faru-badge-type` : `font-size: 0.72em` (actuellement `0.75em`)
- L'écart visuel doit rendre le titre dominant, pas le badge

### 2. Fin de la troncature agressive
- `.faru-card-title` actuellement `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
- Remplacer par : `display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden`
- Permet jusqu'à 2 lignes, plus de "CI/CD — Branch protections & pipel..."

### 3. Badge assignee conditionnel
- Dans `CardTile.ts` : ne rendre `.faru-badge-assignee` que si **plusieurs assignees distincts** sont présents dans la vue filtrée actuelle
- Quand 95% des cartes ont `@mdr`, le badge devient bruit
- Passer la liste des assignees uniques en paramètre depuis `BoardView.render()`

### 4. Empty states pour colonnes vides
- Si `colCards.length === 0` dans `buildColumn()`, afficher un `<div class="faru-column-empty">` avec texte muted
- Texte : "Aucune carte" (Todo) / "Rien en cours" (WIP) / "Aucune carte terminée" (Done)
- Style : `text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.85em`

## Hors scope

- Refonte des filtres (carte FEAT-FILTER-PILLS séparée)
- Animations / transitions

## Critères d'acceptation

- [ ] Titre clairement dominant visuellement vs badge
- [ ] Aucune carte avec titre tronqué par `...` (sauf si > 2 lignes)
- [ ] Badge `@mdr` masqué quand un seul assignee dans la vue
- [ ] Colonnes vides affichent un message muted, pas un bloc blanc
- [ ] 24/24 tests vitest passent
- [ ] Build sans erreur typecheck
