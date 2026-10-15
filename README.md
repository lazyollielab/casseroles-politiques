# Casseroles Politiques

Recensement factuel et sourcé des affaires judiciaires impliquant des personnalités politiques françaises. Les données sont en JSON, le site sera généré à partir de ces fichiers.

## Principe

- Le contenu vit dans `data/` (trois fichiers JSON). On ne touche jamais au code pour mettre à jour le site.
- Chaque affaire a un statut judiciaire contrôlé (condamné, relaxé, mis en examen...) et au moins une source publique.
- Un script de validation (`scripts/valider.js`) refuse toute donnée incomplète ou incohérente. Il tourne automatiquement à chaque modification (GitHub Actions).

## Structure

```
data/
  partis.json         # partis : nom, sigle, position sur l'axe 0-100
  affaires.json       # affaires : statut judiciaire, résumé, sources
  personnalites.json  # personnalités : parti, implications dans les affaires
scripts/
  valider.js          # validation des données (Node, zéro dépendance)
.github/workflows/
  valider.yml         # exécution automatique de la validation
assets/images/        # logos et photos (Wikimedia Commons, licence libre)
REGLES.md             # règles éditoriales : statuts, sourçage, neutralité
CONTRIBUTING.md       # comment proposer une contribution
```

## Mettre à jour les données

1. Modifier le ou les fichiers dans `data/` (voir `data/SCHEMA.md`).
2. Enregistrer. La validation automatique accepte ou refuse.
3. Si la validation refuse, le message indique le fichier et le champ à corriger.

## Licences

- Code : MIT
- Données : CC BY 4.0
- Images : licences d'origine (Wikimedia Commons)
