# Campus — MDS Annecy

Prototype interactif de suivi, d’emprunt et de réservation des ressources du campus, en HTML, CSS et JavaScript.

## Lancer en local

```sh
python3 -m http.server 5173 --directory dist
```

Ouvrir http://localhost:5173.

## Déployer sur Vercel

1. Importer ce dépôt GitHub dans un nouveau projet Vercel.
2. Conserver la racine du dépôt comme **Root Directory**.
3. Utiliser **Other** comme framework. Le fichier `vercel.json` configure le dossier de sortie `dist`, sans installation ni compilation.
4. Cliquer sur **Deploy**.

Aucune variable d’environnement n’est nécessaire.

## Contenu

- `dist/index.html` : structure de l’application.
- `dist/styles.css` : styles et adaptations mobiles.
- `dist/app.js` : données de démonstration et interactions.
- `vercel.json` : configuration d’hébergement statique.

Le rôle étudiant est affiché au démarrage. Le sélecteur de démonstration permet également de parcourir les rôles professeur et gestionnaire.

## Charte graphique

Les couleurs, typographies, rayons et ombres reprennent le guide de style MyDigitalSchool (Figma) : violet `#662483`, rose `#E71D73`, turquoise `#2DB8C5`, gris `#3C3C3B`, titres en Bricolage Grotesque et texte en Inter. Les tokens sont déclarés en haut de `dist/styles.css`.

Les animations (transitions de page, indicateur de navigation, modales, planning) utilisent CSS et la Web Animations API, sans dépendance. Elles sont désactivées si le système demande de réduire les animations.

## Planning des réservations

L’onglet **Réservations** affiche les salles, l’amphithéâtre et les véhicules :

- **Jour** : une ligne par espace, de 8 h à 20 h. Un clic sur une zone libre ouvre la réservation pré-remplie.
- **Semaine** : vue calendrier du lundi au dimanche, avec l’heure courante.
- **Liste** : les réservations des 30 prochains jours, groupées par jour.

Les pastilles permettent de masquer ou d’afficher un espace. Les créneaux en attente de validation sont hachurés et vos propres réservations sont entourées. Le formulaire de réservation montre les disponibilités de l’espace et signale un chevauchement avant l’envoi.

## Périmètre du prototype

Catalogue, demandes, paniers d’emprunt et de réservation, planning, historique et écrans de gestion. Les données sont conservées dans le `localStorage` de chaque navigateur (clé `mds-campus-v2`). Il n’y a ni serveur, ni authentification réelle, ni base de données partagée : les rôles servent uniquement à simuler les parcours.

Les maquettes Figma ont évolué séparément du prototype HTML. Ce dépôt contient la version du prototype local ; il ne constitue pas une nouvelle intégration des dernières maquettes.
