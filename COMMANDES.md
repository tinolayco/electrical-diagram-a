# 🛠️ Commandes Utiles - iSchémateur

**Par Normand Rocheleau**

Guide de référence rapide pour les commandes fréquemment utilisées.

## 📦 NPM / Installation

```bash
# Installer toutes les dépendances
npm install

# Installer une dépendance spécifique
npm install nom-du-package

# Installer une dépendance de développement
npm install -D nom-du-package

# Mettre à jour les dépendances
npm update

# Vérifier les packages obsolètes
npm outdated

# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Développement

```bash
# Lancer le serveur de développement
npm run dev
# → http://localhost:5173

# Build pour production
npm run build
# → Génère le dossier dist/

# Prévisualiser le build de production
npm run preview
# → http://localhost:4173

# Vérifier le code avec ESLint
npm run lint

# Optimiser les dépendances
npm run optimize
```

## 🔧 Git / GitHub

### Configuration Initiale

```bash
# Configurer votre identité Git (première fois)
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"

# Initialiser un nouveau repository
git init

# Ajouter un remote GitHub
git remote add origin https://github.com/votre-username/ischemateur.git

# Vérifier les remotes
git remote -v
```

### Workflow Quotidien

```bash
# Vérifier le statut
git status

# Voir les modifications
git diff

# Ajouter tous les fichiers modifiés
git add .

# Ajouter un fichier spécifique
git add chemin/vers/fichier.tsx

# Committer avec message
git commit -m "✨ Description du changement"

# Pousser vers GitHub
git push

# Pousser la première fois
git push -u origin main

# Récupérer les derniers changements
git pull

# Récupérer sans merger
git fetch
```

### Branches

```bash
# Créer une nouvelle branche
git checkout -b feature/nom-de-la-fonctionnalite

# Basculer vers une branche existante
git checkout nom-de-la-branche

# Lister toutes les branches
git branch

# Lister les branches distantes
git branch -r

# Fusionner une branche dans la branche actuelle
git merge nom-de-la-branche

# Supprimer une branche locale
git branch -d nom-de-la-branche

# Supprimer une branche distante
git push origin --delete nom-de-la-branche
```

### Tags et Releases

```bash
# Créer un tag
git tag v1.0.0

# Créer un tag annoté (recommandé)
git tag -a v1.0.0 -m "Version 1.0.0 - Release initiale"

# Lister tous les tags
git tag

# Pousser un tag vers GitHub
git push origin v1.0.0

# Pousser tous les tags
git push --tags

# Supprimer un tag local
git tag -d v1.0.0

# Supprimer un tag distant
git push origin --delete v1.0.0
```

### Annulations

```bash
# Annuler les modifications d'un fichier (avant staging)
git checkout -- fichier.tsx

# Désindexer un fichier (après git add)
git reset HEAD fichier.tsx

# Annuler le dernier commit (garde les changements)
git reset --soft HEAD~1

# Annuler le dernier commit (supprime les changements)
git reset --hard HEAD~1

# Revenir à un commit spécifique
git reset --hard abc123

# Créer un commit qui annule un commit précédent
git revert abc123
```

### Historique

```bash
# Voir l'historique des commits
git log

# Historique condensé
git log --oneline

# Historique avec graphe
git log --graph --oneline --all

# Voir qui a modifié chaque ligne d'un fichier
git blame fichier.tsx

# Voir les changements d'un commit spécifique
git show abc123
```

## 🐛 Dépannage Git

### Résoudre les Conflits

```bash
# Voir les fichiers en conflit
git status

# Après résolution manuelle des conflits
git add fichier-resolu.tsx
git commit -m "🔀 Résolution des conflits"

# Abandonner un merge en cours
git merge --abort

# Abandonner un rebase en cours
git rebase --abort
```

### Problèmes Courants

```bash
# Erreur "remote origin already exists"
git remote remove origin
git remote add origin https://github.com/votre-username/ischemateur.git

# Forcer un push (ATTENTION : dangereux!)
git push --force
# Utilisez plutôt : git push --force-with-lease

# Récupérer après un reset accidentel
git reflog
git reset --hard abc123  # ID du commit à récupérer

