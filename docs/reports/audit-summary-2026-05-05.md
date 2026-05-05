# Audit complet — obsidian-faru v0.1.0

> Date : 2026-05-05
> Commit : aeceffd
> Scope : code qualité · performance · accessibilité · sécurité

---

## Scores

| Axe | Score | Verdict |
|-----|-------|---------|
| Code qualité | 7.2 / 10 | Bon — 1 violation critique |
| Performance | 6.0 / 10 | Acceptable pour petits backlogs, dégradation sur 30+ cartes |
| Accessibilité | 3.5 / 10 | Insuffisant — 4 violations WCAG niveau A |
| Sécurité | 7.5 / 10 | Bon — 2 vecteurs à corriger avant mise en catalogue |

**Score global : 6.1 / 10**

---

## Résumé exécutif

Le plugin est fonctionnel et bien architecturé pour un MVP. La séparation parser / actions / views est propre, l'API Obsidian est utilisée correctement dans les cas nominaux, et la suite de 24 tests couvre bien les modules purs.

Trois catégories de problèmes doivent être résolus avant que la review Obsidian (PR #12559) aboutisse :

1. **Violation de contrainte fondamentale** : `createCard.ts` construit le frontmatter YAML par concaténation de chaînes au lieu d'utiliser `processFrontMatter()` — la seule API autorisée.
2. **Sécurité catalogue** : `backlogDir` et `configPath` ne sont pas protégés contre les séquences `../`, ce que le processus de review Obsidian vérifie explicitement.
3. **Accessibilité niveau A** : le drag & drop n'a aucune alternative clavier, les cartes sont inaccessibles au clavier, le modal n'a pas de role dialog — trois violations WCAG 2.1 niveau A bloquantes.

---

## Problèmes P0 — À corriger avant validation catalogue

### [Code + Sécu] createCard construit le YAML manuellement
- **Fichier** : `src/actions/createCard.ts`
- **Impact** : Violation contrainte projet + injection YAML possible sur `type`/`assigned`
- **Fix** : Créer fichier vide puis `processFrontMatter()` → tâche `#AUD-001`

### [Sécu] Path traversal via backlogDir et configPath
- **Fichier** : `src/settings.ts`, `src/parser.ts`
- **Impact** : Lecture de fichiers hors vault sur desktop
- **Fix** : Valider l'absence de `..` dans les chemins → tâche `#AUD-002`

### [A11y] Aucune alternative clavier au drag & drop
- **Fichier** : `src/views/BoardView.ts`
- **Impact** : WCAG SC 2.1.1 niveau A — utilisateurs clavier entièrement bloqués
- **Fix** : Bouton "Déplacer" + menu listbox → tâche `#AUD-003`

---

## Problèmes P1 — À corriger dans la v0.2.0

| # | Axe | Problème | Tâche |
|---|-----|----------|-------|
| 1 | A11y | Modal sans role dialog, sans focus trap, sans Escape | `#AUD-004` |
| 2 | A11y | Cartes et badges non focusables au clavier | `#AUD-005` |
| 3 | A11y | 5/6 couleurs badges échouent WCAG AA (contraste) | `#AUD-006` |
| 4 | Perf | Filtre déclenche re-parse complet — render() et refresh() couplés | `#AUD-007` |
| 5 | Perf | parseBacklog séquentiel — N+1 I/O sur 30+ cartes | `#AUD-008` |
| 6 | Code | Modal appendé à document.body sans lifecycle | `#AUD-004` |
| 7 | Code | refresh() relit faru.config.json à chaque événement vault | `#AUD-007` |
| 8 | Code | Labels filtres non associés aux selects + refresh post-settings manquant | `#AUD-009` |

---

## Points positifs

- Zéro `innerHTML` / `insertAdjacentHTML` — pas de risque XSS
- `processFrontMatter()` correctement utilisé dans `moveCard.ts`
- Debounce 300ms propre avec cleanup dans `onClose()`
- 24 tests couvrant tous les modules purs
- Zéro dépendance runtime externe
- Architecture claire : parser / actions / views / settings bien séparés
- `normalizeStatus` défensif sur les valeurs YAML invalides
- CSS 100% variables Obsidian (hors palette badge — cas documenté)

---

## Recommandations par ordre de priorité

1. **Immédiat** (avant review catalogue) : `#AUD-001`, `#AUD-002`, `#AUD-003`
2. **v0.2.0** : `#AUD-004` à `#AUD-009` + `#FEAT-002`, `#FEAT-003`
3. **Futur** : cache partiel du parser (une carte = un re-parse), live region ARIA, tests BoardView

---

*Rapport généré par Black Emperor / ulk — 4 agents en parallèle*
