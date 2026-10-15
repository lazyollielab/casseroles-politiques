# Schéma des données

Documentation des trois fichiers JSON. Ces fichiers sont la seule chose à modifier en routine.

## partis.json

Liste de partis. Champs obligatoires :

- `id` : identifiant stable en minuscules avec tirets (ex. `les-republicains`). Ne change jamais une fois créé.
- `nom` : nom complet.
- `sigle` : nom court usuel.
- `axe` : entier de 0 (extrême gauche) à 100 (extrême droite), voir REGLES.md §7.
- `actuel` : `true` si le parti existe toujours, `false` s'il est dissous ou fusionné.

Champs optionnels :

- `logo` : chemin vers une image sous licence libre (ex. `assets/images/logos/rn.svg`). Si absent, l'interface affiche un marqueur neutre.
- `note` : précision courte (ex. période d'activité).

## affaires.json

Liste d'affaires. Champs obligatoires :

- `id` : identifiant stable en minuscules avec tirets. Ne change jamais une fois créé.
- `nom` : nom usuel de l'affaire.
- `periode` : période des faits, texte court.
- `statut` : un des statuts de REGLES.md §3 (liste fermée).
- `resume` : deux à quatre phrases, strictement factuelles, ne devant rien affirmer d'absent des sources.
- `sources` : au moins une URL publique pointant vers la source.

Champs optionnels :

- `date_maj` : date (AAAA-MM-JJ) de la dernière vérification du dossier, recommandée.

## personnalites.json

Liste de personnalités. Champs obligatoires :

- `id` : identifiant stable en minuscules avec tirets.
- `nom` : nom complet.
- `fonction` : fonction principale, courte.
- `parti` : `id` d'un parti existant dans partis.json.
- `implications` : liste non vide d'objets :
  - `affaire` : `id` d'une affaire existant dans affaires.json.
  - `position` : une des positions de REGLES.md §4 (liste fermée).

Champs optionnels :

- `photo` : chemin vers une image sous licence libre (`assets/images/photos/<id>.jpg`). Si absent, silhouette neutre.

## Interactions

Les personnalités référencent les partis et les affaires par leur `id`. Le validateur refuse toute référence inexistante, tout statut ou position hors listes, toute affaire sans source, et toute affaire rattachée à aucune personnalité.
