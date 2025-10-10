#!/bin/bash

# Configuration
CORRECT_NAME="Teo Debay"
CORRECT_EMAIL="teodebaypro@gmail.com"
BACKUP_BRANCH="backup-before-rewrite-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "⚠️  ATTENTION : Réécriture de l'historique Git"
echo "=========================================="
echo ""
echo "Cette opération va :"
echo "  - Remplacer TOUS les commits des bots par : $CORRECT_NAME <$CORRECT_EMAIL>"
echo "  - Créer une branche de backup : $BACKUP_BRANCH"
echo "  - Faire un push --force sur origin/main"
echo ""
echo "Bots ciblés :"
echo "  - gpt-engineer-app[bot]"
echo "  - lovable-devbot"
echo ""

# Confirmation
read -p "Voulez-vous continuer ? (tapez 'OUI' en majuscules) : " confirmation
if [ "$confirmation" != "OUI" ]; then
    echo "❌ Opération annulée."
    exit 0
fi

echo ""
echo "📦 Création d'une branche de backup..."
git branch "$BACKUP_BRANCH"
echo "✅ Branche de backup créée : $BACKUP_BRANCH"

# Supprimer la warning
export FILTER_BRANCH_SQUELCH_WARNING=1

echo ""
echo "🔄 Réécriture de l'historique en cours..."
echo ""

# Réécriture de l'historique
git filter-branch -f --env-filter "
CN=\"$CORRECT_NAME\"
CE=\"$CORRECT_EMAIL\"

AN=\"\$GIT_AUTHOR_NAME\"
AE=\"\$GIT_AUTHOR_EMAIL\"
CNM=\"\$GIT_COMMITTER_NAME\"
CEM=\"\$GIT_COMMITTER_EMAIL\"

# Cible les bots par nom OU email (author et committer)
if [ \"$AN\" = \"gpt-engineer-app[bot]\" ] || [ \"$AN\" = \"lovable-devbot\" ] || [ \"$AE\" = \"159125892+gpt-engineer-app[bot]@users.noreply.github.com\" ] || [ \"$AE\" = \"lovable-devbot@users.noreply.github.com\" ]; then
  export GIT_AUTHOR_NAME=\"$CN\"
  export GIT_AUTHOR_EMAIL=\"$CE\"
fi

if [ \"$CNM\" = \"gpt-engineer-app[bot]\" ] || [ \"$CNM\" = \"lovable-devbot\" ] || [ \"$CEM\" = \"159125892+gpt-engineer-app[bot]@users.noreply.github.com\" ] || [ \"$CEM\" = \"lovable-devbot@users.noreply.github.com\" ]; then
  export GIT_COMMITTER_NAME=\"$CN\"
  export GIT_COMMITTER_EMAIL=\"$CE\"
fi
" --tag-name-filter cat -- --branches --tags

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la réécriture de l'historique !"
    echo "Vous pouvez restaurer avec : git checkout $BACKUP_BRANCH"
    exit 1
fi

echo ""
echo "✅ Réécriture terminée !"
echo ""
echo "📊 Vérification locale :"
git shortlog -sne | head -10

echo ""
echo "📝 Extrait des derniers commits :"
git log --oneline -5 --format="%h | %an <%ae> | %cn <%ce>"

echo ""
echo "=========================================="
echo "⚠️  Push forcé vers GitHub..."
echo "=========================================="
read -p "Confirmez le push --force ? (tapez 'PUSH') : " push_confirm

if [ "$push_confirm" != "PUSH" ]; then
    echo "❌ Push annulé. L'historique local a été modifié mais pas GitHub."
    echo "Pour restaurer : git checkout $BACKUP_BRANCH"
    exit 0
fi

git push --force origin main

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du push !"
    echo "Restaurez avec : git checkout $BACKUP_BRANCH"
    exit 1
fi

echo ""
echo "🧹 Nettoyage..."
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now

echo ""
echo "=========================================="
echo "✅ Terminé avec succès !"
echo "=========================================="
echo ""
echo "La branche de backup existe toujours : $BACKUP_BRANCH"
echo "Vous pouvez la supprimer avec : git branch -D $BACKUP_BRANCH"
echo ""
echo "⚠️  IMPORTANT : Tous les collaborateurs doivent faire :"
echo "  git fetch origin"
echo "  git reset --hard origin/main"
