# ⚡ iSchémateur - Analyseur de schémas électriques

**Par Normand Rocheleau**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)

Application web intelligente pour l'analyse automatisée de schémas électriques unifilaires utilisant la vision par ordinateur et l'intelligence artificielle.

## 📚 Documentation

### 🚀 Pour Commencer
- ⚡ [Démarrage Rapide](./DEMARRAGE_RAPIDE.md) - Publier sur GitHub en 5 minutes
- 📖 [Guide d'Utilisation](./GUIDE_UTILISATION.md) - Comment utiliser l'application
- ❓ [FAQ](./FAQ.md) - Questions fréquemment posées
- 🆘 [Aide Intégrée](./GUIDE_UTILISATION.md) - Accédez à l'aide depuis l'application (bouton ?)

### 💻 Pour Développeurs
- 🏗️ [Architecture](./ARCHITECTURE.md) - Architecture technique détaillée
- 🔧 [Commandes Utiles](./COMMANDES.md) - Référence rapide Git, npm, etc.
- 🤝 [Guide de Contribution](./CONTRIBUTING.md) - Comment contribuer au projet
- 📐 [Spécifications (PRD)](./PRD.md) - Document de spécifications du produit

### 📦 Gestion de Projet
- 📊 [Guide Export/Import](./GUIDE_EXPORT_IMPORT.md) - Gérer vos bibliothèques et données
- 🔄 [Changelog](./CHANGELOG.md) - Historique des versions
- ✅ [Checklist GitHub](./CHECKLIST_GITHUB.md) - Vérifications avant publication

### 🌐 Déploiement
- 🔗 [Configuration GitHub](./GITHUB_SETUP.md) - Guide complet de mise en place GitHub
- ☁️ [Guide de Déploiement](./DEPLOIEMENT.md) - Déployer sur GitHub Pages, Vercel, etc.

## 🎯 Fonctionnalités principales

- 📤 **Téléversement de schémas** : Support PNG, JPG, JPEG, SVG (jusqu'à 10 MB)
- 🤖 **Détection IA hybride** : Combinaison de vision par ordinateur (par Normand Rocheleau) et GPT-4o
- 🎓 **Apprentissage supervisé** : Entraînement personnalisé par annotation manuelle
- 📚 **Bibliothèques multiples** : Création et gestion de bibliothèques de composants personnalisées
- 🔄 **Détection multi-angles** : Reconnaissance des composants avec rotation (0°, 90°, 180°, 270°)
- 📊 **Catalogue évolutif** : Base de données qui s'améliore avec chaque analyse
- 🔌 **Chemins électriques** : Identification automatique des connexions et flux électriques
- 💾 **Export/Import local** : CSV, JSON, XML sauvegardés localement sur votre ordinateur
- 🎚️ **Seuil de confiance ajustable** : Filtrage des détections selon le score de confiance

## 🚀 Démarrage rapide

1. **Essayer l'exemple** : Cliquez sur le bouton "Exemple" pour charger un schéma pré-analysé
2. **Téléverser votre schéma** : Utilisez le bouton "Téléverser" ou glissez-déposez une image
3. **Entraîner (optionnel)** : Annotez manuellement quelques composants pour améliorer la détection
4. **Analyser** : Lancez l'analyse automatique avec le bouton "Analyser"
5. **Explorer** : Consultez les résultats dans les onglets Analyse, Catalogue et Chemins

## 🔧 Composants détectés

- ⚡ **Disjoncteurs** (L1BT, CB) : Contrôle interactif Ouvert/Fermé
- 🔴 **Bus bars** : Barres omnibus de distribution
- 🔄 **Transformateurs** : Détection de symboles T et cercles concentriques
- 🔵 **Moteurs** : Rectangles bleus avec symbole M
- 📏 **Compteurs** : Rectangles jaunes/dorés
- 🔌 **Disconnects** : Interrupteurs et sectionneurs

## 💾 Gestion des données

Toutes les données sont stockées localement dans votre navigateur avec possibilité d'export/import :

- **Bibliothèques** : JSON (avec versioning), CSV, XML
- **Schémas analysés** : CSV avec tous les composants détectés
- **Catalogue** : CSV pour analyse dans Excel/Google Sheets

## 🛠️ Technologies utilisées

- **Frontend** : React 19 + TypeScript + Tailwind CSS
- **Vision par ordinateur** : par Normand Rocheleau (détection de formes et template matching)
- **Intelligence artificielle** : GPT-4o (analyse contextuelle et OCR)
- **UI Components** : shadcn/ui v4
- **Icons** : Phosphor Icons
- **Animations** : Framer Motion

## 🚀 Installation et Déploiement

### Installation Locale

```bash
# Cloner le repository
git clone https://github.com/VOTRE_NOM_UTILISATEUR/ischemateur.git
cd ischemateur

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build de Production

```bash
# Créer une version optimisée
npm run build

# Prévisualiser la version de production
npm run preview
```

### Déploiement sur GitHub Pages

Consultez le fichier [GITHUB_SETUP.md](./GITHUB_SETUP.md) pour un guide complet de configuration.

## 📁 Structure du Projet

```
ischemateur/
├── src/
│   ├── components/        # Composants React
│   │   ├── DiagramViewer.tsx
│   │   ├── ComponentList.tsx
│   │   ├── TrainingMode.tsx
│   │   ├── LibraryManager.tsx
│   │   └── ui/           # Composants shadcn/ui
│   ├── lib/              # Logique métier
│   │   ├── analysis.ts   # Détection de composants
│   │   ├── opencv-detection.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── hooks/            # React hooks
│   ├── App.tsx           # Composant principal
│   └── index.css         # Styles globaux
├── public/               # Ressources statiques
├── README.md             # Ce fichier
├── GITHUB_SETUP.md       # Guide de configuration GitHub
├── PRD.md                # Spécifications du projet
└── package.json          # Dépendances
```

## 🔧 Scripts Disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Crée une version de production
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint

## 🤝 Contribution

Les contributions sont les bienvenues! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m '✨ Add AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📋 À Faire (Roadmap)

- [ ] Support de formats de schémas supplémentaires (DWG, DXF)
- [ ] Export vers formats CAO standards
- [ ] Mode collaboration multi-utilisateurs
- [ ] Intégration avec bases de données de composants industriels
- [ ] Application mobile (React Native)
- [ ] API REST pour intégration tierce

## 👨‍💻 Développeur

**Normand Rocheleau**

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
