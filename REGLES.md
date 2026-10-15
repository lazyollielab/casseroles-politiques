# Règles éditoriales

Ce document est le contrat de confiance du site. Toute donnée ajoutée doit le respecter. La validation automatique bloque une partie des manquements, pas tous : la relecture humaine reste obligatoire.

## 1. Objet

Le site recense des personnalités politiques françaises et les affaires judiciaires dans lesquelles elles sont impliquées, quel que soit le bord politique. L'objectif est factuel : montrer ce que la justice ou des sources établies documentent, sans amplification ni occultation.

## 2. Qui est listé

Toute personnalité ayant exercé ou exerçant une fonction politique (élu, ministre, candidat majeur, dirigeant de parti) dès lors qu'elle est impliquée dans au moins une affaire recevable (voir §4). La liste n'est pas un pilori : les relaxés, non-lieux et classements figurent au même titre que les condamnations.

## 3. Statuts d'une affaire (liste fermée)

Le statut reflète l'état le plus récent de la procédure. Il est obligatoire et doit être mis à jour à chaque acte de procédure.

- `condamnation-definitive` : condamnation dont tous les recours sont épuisés, retirés ou irrecevables.
- `condamnation-appel` : condamné en appel, pourvoi en cassation en cours.
- `condamnation-premiere-instance` : condamné, appel en cours.
- `en-proces` : jugement en cours devant une juridiction.
- `mis-en-examen` : information judiciaire en cours.
- `mis-en-cause-presse` : révélations d'organes de presse établis, aucune poursuite engagée.
- `relaxe` : jugé non coupable par un tribunal.
- `non-lieu` : procédure close à l'instruction faute de charges suffisantes ou d'infraction.
- `classement-sans-suite` : le parquet renonce à poursuivre.
- `prescription` : les faits ne peuvent plus être poursuivis.

## 4. Position d'une personnalité dans une affaire (liste fermée)

La même affaire peut impliquer un condamné et un relaxé. La position est individuelle.

- `condamne` : personne physique condamnée par une juridiction.
- `relaxe` : personne jugée non coupable.
- `non-lieu` : bénéficiaire d'un non-lieu.
- `classement` : poursuites abandonnées à son égard.
- `en-proces` : actuellement jugée.
- `mis-en-examen` : mise en examen en cours.
- `mis-en-cause` : nommée dans l'affaire sans poursuite ni décision judiciaire à son égard.

## 5. Sourçage

- Toute affaire a au moins une source publique, stable et datée : décision de justice, article de presse établi, fiche Wikipédia avec références.
- Wikipédia est acceptée comme point d'entrée, mais toute donnée sensible (statut, date, montant) doit être vérifiable dans une source primaire quand elle existe.
- Le résumé ne doit rien affirmer qui ne figure pas dans les sources listées. Pas de spéculation sur les suites possibles.

## 6. Neutralité et présomption d'innocence

- Le vocabulaire des données est strictement factuel. La satire vit dans l'habillage du site, jamais dans les données.
- Un mis en examen n'est pas un condamné : le statut et la position l'affichent toujours distinctement.
- Si un dossier évolue (relaxe, appel, cassation), la donnée est corrigée dans les meilleurs délais.

## 7. Axe politique

- Position de 0 (extrême gauche) à 100 (extrême droite), indicative, attachée au parti et non à la personne.
- La position doit pouvoir se justifier par des classifications reconnues (science politique, travaux académiques, positionnement des partis eux-mêmes). En cas de contestation sérieuse, la valeur est documentée ou ajustée.
- Les partis historiques dissous ou fusionnés (RPR, UMP, FN) restent listés avec `actuel: false` car des affaires s'y rattachent.

## 8. Images

- Photos et logos : uniquement des fichiers sous licence libre (Wikimedia Commons), en respectant le droit à l'image.
- À défaut d'image disponible licitement, le champ est absent et l'interface affiche une silhouette neutre. Ne jamais utiliser une photo trouvée sans vérifier sa licence.

## 9. Mise à jour

À chaque acte de procédure significatif (mise en examen, verdict, appel, cassation), le statut de l'affaire et la position des personnalités sont revus. Une affaire dont plus rien ne bouge reste en base : l'historique fait partie de l'information.
