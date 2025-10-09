#!/bin/bash

# Configuration - MODIFIEZ CES LIGNES AVEC VOS INFORMATIONS
CORRECT_NAME="Teo Debay"
CORRECT_EMAIL="teodebaypro@gmail.com"

echo "=========================================="
echo "Réécriture de l'historique Git"
echo "Remplacement de lovable-devbot par $CORRECT_NAME"
echo "=========================================="
echo ""

# Supprimer la warning
export FILTER_BRANCH_SQUELCH_WARNING=1

# Réécriture de l'historique
git filter-branch -f --env-filter "
CORRECT_NAME=\"$CORRECT_NAME\"
CORRECT_EMAIL=\"$CORRECT_EMAIL\"

if [ \"\$GIT_COMMITTER_NAME\" = \"lovable-devbot\" ]
then
    export GIT_COMMITTER_NAME=\"\$CORRECT_NAME\"
    export GIT_COMMITTER_EMAIL=\"\$CORRECT_EMAIL\"
fi
if [ \"\$GIT_AUTHOR_NAME\" = \"lovable-devbot\" ]
then
    export GIT_AUTHOR_NAME=\"\$CORRECT_NAME\"
    export GIT_AUTHOR_EMAIL=\"\$CORRECT_EMAIL\"
fi
" --tag-name-filter cat -- --branches --tags

echo ""
echo "Vérification des derniers commits :"
git log --oneline -5 --format="%h - %an <%ae> - %s"

echo ""
echo "=========================================="
echo "Push forcé vers GitHub..."
echo "=========================================="
git push --force origin main

echo ""
echo "Nettoyage..."
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now

echo ""
echo "=========================================="
echo "✅ Terminé !"
echo "=========================================="
