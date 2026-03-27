# 🚀 Guide de Configuration GitHub pour iSchémateur

**Par Normand Rocheleau**

Ce guide vous explique comment mettre votre application iSchémateur dans votre propre repository GitHub.

## 📋 Prérequis

- Un compte GitHub (gratuit ou payant)
- Git installé sur votre ordinateur ([Télécharger Git](https://git-scm.com/downloads))
- Accès en ligne de commande (Terminal sur Mac/Linux, Git Bash sur Windows)

## 🎯 Option 1 : Créer un Nouveau Repository (Recommandé)

### Étape 1 : Préparer votre projet localement

1. **Télécharger tous les fichiers du projet**
   - Copiez tous les fichiers de votre projet dans un dossier local sur votre ordinateur
   - Nommez le dossier `ischemateur` (ou le nom de votre choix)

2. **Créer un fichier `.gitignore` approprié** (déjà inclus)
   - Vérifiez que le fichier `.gitignore` à la racine contient les bonnes exclusions

### Étape 2 : Créer le repository sur GitHub

1. **Connectez-vous à GitHub** : https://github.com
2. **Cliquez sur le bouton "+" en haut à droite** → "New repository"
3. **Remplissez les informations** :
   - **Repository name** : `ischemateur` (ou votre choix)
   - **Description** : "Analyseur de schémas électriques avec IA - par Normand Rocheleau"
   - **Public** ou **Private** : Choisissez selon vos préférences
   - **NE cochez PAS** "Initialize this repository with a README" (vous en avez déjà un)
4. **Cliquez sur "Create repository"**

### Étape 3 : Connecter votre projet local au repository GitHub

Ouvrez un terminal/invite de commandes dans le dossier de votre projet et exécutez :

```bash
# Initialiser Git (si ce n'est pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Faire le premier commit
git commit -m "🎉 Initial commit - iSchémateur par Normand Rocheleau"

# Renommer la branche principale en 'main' (standard moderne)
git branch -M main

# Connecter au repository GitHub (remplacez VOTRE_NOM_UTILISATEUR par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/ischemateur.git

# Pousser le code vers GitHub
git push -u origin main
```

**Note** : Remplacez `VOTRE_NOM_UTILISATEUR` par votre vrai nom d'utilisateur GitHub.

### Étape 4 : Vérifier

1. Retournez sur la page de votre repository GitHub
2. Rafraîchissez la page
3. Vous devriez voir tous vos fichiers apparaître !

## 🔄 Option 2 : Fork et Personnalisation (Si vous partez d'un template existant)

Si ce projet est déjà dans un repository GitHub template :

1. **Fork le repository** : Cliquez sur "Fork" en haut à droite de la page du repository
2. **Renommez votre fork** : Allez dans Settings → Repository name → Changez pour "ischemateur"
3. **Clonez votre fork** :
   ```bash
   git clone https://github.com/VOTRE_NOM_UTILISATEUR/ischemateur.git
   cd ischemateur
   ```

## 📝 Après la Configuration Initiale

### Pour mettre à jour votre code sur GitHub

Après chaque modification importante :

```bash
# Vérifier les fichiers modifiés
git status

# Ajouter les fichiers modifiés
git add .

# Créer un commit avec un message descriptif
git commit -m "Description de vos modifications"

# Pousser vers GitHub
git push
```

### Exemples de messages de commit

```bash
git commit -m "✨ Ajout de la détection multi-angles"
git commit -m "🐛 Correction du bug d'export CSV"
git commit -m "🎨 Amélioration de l'interface utilisateur"
git commit -m "📚 Mise à jour de la documentation"
git commit -m "⚡ Optimisation des performances de détection"
```

## 🌐 Configuration GitHub Pages (Pour héberger votre application gratuitement)

### Étape 1 : Modifier le fichier `vite.config.ts`

Ajoutez la ligne `base` dans votre configuration :

```typescript
export default defineConfig({
  base: '/ischemateur/',  // Ajoutez cette ligne (le nom de votre repo)
  plugins: [react(), tailwindcss()],
  // ... reste de la configuration
})
```

### Étape 2 : Ajouter un workflow GitHub Actions

Créez le fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Étape 3 : Activer GitHub Pages

1. Allez dans **Settings** → **Pages**
2. Sous **Source**, sélectionnez **GitHub Actions**
3. Sauvegardez

### Étape 4 : Déployer

```bash
git add .
git commit -m "🚀 Configuration GitHub Pages"
git push
```

Votre application sera disponible à : `https://VOTRE_NOM_UTILISATEUR.github.io/ischemateur/`

## 🔒 Protéger vos Secrets (Important!)

**Ne committez JAMAIS** :
- Des clés API privées
- Des mots de passe
- Des tokens d'authentification
- Des données personnelles sensibles

Utilisez des variables d'environnement et `.gitignore` pour protéger ces informations.

## 📦 Structure du Projet à Pousser

Assurez-vous que ces fichiers importants sont inclus :

```
ischemateur/
├── .github/               # Workflows GitHub Actions (optionnel)
├── src/                   # Code source
│   ├── components/        # Composants React
│   ├── lib/              # Utilitaires et logique métier
│   ├── hooks/            # React hooks personnalisés
│   ├── assets/           # Images et ressources
│   ├── App.tsx           # Composant principal
│   └── index.css         # Styles CSS
├── public/               # Fichiers statiques
├── .gitignore            # Fichiers à ignorer
├── README.md             # Documentation principale
├── PRD.md                # Document de spécifications
├── GUIDE_UTILISATION.md  # Guide d'utilisation
├── package.json          # Dépendances npm
├── index.html            # Point d'entrée HTML
├── vite.config.ts        # Configuration Vite
├── tsconfig.json         # Configuration TypeScript
└── tailwind.config.js    # Configuration Tailwind
```

## 🆘 Problèmes Courants et Solutions

### Problème : "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/ischemateur.git
```

### Problème : Erreur d'authentification
- Utilisez un **Personal Access Token** au lieu de votre mot de passe
- Créez-en un sur : Settings → Developer settings → Personal access tokens

### Problème : Fichiers trop volumineux
```bash
# Vérifiez la taille des fichiers
du -sh * | sort -h

# Supprimez les gros fichiers du cache Git si nécessaire
git rm --cached fichier_trop_gros.zip
git commit -m "Suppression fichier volumineux"
```

### Problème : node_modules/ est poussé par erreur
```bash
# Supprimez du Git (mais pas du disque local)
git rm -r --cached node_modules
git commit -m "Suppression de node_modules"
git push
```

## 🎉 Félicitations!

Votre projet iSchémateur est maintenant sur GitHub! 

### Prochaines étapes suggérées :

1. ✅ Ajouter un badge de statut de build dans README.md
2. ✅ Créer une release/version (v1.0.0)
3. ✅ Ajouter des issues pour suivre les bugs et fonctionnalités
4. ✅ Inviter des collaborateurs si nécessaire
5. ✅ Configurer GitHub Pages pour le déploiement automatique

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez la [documentation Git](https://git-scm.com/doc)
2. Consultez la [documentation GitHub](https://docs.github.com)
3. Cherchez sur [Stack Overflow](https://stackoverflow.com)

---

**Conçu et réalisé par Normand Rocheleau**