# Nettoyer les fichiers non trackés
git clean -fd
```

## 🔍 Recherche et Inspection

```bash
# Rechercher dans tout le code
git grep "texte à rechercher"

# Rechercher dans l'historique
git log --all --grep="mot-clé"

# Trouver quel commit a introduit un bug
git bisect start
git bisect bad  # Commit actuel est mauvais
git bisect good abc123  # Ce commit était bon
# Git va tester automatiquement...
```

## 📊 Statistiques

```bash
# Nombre de commits par auteur
git shortlog -sn

# Statistiques d'un fichier
git log --stat fichier.tsx

# Voir la taille du repository
git count-objects -vH

# Contributions sur la dernière semaine
git log --since="1 week ago" --oneline
```

## 🧹 Nettoyage

```bash
# Nettoyer les branches fusionnées
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Optimiser le repository local
git gc --aggressive --prune=now

# Supprimer tous les fichiers ignorés
git clean -fdX
```

## 🌐 GitHub CLI (gh)

Si vous avez installé [GitHub CLI](https://cli.github.com/) :

```bash
# Créer un repository
gh repo create ischemateur --public

# Voir les issues
gh issue list

# Créer une issue
gh issue create

# Créer une PR
gh pr create

# Voir les PRs
gh pr list

# Merger une PR
gh pr merge 123

# Clone avec GitHub CLI
gh repo clone votre-username/ischemateur
```

## 🐳 Docker (Si configuré)

```bash
# Build l'image Docker
docker build -t ischemateur .

# Lancer le container
docker run -d -p 8080:80 ischemateur

# Voir les containers en cours
docker ps

# Arrêter un container
docker stop container-id

# Voir les logs
docker logs container-id

# Supprimer un container
docker rm container-id

# Supprimer une image
docker rmi ischemateur
```

## 📝 Commandes Projet Spécifiques

```bash
# Générer un export de toutes les bibliothèques
# (À faire manuellement dans l'interface)

# Backup des données IndexedDB
# Dans la console du navigateur:
# Application → Storage → IndexedDB → Exporter

# Réinitialiser complètement le projet
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

## 🎯 Messages de Commit Emoji

Utilisez ces emojis pour des messages de commit expressifs :

```bash
git commit -m "✨ feat: Nouvelle fonctionnalité"
git commit -m "🐛 fix: Correction de bug"
git commit -m "📝 docs: Mise à jour documentation"
git commit -m "🎨 style: Amélioration du style/formatage"
git commit -m "♻️ refactor: Refactoring du code"
git commit -m "⚡ perf: Amélioration des performances"
git commit -m "✅ test: Ajout de tests"
git commit -m "🔧 chore: Tâches de maintenance"
git commit -m "🚀 deploy: Déploiement"
git commit -m "🔒 security: Correction de sécurité"
git commit -m "⬆️ deps: Mise à jour des dépendances"
git commit -m "⬇️ deps: Downgrade des dépendances"
git commit -m "📦 build: Changements du build"
git commit -m "👷 ci: Changements CI/CD"
git commit -m "🔀 merge: Fusion de branches"
git commit -m "🎉 init: Commit initial"
git commit -m "🚧 wip: Work in progress"
git commit -m "💄 ui: Mise à jour UI/UX"
git commit -m "🌐 i18n: Internationalisation"
```

## 🔗 Liens Utiles

- **Git Documentation** : https://git-scm.com/doc
- **GitHub Docs** : https://docs.github.com
- **Conventional Commits** : https://www.conventionalcommits.org
- **Semantic Versioning** : https://semver.org
- **Keep a Changelog** : https://keepachangelog.com

## 💡 Astuces

### Alias Git Utiles

Ajoutez dans `~/.gitconfig` :

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --graph --oneline --all --decorate
    amend = commit --amend --no-edit
```

Utilisation :
```bash
git st           # au lieu de git status
git co main      # au lieu de git checkout main
git visual       # voir le graphe des commits
```

### Hook Pre-commit

Créez `.git/hooks/pre-commit` :

```bash
#!/bin/sh
npm run lint
npm run build
```

Rendez-le exécutable :
```bash
chmod +x .git/hooks/pre-commit
```

---

**Conçu et réalisé par Normand Rocheleau**

💡 Astuce : Marquez cette page comme favoris pour y accéder rapidement !
