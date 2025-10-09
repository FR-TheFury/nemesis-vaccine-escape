#!/bin/bash

# Configuration
CORRECT_NAME="Teo Debay"
CORRECT_EMAIL="teodebaypro@gmail.com"

echo "=========================================="
echo "Réécriture de l'historique Git"
echo "Remplacement des auteurs bots (gpt-engineer-app[bot], lovable-devbot) par $CORRECT_NAME"
echo "=========================================="
echo ""

# Supprimer la warning
export FILTER_BRANCH_SQUELCH_WARNING=1

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

echo ""
echo "Vérification locale (sans --all) :"
git shortlog -sne

echo "Extrait des derniers commits (auteur/commiteur) :"
git log --oneline -5 --format="%h | %an <%ae> | %cn <%ce>"

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
