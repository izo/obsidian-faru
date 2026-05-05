---
title: Refonte de la barre de filtres en pill-toggles
type: feat
status: done
assigned: mathieu
created: 2026-05-05
edited: 2026-05-05
completed: 2026-05-05
description: Remplacer les <select multiple> natifs par des pill-toggles cohérents avec le vocabulaire badge déjà établi.
links:
  - src/views/FilterBar.ts
  - styles.css
---

## Contexte

Audit DA Agathe (2026-05-05) — la barre de filtres actuelle utilise des `<select multiple>` natifs avec hauteur fixe et scrollbars. Discontinuité visuelle brutale avec le vocabulaire badge soigné des cartes ("widget de formulaire des années 2000" vs "badges arrondis colorés").

## Scope

### Refonte FilterBar
- Remplacer `<select multiple>` Type par une rangée de pill-toggles (un bouton par catégorie)
- Idem pour Assignee (un pill par assignee distinct détecté)
- Pill state inactif : fond `var(--background-modifier-border)`, texte `var(--text-muted)`
- Pill state actif : fond `var(--interactive-accent)`, texte `var(--text-on-accent)`
- Border-radius 12px, padding `4px 10px`, gap `6px` entre pills
- Click pill → toggle son état dans le `FilterState`

### Réutilisation du système badge
- Les pills Type peuvent reprendre la couleur de la catégorie (palette `--faru-cat-*`) en mode actif
- Cohérence visuelle avec les badges des cartes

### Compactage
- Suppression du label "Type" / "Assignee" séparé → utiliser un préfixe ou un séparateur visuel
- La barre doit prendre moins de hauteur qu'actuellement (gain vertical pour les colonnes)

### Accessibilité
- `role="group"` sur la rangée
- `aria-pressed` sur chaque pill
- Navigation clavier (Tab + Enter/Space pour toggle)
- `:focus-visible` outline (déjà global)

## Critères d'acceptation

- [ ] Plus aucun `<select>` natif dans la barre de filtres
- [ ] Cohérence visuelle pills ↔ badges des cartes
- [ ] Hauteur de la filter-bar réduite vs version actuelle
- [ ] Filtres multi-sélection fonctionnels (toggle indépendant)
- [ ] Navigation clavier accessible (aria-pressed + focus visible)
- [ ] 24/24 tests vitest passent
