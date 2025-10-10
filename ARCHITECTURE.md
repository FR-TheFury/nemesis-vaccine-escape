# Architecture du Projet - Protocol Z

Cette documentation explique comment fonctionne le jeu Protocol Z de manière simple et directe.

## Vue d'ensemble

Protocol Z est un escape game multijoueur en temps réel. Les joueurs collaborent pour résoudre des énigmes dans trois zones différentes, avec un timer qui tourne. Le jeu utilise Supabase pour la synchronisation en temps réel et la persistance des données.

## Structure générale du projet

Le projet est divisé en plusieurs parties principales:

### 1. Pages principales

**src/pages/Home.tsx**
La page d'accueil où les joueurs créent ou rejoignent une session. C'est le point d'entrée du jeu.

**src/pages/Game.tsx**
Le coeur du jeu. Cette page gère tout le déroulement de la partie:
- L'écran d'attente avant le début
- Le préchargement des assets (images, sons)
- L'affichage des différentes zones
- La synchronisation entre joueurs
- La fin de partie

Elle orchestre tous les autres composants et hooks.

**src/pages/zones/Zone1.tsx, Zone2.tsx, Zone3.tsx**
Chaque zone est une page séparée qui contient:
- Le décor visuel de la zone
- Les énigmes spécifiques à cette zone
- La logique d'interaction avec les objets
- Le cadenas de porte pour passer à la zone suivante

### 2. Composants de jeu

**src/components/game/HUD.tsx**
L'interface utilisateur principale qui affiche:
- Le timer
- Le chat
- L'inventaire
- La liste des joueurs
- Les indices disponibles
- Les contrôles pour l'hôte

**src/components/game/Chat.tsx**
Le système de messagerie en temps réel entre joueurs. Chaque message est stocké dans Supabase et synchronisé instantanément.

**src/components/game/Timer.tsx**
Le chronomètre du jeu qui:
- Compte à rebours depuis 60 minutes
- Se synchronise entre tous les joueurs
- Peut être mis en pause par l'hôte
- Déclenche la fin de partie quand il atteint zéro

**src/components/game/Inventory.tsx**
Affiche les objets collectés par l'équipe. Tous les joueurs voient le même inventaire car il est partagé.

**src/components/game/DoorPadlock.tsx**
Le cadenas à 4 chiffres qui apparaît quand toutes les énigmes d'une zone sont résolues. Le code est basé sur des éléments chimiques du tableau périodique.

### 3. Composants d'énigmes

