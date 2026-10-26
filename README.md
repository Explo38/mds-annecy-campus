# campus. — Espace de travail

Application métier de gestion du matériel et des espaces d'un campus, développée
à partir de la maquette Figma *Application metier fait main*.

Emprunter un ordinateur, réserver une salle ou un véhicule, suivre ses demandes
et retrouver son historique : tout passe par le même objet métier, la **demande**.

## Démarrer

```bash
npm install
npm run dev
```

L'application est servie sur <http://localhost:5173>.

| Commande           | Effet                                                        |
| ------------------ | ------------------------------------------------------------ |
| `npm run dev`      | Serveur de développement                                      |
| `npm run build`    | Vérification des types + build de `dist/`                     |
| `npm run preview`  | Prévisualisation du build                                     |
| `npm run partage`  | Build, puis mise à disposition sur le réseau local            |

## Faire tester l'application à quelqu'un

```bash
npm run partage
```

Vite affiche alors deux adresses : `localhost:4173` pour vous, et une adresse en
`http://192.168.x.x:4173` (ou `10.x.x.x`) **joignable depuis n'importe quel
appareil du même réseau Wi-Fi**. C'est ce lien-là qu'on envoie au testeur ; il
s'ouvre aussi bien sur son téléphone que sur son ordinateur.

Pour retrouver l'adresse à la main :

```bash
ipconfig getifaddr en0
```

Trois choses à savoir :

- **L'adresse change** avec le réseau. Sur un autre Wi-Fi, il faut la relire.
- **macOS peut demander l'autorisation** d'accepter les connexions entrantes à la
  première exécution : il faut l'accorder, sinon le lien ne répond que sur votre
  machine.
- **Le serveur vit tant que la commande tourne.** Fermer le terminal coupe le lien.

Ajoutez `?reset` à l'adresse (`http://192.168.x.x:4173/?reset`) pour repartir du
jeu de démonstration entre deux testeurs.

Ce lien ne sort pas de votre réseau : personne ne peut s'y connecter de
l'extérieur. Pour un lien accessible à distance, il faut soit un tunnel
(`cloudflared`, `ngrok`), soit un déploiement du dossier `dist/` sur un
hébergeur — ce sont deux choses différentes de l'hébergement local.

## Les écrans

### Espace de travail — ce que voit un membre

| Route           | Écran             | Maquette |
| --------------- | ----------------- | -------- |
| `/`             | Vue d'ensemble    | ✅        |
| `/catalogue`    | Catalogue         | ✅        |
| `/demandes`     | Les demandes      | déduit   |
| `/reservations` | Les réservations  | ✅        |
| `/historique`   | Historique        | ✅        |

« Les demandes » figure dans la navigation de la maquette mais n'a pas été
dessinée. L'écran est reconstruit avec les composants des deux autres listes.

Ces cinq écrans sont **personnels** : ils ne montrent que les demandes du compte
connecté (Sophie Dubois). C'est ce que dit déjà la maquette — « Mon historique »,
« Retrouvez *vos* créneaux ».

### Administration — ce que voit le service campus

| Route                 | Écran      |
| --------------------- | ---------- |
| `/admin`              | Pilotage   |
| `/admin/stock`        | Stock      |
| `/admin/validations`  | Validations|
| `/admin/planning`     | Planning   |
| `/admin/membres`      | Membres    |

Le composant Sidebar du kit possède une variante `Property 1= admin` : deux blocs
de navigation, « Espace de travail » et « Administration », de cinq entrées
chacun. La structure vient donc de la maquette ; les libellés du second bloc y
étaient restés un copier-coller du premier, ils ont été définis ici.

