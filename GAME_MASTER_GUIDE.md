# 🎮 Guide du Game Master - NEMESIS : Le Dernier Vaccin

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Configuration initiale](#configuration-initiale)
3. [Gestion des codes de porte](#gestion-des-codes-de-porte)
4. [Personnalisation des indices](#personnalisation-des-indices)
5. [Contrôles pendant la partie](#contrôles-pendant-la-partie)
6. [Déroulement d'une partie](#déroulement-dune-partie)
7. [Résolution des problèmes](#résolution-des-problèmes)

---

## 🎯 Vue d'ensemble

NEMESIS est un escape game hybride physique/numérique où les joueurs :
1. Résolvent **3 énigmes numériques** par zone
2. Chaque énigme révèle un **indice textuel**
3. Les 3 indices pointent vers une **boîte physique** dans la salle
4. La boîte contient le **code de la porte** pour accéder à la zone suivante

### Rôle du Game Master
- Préparer les boîtes physiques avec les codes
- Configurer les codes de porte dans le système
- Personnaliser les textes des indices
- Surveiller le déroulement de la partie
- Intervenir manuellement si nécessaire

---

## 🔧 Configuration initiale

### Étape 1 : Création de la session

1. Ouvrez l'application NEMESIS
2. Cliquez sur **"Créer une session"**
3. Entrez votre pseudo de Game Master
4. **Configuration des codes de porte** (optionnel à cette étape) :
   - Code Zone 1 : Ex. `1234`
   - Code Zone 2 : Ex. `5678`
   - Code Zone 3 : Ex. `9012`
5. Cliquez sur **"Démarrer la session"**

> 💡 **Astuce** : Vous pouvez configurer les codes plus tard depuis les "Contrôles Game Master" dans le HUD.

### Étape 2 : Préparation des boîtes physiques

Pour chaque zone, préparez une boîte/enveloppe contenant :
- Le code de la porte (4 chiffres recommandés)
- Optionnel : éléments de décor, faux indices, ambiance

**Exemples de cachettes :**
- Zone 1 : Boîte bleue sous le bureau
- Zone 2 : Enveloppe dans le tiroir du labo
- Zone 3 : Coffret rouge dans la salle de confinement

---

## 🔐 Gestion des codes de porte

### Configuration des codes

Les codes peuvent être configurés de deux manières :

**Pendant la création de session :**
- Champs dédiés dans le formulaire de création

**Pendant la partie :**
1. Ouvrez le HUD (barre en haut)
2. Cliquez sur l'onglet **"Game Master"** (visible uniquement pour l'hôte)
3. Section **"Codes des Portes"**
4. Entrez les codes pour Zone 1, 2, et 3
5. Cliquez sur **"Sauvegarder les codes"**

### Format des codes

- **Accepté** : Nombres, lettres, symboles
- **Exemples valides** : 
  - `1234`
  - `ABCD`
  - `12-34`
  - `CODE1`
- La validation ignore les espaces et tirets

---

## 📝 Personnalisation des indices

### Fichier de configuration

Les textes des indices sont dans : `src/data/hints.json`

```json
{
  "zones": [
    {
      "id": "zone1",
      "name": "Bureau du Dr Morel",
      "hints": {
        "p1": "🔍 Indice 1 : Texte personnalisé...",
        "p2": "🔍 Indice 2 : Texte personnalisé...",
        "p3": "🔍 Indice 3 : Texte personnalisé..."
      }
    }
  ]
}
```

### Conseils pour rédiger les indices

✅ **Bons indices :**
- Précis et sans ambiguïté
- Font référence à des éléments physiques de la salle
- Progressifs (de plus en plus précis)

❌ **À éviter :**
- Indices trop vagues
- Références à des objets inexistants
- Indices redondants

**Exemple de progression :**
- `p1` : "Cherchez près de l'entrée" (zone large)
- `p2` : "La boîte bleue sous la table" (objet précis)
- `p3` : "Le code est écrit en rouge à l'intérieur" (détail final)

---

## 🎛️ Contrôles pendant la partie

### Panneau "Contrôles Game Master"

Accessible via le HUD → Onglet "Game Master"

#### Section "Codes des Portes"
- Modifier les codes à tout moment
- Sauvegarder les changements
- Les modifications sont synchronisées en temps réel

#### Section "État des Portes"

Pour chaque zone, vous pouvez voir :
- 🔒 **Verrouillée** (rouge) : En attente du code
- 🔓 **Déverrouillée** (vert) : Accès accordé

**Bouton "Forcer le déverrouillage"** :
- Bypass complet de la vérification du code
- Tous les joueurs passent immédiatement à la zone suivante
- L'action est enregistrée dans les logs

### Quand utiliser le déverrouillage manuel ?

✅ **Situations justifiées :**
- Problème technique (boîte perdue, code illisible)
- Joueurs bloqués malgré tous les efforts
- Gestion du temps (fin de session)

❌ **À éviter :**
- Utilisation systématique (casse le gameplay)
- Sans prévenir les joueurs

---

## 🎬 Déroulement d'une partie

### Phase 1 : Zone 1 - Bureau du Dr Morel

1. **Les joueurs résolvent les 3 énigmes :**
   - Énigme 1 (Livre/César) → Indice 1 révélé
   - Énigme 2 (Cadenas) → Indice 2 révélé
   - Énigme 3 (Dictaphone) → Indice 3 révélé

2. **Recherche physique :**
   - Les joueurs lisent les 3 indices
   - Ils fouillent la salle pour trouver la boîte
   - Ils récupèrent le code de la porte

3. **Déverrouillage :**
   - Interface du cadenas apparaît automatiquement
   - Les joueurs entrent le code trouvé
   - Si correct → Accès à la Zone 2

### Phase 2 : Zone 2 - Laboratoire de Microbiologie

*Même processus que Zone 1*

### Phase 3 : Zone 3 - Salle de Confinement

*Même processus que Zone 1 et 2*

**Fin de partie :**
- Tous les puzzles de Zone 3 résolus → Code final trouvé
- Déverrouillage de la Zone 3 → **Mission accomplie !** 🏆

---

## 🔧 Résolution des problèmes

### Problème : Les indices ne s'affichent pas

**Solution :**
1. Vérifier que le puzzle est bien résolu (checkmark vert)
2. Ouvrir le panneau "Indices Révélés" dans le HUD
3. Rafraîchir la page si nécessaire

### Problème : Le cadenas de porte n'apparaît pas

**Causes possibles :**
- Les 3 puzzles de la zone ne sont pas tous résolus
- Problème de synchronisation

**Solution :**
- Vérifier l'état des puzzles dans la base de données
- Utiliser le déverrouillage manuel si nécessaire

### Problème : Le code correct est refusé

**Solution :**
1. Vérifier que le code configuré correspond à celui dans la boîte
2. Tester avec le format exact (avec/sans espaces/tirets)
3. Utiliser le déverrouillage manuel si le problème persiste

### Problème : Déconnexion d'un joueur

**Comportement :**
- L'état de la partie est sauvegardé en temps réel
- Le joueur peut se reconnecter avec le même code de session
- Tous les progrès sont restaurés

---

## 📊 Statistiques et suivi

### Données accessibles

Dans l'interface Game Master :
- Nombre d'énigmes résolues par zone
- Indices révélés
- État des portes
- Temps écoulé

### Logs d'activité

Toutes les actions importantes sont enregistrées :
- Résolution d'énigmes
- Révélation d'indices
- Tentatives de codes (correctes/incorrectes)
- Déverrouillages manuels

---

## 📞 Support

En cas de problème technique :
1. Consulter les logs dans la console du navigateur
2. Vérifier l'état de la base de données Supabase
3. Redémarrer la session si nécessaire

---

## 🎓 Conseils avancés

### Personnalisation de l'expérience

- **Difficulté** : Ajustez la clarté des indices
- **Immersion** : Ajoutez des faux indices dans les boîtes
- **Narration** : Utilisez le chat pour donner du contexte

### Gestion du temps

- Surveillez le timer en haut du HUD
- Prévoyez ~15 minutes par zone
- Utilisez les déverrouillages manuels pour respecter l'horaire

### Ambiance

- Jouez une musique d'ambiance scientifique
- Tamisez les lumières pour les zones 2 et 3
- Ajoutez des éléments de décor (fioles, microscope factice)

---

**Version** : 1.0  
**Dernière mise à jour** : 2025

🎮 Bonne partie !