Chaque énigme est un composant indépendant dans **src/components/puzzles/**:

**CaesarCipher.tsx**
Un message chiffré avec le code de César. Le joueur doit trouver le décalage correct pour déchiffrer le message.

**CodeLocker.tsx**
Un casier à code à 4 chiffres. Utilisé pour le casier anatomique de la Zone 1.

**DNASequence.tsx**
Une énigme où il faut reconstituer une séquence ADN dans le bon ordre.

**PeriodicTable.tsx**
Une énigme basée sur le tableau périodique des éléments. Il faut résoudre des équations pour trouver les symboles chimiques.

**ColorTubesPuzzle.tsx**
Un puzzle de tri de tubes colorés. Il faut séparer les couleurs en utilisant un tube vide comme tampon.

**LiquidMixer.tsx**
Une énigme de mélange de liquides dans le bon ordre (Bleu, Vert, Rouge).

**FinalCode.tsx**
L'énigme finale où il faut entrer le mot VACCIN pour terminer le jeu.

### 4. Hooks personnalisés

Les hooks sont des fonctions React réutilisables qui encapsulent la logique métier.

**useGameSession.ts**
Gère le cycle de vie d'une session:
- Création d'une nouvelle session avec un code unique
- Rejoindre une session existante
- Quitter une session
- Charger les données de session depuis Supabase

Stocke aussi l'ID du joueur dans le localStorage pour reconnecter automatiquement.

**useRealtimeSync.ts**
Configure les canaux Supabase Realtime pour synchroniser:
- Les mises à jour de session (timer, zone, puzzles résolus)
- Les joueurs qui rejoignent ou quittent
- Les messages de chat

Utilise les "postgres_changes" de Supabase pour écouter les modifications en temps réel sur les tables.

**usePlayerPresence.ts**
Met à jour automatiquement le champ "last_seen" du joueur toutes les 30 secondes. Si un joueur ne répond plus pendant 60 secondes, il est marqué comme déconnecté.

**useTimer.ts**
Gère le timer de jeu:
- Compte à rebours uniquement côté hôte (pour éviter les désynchronisations)
- Synchronise le temps avec tous les autres joueurs via Supabase
- Sauvegarde le temps restant toutes les 5 secondes
- Déclenche la fin de partie quand le temps est écoulé

**usePuzzleSolver.ts**
La logique centrale de résolution d'énigmes:
1. Marque une énigme comme résolue dans la base
2. Révèle l'indice correspondant (chaque énigme débloque un indice)
3. Vérifie si toutes les énigmes de la zone sont résolues
4. Si oui, affiche le cadenas de la porte
5. Envoie un message système dans le chat

Utilise un système de mapping pour associer chaque puzzle à son indice (p1, p2, p3).

**useInventory.ts**
Gère l'inventaire partagé:
- Ajouter un objet (mis à jour dans Supabase)
- Retirer un objet
- Vérifier si un objet est présent
- Afficher une récompense quand un objet est collecté
- Envoyer un message dans le chat

**useRewardQueue.ts**
Gère l'affichage séquentiel des récompenses. Quand plusieurs énigmes sont résolues rapidement, les récompenses s'affichent les unes après les autres au lieu de se superposer.

### 5. Logique métier

**src/lib/gameLogic.ts**
Fonctions utilitaires pour le jeu:
- Vérifier si toutes les énigmes d'une zone sont résolues
- Valider les solutions d'énigmes
- Déchiffrer le code de César
- Récupérer les indices d'une énigme
- Compter le nombre d'énigmes résolues

**src/lib/sessionCode.ts**
Génération et validation des codes de session:
- Génère un code aléatoire de 6 caractères (A-Z, 0-9)
- Valide le format d'un code
- Contient les codes fixes des portes pour chaque zone

### 6. Données de jeu

**src/data/enigmes.json**
Le fichier central qui définit toutes les énigmes du jeu:
- Structure des 3 zones
- Détails de chaque énigme (solution, indices, récompenses)
- Configuration du timer
- Distracteurs (fausses pistes)

Chaque énigme a:
- Un ID unique (ex: zone1_caesar)
- Un nom descriptif
- Les données nécessaires (code, séquence, etc.)
- Les indices progressifs
- La récompense associée

**src/data/hints.json**
Les indices pour chaque zone. Structuré en zone1, zone2, zone3 avec p1, p2, p3 pour chaque énigme principale.

## Architecture de la base de données

### Table: sessions
Stocke l'état complet d'une partie:
- **code**: Le code unique de session (6 caractères)
- **host_id**: L'ID du joueur hôte
- **status**: État de la partie (waiting, active, completed, failed)
- **current_zone**: Zone actuelle (1, 2 ou 3)
- **timer_remaining**: Secondes restantes
- **timer_running**: Si le timer est en cours
- **solved_puzzles**: JSON avec les énigmes résolues {puzzle_id: true}
- **revealed_hints**: JSON avec les indices débloqués par zone
- **door_visible**: JSON qui contrôle l'affichage des cadenas
- **door_codes**: JSON avec les codes des 3 portes
- **door_status**: JSON avec le statut de chaque porte (locked/unlocked)
- **inventory**: JSON avec les objets collectés
- **is_preloading**: Booléen pour l'écran de chargement

### Table: players
Liste des joueurs dans une session:
- **id**: UUID unique du joueur
- **session_code**: Code de la session
- **pseudo**: Nom du joueur
- **is_host**: Si c'est le Game Master
- **is_connected**: État de connexion
- **last_seen**: Timestamp de dernière activité
- **joined_at**: Timestamp d'arrivée

### Table: chat_messages
Historique des messages:
- **id**: UUID du message
- **session_code**: Code de la session
- **player_pseudo**: Nom de l'expéditeur
- **message**: Contenu du message
- **type**: Type (chat ou system)
- **metadata**: JSON pour données additionnelles
- **created_at**: Timestamp

## Flux de jeu

### 1. Création / Rejoindre une session

L'utilisateur arrive sur Home.tsx et peut:
- Créer une session: génère un code, crée une entrée session + player, redirige vers /game/:code
- Rejoindre une session: vérifie le code, crée un player, redirige vers /game/:code

Le système stocke {sessionCode, playerId} dans localStorage pour permettre la reconnexion.

### 2. Écran d'attente

Tant que session.status === "waiting":
- Affiche la liste des joueurs connectés
- Affiche le code de session
- Seul l'hôte voit le bouton "Démarrer la partie"
- Tous les joueurs sont synchronisés en temps réel

### 3. Préchargement

Quand l'hôte clique sur "Démarrer":
1. Met session.is_preloading = true
2. Charge les images et sons en séquence
3. Broadcast la progression via un canal Supabase
4. Tous les joueurs voient la barre de progression
5. Quand terminé: session.status = "active" et timer_running = true

### 4. Déroulement d'une zone

Pour chaque zone:
1. Les joueurs explorent et cliquent sur les objets interactifs
2. Chaque objet ouvre une modale avec une énigme
3. Quand un joueur résout une énigme:
   - usePuzzleSolver.solvePuzzle() est appelé
   - solved_puzzles est mis à jour
   - Un indice est révélé
   - Une récompense s'affiche
   - Un message système est envoyé dans le chat
4. Quand les 3 énigmes principales sont résolues:
   - door_visible devient true pour cette zone
   - Le cadenas apparaît à l'écran
5. Quand le code du cadenas est correct:
   - door_status passe à "unlocked"
   - Les joueurs peuvent naviguer vers la zone suivante

### 5. Zone 3 spéciale

La Zone 3 est différente car:
- Quand la dernière énigme est résolue ET que la porte est déverrouillée
- Le jeu lance automatiquement la cinématique finale
- Après la cinématique: session.status = "completed"
- Redirection vers l'écran de fin

### 6. Fin de partie

Deux scénarios possibles:
- **Succès**: Toutes les énigmes résolues, cinématique, GameEnd avec statistiques
- **Échec**: Timer à zéro, session.status = "failed", GameEnd avec message d'échec

## Système de synchronisation temps réel

Le jeu utilise Supabase Realtime de deux manières:

### 1. Postgres Changes (modifications de tables)
Écoute les INSERT, UPDATE, DELETE sur les tables:
- Sessions: pour synchroniser l'état du jeu
- Players: pour voir qui rejoint/quitte
- Chat_messages: pour recevoir les messages instantanément

### 2. Broadcast (canaux de communication)
Utilisé pour la progression du préchargement. Le canal `progress-{sessionCode}` permet à l'hôte d'envoyer le pourcentage de chargement à tous les joueurs.

## Gestion des permissions (RLS)

Toutes les tables ont Row Level Security activé avec des politiques permissives:
- Tout le monde peut lire/écrire (car pas d'authentification)
- La sécurité repose sur le code de session comme clé partagée
- Les données sont filtrées par session_code

## Cas particuliers et optimisations

### Timer uniquement côté hôte
Seul l'hôte fait tourner le timer localement. Les autres joueurs reçoivent les mises à jour via Supabase. Cela évite les problèmes de désynchronisation.

### Sauvegarde du timer
Le timer est sauvegardé toutes les 5 secondes pour éviter trop de requêtes, mais garder une persistance acceptable en cas de déconnexion.

### Reconnexion automatique
Le localStorage permet à un joueur qui rafraîchit la page de se reconnecter automatiquement sans perdre sa progression.

### File d'attente des récompenses
Les récompenses sont mises en file pour éviter qu'elles ne se superposent. Une nouvelle récompense ne s'affiche que quand la précédente est fermée.

### Animations conditionnelles
Les animations de l'écran d'attente ne jouent qu'une seule fois au montage initial pour éviter les flashes visuels lors des mises à jour de preloadProgress.

### Codes de porte fixes
Les codes des portes sont basés sur des éléments chimiques et sont les mêmes pour toutes les parties. Ils sont générés une fois à la création de session et stockés dans door_codes.

## Points d'entrée pour modifier le jeu

### Ajouter une énigme
1. Créer le composant dans src/components/puzzles/
2. Ajouter les données dans src/data/enigmes.json
3. Ajouter les indices dans src/data/hints.json
4. Ajouter le mapping dans usePuzzleSolver.ts
5. Intégrer le composant dans la Zone concernée

### Modifier le timer
Changer la valeur dans enigmes.json (en secondes) et dans useGameSession (valeur par défaut).

### Changer les codes de porte
Modifier les valeurs dans src/lib/sessionCode.ts dans FIXED_DOOR_CODES.

### Ajouter une zone
1. Créer src/pages/zones/Zone4.tsx
2. Ajouter "zone4" dans enigmes.json
3. Mettre à jour la logique de navigation dans Game.tsx
4. Ajouter un cas dans le switch de renderZone()

### Modifier les assets
Remplacer les fichiers dans src/assets/ et mettre à jour les imports dans Game.tsx pour le préchargement.

## Déploiement

Le projet utilise GitHub Pages avec GitHub Actions:
- Le workflow est défini dans .github/workflows/deploy.yml
- Vite génère un build statique
- Le base path est configuré pour /nemesis-vaccine-escape/
- Les assets sont dans public/ pour être accessibles

## Limitations connues

### Pas d'authentification
Le jeu ne nécessite pas de compte utilisateur. L'identité repose uniquement sur le pseudo et le code de session.

### Sécurité des codes de porte
Les codes étant dans le frontend, un joueur technique pourrait les trouver dans le code source ou dans Supabase.

### Nettoyage des sessions
Il n'y a pas de nettoyage automatique des vieilles sessions. Une fonction cleanup_old_sessions existe mais n'est pas appelée automatiquement.

### Pas de système de replay
Une fois la partie terminée, impossible de rejouer sans créer une nouvelle session.

### Latence réseau
Le jeu repose sur Supabase. Une mauvaise connexion peut causer des délais dans la synchronisation.

## Conclusion

L'architecture du jeu est modulaire avec une séparation claire:
- Pages pour la navigation
- Composants pour l'UI
- Hooks pour la logique métier
- Supabase pour la persistance et le temps réel

Cette structure permet de facilement ajouter de nouvelles énigmes, zones, ou fonctionnalités sans casser l'existant.
