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

## Périmètre du prototype

Catalogue, demandes, paniers d’emprunt et de réservation, planning, historique et écrans de gestion. Les données sont conservées dans le `localStorage` de chaque navigateur. Il n’y a ni serveur, ni authentification réelle, ni base de données partagée : les rôles servent uniquement à simuler les parcours.

Les maquettes Figma ont évolué séparément du prototype HTML. Ce dépôt contient la version du prototype local ; il ne constitue pas une nouvelle intégration des dernières maquettes.