Ce second bloc n'apparaît qu'en **vue Gestionnaire** (sélecteur de l'en-tête), et
les routes `/admin/*` redirigent vers l'accueil pour les autres rôles.

- **Pilotage** — quatre indicateurs (demandes à traiter, sorties, retards, part
  du stock disponible), l'alerte des retards, la file de validation et le stock
  immobilisé.
- **Stock** — l'inventaire complet : une fiche par référence, avec son nombre
  d'exemplaires et ceux qui sont immobilisés. Ajout, modification, maintenance,
  retrait. Une référence mobilisée par une demande active ne peut pas être
  retirée, et le parc ne peut pas descendre sous ce qui est déjà sorti.
  Les onglets reprennent mot pour mot les badges de la colonne « État »
  — Disponible, Emprunté, Réservé, En maintenance — et se partagent exactement
  les références, pour qu'on puisse recompter. Ce qu'il faut réapprovisionner
  s'annonce dans un bandeau plutôt que dans un onglet de plus.
- **Validations** — toutes les demandes du campus, les plus anciennes d'abord.
  Valider ou refuser se fait directement dans la ligne.
- **Planning** — l'occupation des espaces et véhicules, une colonne par jour,
  navigation de semaine en semaine. Un créneau ambré attend une validation.
- **Membres** — les comptes du campus, leur encours, leurs retards ; le détail
  se déplie ligne par ligne.

## Ce que l'application sait faire

- **Catalogue** — onglets (toutes / à emprunter / à réserver), recherche plein
  texte, filtres catégorie et état. Les filtres vivent dans l'URL, ce qui permet
  aux accès rapides du tableau de bord d'ouvrir le catalogue déjà filtré.
- **Panier** — le bouton « + Emprunter / Réserver » ouvre le choix du créneau et,
  pour du matériel en plusieurs exemplaires, du nombre souhaité. L'envoi du
  panier crée **une demande par exemplaire**, chacune suivie et restituée
  séparément.
- **Quantités** — une référence regroupe N exemplaires identiques (`total`) dont
  certains peuvent être immobilisés (`maintenance`). L'étudiant lit « 5 sur 8
  disponibles » sur la carte du catalogue et au moment de la demande ; le
  gestionnaire règle le parc depuis la fiche de stock. Un espace ou un véhicule
  n'est pas compté ainsi : sa disponibilité se lit au créneau, dans le planning.
- **Règle de chevauchement** — « Les créneaux qui se chevauchent sont bloqués
  automatiquement » (note de bas de page de l'écran Réservations) est appliquée,
  mais elle compte les exemplaires : un espace n'accueille qu'une réservation à
  la fois, tandis que du matériel en plusieurs unités accepte autant de demandes
  simultanées qu'il en reste. Le blocage n'intervient qu'au dernier exemplaire,
  et la demande fautive est nommée.
- **Cycle de vie** — toute demande déposée part *En attente*, puis suit le
  chemin *Validée → En cours → Restitué / Terminée*. Le gestionnaire valide,
  refuse ou clôture ; l'étudiant annule. L'état de la ressource et les compteurs
  suivent. Le mode d'accès de la ressource (*accès direct* ou *validation
  requise*) reste indiqué au moment de la saisie, mais ne court-circuite pas la
  validation.
- **Rôles** — le sélecteur « Vue de démonstration » de l'en-tête bascule entre
  Étudiant, Professeur et Gestionnaire. Seul le gestionnaire voit les actions de
  validation.
- **Salles libres** — premier onglet de l'écran Réservations : une barre par
  espace et par jour, de 8 h à 20 h. Les plages prises sont pleines (violet pour
  les autres, ambre en attente de validation, orange pour les siennes), le reste
  est libre. Un clic sur une plage libre ouvre la réservation déjà remplie sur ce
  créneau. La journée en cours tient compte de l'heure : elle ne propose pas un
  créneau déjà entamé, et sur téléphone les jours révolus ne sont pas affichés.
- **Réservations / Historique** — onglets avec compteurs calculés, recherche,
  filtres ressource / période / statut.
- **Persistance** — l'état est conservé dans le `localStorage` du navigateur.

## Sur téléphone et tablette

L'espace de travail est utilisable du plus petit téléphone au grand écran, sans
défilement horizontal.

| Palier | Ce qui change |
| ------ | ------------- |
| ≤ 1240 px | Les grilles à deux colonnes se replient |
| ≤ 980 px | La barre latérale devient un tiroir, ouvert par le bouton de menu ; le fil d'Ariane laisse place au titre de l'écran |
| ≤ 860 px | La grille des disponibilités devient une carte par espace, ses sept jours empilés |
| ≤ 720 px | Barre d'onglets fixe en bas, tableaux et listes en cartes, filtres empilés, titres et boutons pleine largeur |
| ≤ 620 px | Les fenêtres deviennent des feuilles glissant depuis le bas ; le panier occupe tout l'écran |
| ≤ 420 px | Marges et tailles resserrées |

Deux partis pris :

- **La barre d'onglets du bas ne porte que l'espace de travail.** Ce sont les
  cinq gestes quotidiens d'un étudiant, et le pouce les atteint sans effort.
  L'administration reste dans le tiroir latéral.
- **Les tableaux ne défilent pas horizontalement, ils se réorganisent.** Chaque
  ligne devient une carte dont les cellules portent le nom de leur colonne
  (`data-label`), puisque l'en-tête disparaît. Seul le planning du gestionnaire
  garde un défilement latéral : une grille de sept jours ne se replie pas.

Sur l'écran des salles libres, l'onglet masque la recherche et le bouton
« Réserver un créneau » : la grille est déjà le moyen de réserver, et ces deux
éléments repoussaient la première salle hors de l'écran.

Les zones tactiles passent à 42 px, les barres respectent `env(safe-area-inset-bottom)`
pour les téléphones à encoche, et les notifications se posent au-dessus de la
barre d'onglets.

## Organisation du code

```
src/
├── components/     Sidebar, Topbar, listes, fenêtres, jeu d'icônes
├── data/           Types métier et jeu de démonstration
├── lib/            Formatage des dates, règles métier
├── pages/          Un fichier par écran
│   └── admin/      Les cinq écrans d'administration
├── store/          Magasin React (reducer + sélecteurs)
└── styles/         tokens.css (variables Figma) + global.css
```

### L'état d'une référence se déduit de son stock

`src/lib/stock.ts` distingue trois situations, parce que les confondre donnait
des chiffres faux : un exemplaire **sorti** (demande en cours ou en retard) a
quitté le campus, un exemplaire **réservé** (demande en attente ou validée) est
promis mais encore au placard, un exemplaire **en maintenance** est immobilisé.
`disponible = total − sortis − réservés − en maintenance`, et les quatre nombres
s'additionnent jusqu'au total : c'est ce qui rend la colonne du stock
vérifiable d'un coup d'œil. L'état affiché en découle : disponible tant qu'il en reste un, puis
*Emprunté* ou *Réservé*, et *En maintenance* quand tout le parc l'est. Le magasin
recalcule cet état après chaque mutation plutôt que de le suivre à la main.

Les totaux du jeu de démonstration sont choisis pour que le catalogue conserve
exactement les états de la maquette : le MacBook Pro et le Canon ont deux
exemplaires, tous deux engagés, et restent donc *Emprunté* et *Réservé*.

Garde-fous : on ne peut pas immobiliser plus d'exemplaires que le parc n'en
compte, ni descendre sous ce qui est déjà sorti, ni retirer du stock une
référence encore engagée. Le pilotage signale les références qu'il ne reste
qu'en un exemplaire.

### Fidélité à la maquette

- `src/styles/tokens.css` reprend les variables Figma sous leurs noms d'origine
  (`--ink`, `--secondaire`, `--line`, `--space-*`, `--radius-*`).
- `src/components/Icon.tsx` contient les tracés vectoriels exportés du kit UI,
  ramenés à la grille 19×19. Les icônes 47 px du catalogue partagent la même
  géométrie : Figma les exporte à l'échelle exacte (`stroke-width` 3,32917 =
  1,34583 × 47/19).
- `src/components/StatusBadge.tsx` reprend les 14 variantes du composant
  « Statut », chacune avec sa teinte, sa graisse et son rembourrage.
- Polices : **Manrope** pour les titres, **DM Sans** pour le texte.

### Le temps dans la démonstration

La maquette est datée (réservations de septembre 2026, « 15 sept. » au tableau de
bord). `DEMO_NOW` fige la date de référence au **16 septembre 2026** : sans cela
toutes les listes se videraient. Les enregistrements créés pendant une session
sont horodatés à partir de cette date, pour rester dans la même chronologie.

### Écarts assumés

- Le catalogue affiche **10 ressources**, comme l'annonce le compteur de la
  maquette, alors que la grille dessinée n'en montre que 9. La dixième est le
  *Studio audiovisuel*, cité par les écrans Réservations et Historique. C'est
  aussi ce qui rend le compteur « Disponibles maintenant : 05 » exact.
- Sur l'écran Réservations, la première ligne porte le nom du catalogue
  — *Salle 204 — Créativité*, créneau 14:00 – 16:00 — là où la maquette écrit
  *Salle créative · B204*, 14:00 – 17:00. Les deux écrans désignent la même
  réservation `#1003` sous deux noms différents ; le nom du catalogue a été
  retenu pour que le tableau de bord et la liste restent cohérents.
- Une ressource en maintenance a son bouton désactivé, ce que la maquette ne
  montre pas.
- Le bloc « Administration » de la sidebar reprend le gabarit du kit (cinq
  entrées), mais ses libellés ont été définis ici : la maquette y avait laissé
  une copie des entrées de l'espace de travail.
- L'icône « Membres » et le bouton de fermeture des fenêtres ne figurent pas dans
  le kit ; ils sont tracés sur la même grille 19×19 que les icônes Figma.
