# Changelog - iSchémateur

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### À venir
- Support de formats de schémas supplémentaires (DWG, DXF)
- Export vers formats CAO standards
- Mode collaboration multi-utilisateurs

## [1.0.0] - 2024-01-XX

### 🎉 Version Initiale

#### ✨ Fonctionnalités

##### Téléversement et Visualisation
- Téléversement de schémas électriques (PNG, JPG, JPEG, SVG)
- Glisser-déposer de fichiers d'images
- Visualisation avec zoom et panoramique contextuels
- Support de fichiers jusqu'à 10 MB

##### Détection de Composants
- Détection hybride : par Normand Rocheleau + GPT-4o
- Détection multi-angles (0°, 90°, 180°, 270°)
- Seuil de confiance ajustable (80-99%)
- Mode d'entraînement supervisé par annotation manuelle
- Support des composants :
  - Disjoncteurs (L1BT, CB) avec états Ouvert/Fermé
  - Barres omnibus
  - Transformateurs
  - Moteurs
  - Compteurs
  - Sectionneurs

##### Bibliothèques de Composants
- Gestion de bibliothèques multiples
- Bibliothèque par défaut pré-entraînée
- Création de bibliothèques personnalisées
- Import/Export de bibliothèques (JSON, CSV, XML)
- Versioning des bibliothèques
- Historique des versions avec restauration

##### Analyse et Catalogage
- Identification automatique des chemins électriques
- Catalogue évolutif de composants
- Statistiques de détection en temps réel
- Affichage filtré selon le seuil de confiance

##### Export et Persistance
- Export de schémas analysés en CSV
- Export du catalogue en CSV
- Import/Export de bibliothèques localement via navigateur
- Sauvegarde automatique dans le navigateur (IndexedDB)
- Persistance de toutes les données entre sessions

##### Interface Utilisateur
- Interface en français
- Design technique et professionnel
- Thème avec couleurs électriques (bleu, orange)
- Typographie : Space Grotesk + JetBrains Mono
- Badges de composants redimensionnés et optimisés
- Responsive mobile et desktop
- Sidebar de composants avec scroll indépendant
- Indicateurs de progression d'analyse

##### Documentation
- README complet en français
- Guide d'utilisation (GUIDE_UTILISATION.md)
- Guide d'export/import (GUIDE_EXPORT_IMPORT.md)
- Guide de configuration GitHub (GITHUB_SETUP.md)
- Guide de déploiement (DEPLOIEMENT.md)
- Guide de contribution (CONTRIBUTING.md)
- PRD (Product Requirements Document) traduit
- Fichier d'aide intégré dans l'application

##### DevOps
- Configuration GitHub Actions pour déploiement automatique
- Templates d'issues (Bug Report, Feature Request)
- Template de Pull Request
- Dépendances à jour et sécurisées

#### 🐛 Corrections

- Résolution du problème de bouton "Analyser" désactivé incorrectement
- Correction du filtrage par seuil de confiance
- Fix de l'overflow sur le scroll du schéma vs sidebar
- Correction de l'export de bibliothèques
- Fix du File Dialog pour sauvegardes locales

#### ⚡ Performances

- Optimisation de la détection par Normand Rocheleau
- Affichage progressif des composants détectés
- Amélioration du rendu des badges
- Optimisation des images et assets

#### 🎨 Design

- Passage au thème technique/électrique
- Réduction de la taille des badges (2x plus petits)
- Amélioration de la lisibilité
- Icônes Phosphor cohérentes
- Animations subtiles et professionnelles

#### 📝 Documentation

- Toute la documentation en français
- Attribution à Normand Rocheleau partout
- Guides détaillés pour chaque fonctionnalité
- Exemples de code et d'utilisation

### 🔧 Technique

- **Frontend** : React 19 + TypeScript
- **Styling** : Tailwind CSS v4
- **UI Components** : shadcn/ui v4
- **Icons** : Phosphor Icons
- **Build** : Vite 7
- **CV** : par Normand Rocheleau (OpenCV.js)
- **IA** : GPT-4o (via Spark SDK)
- **Persistance** : IndexedDB (via useKV)

### 👨‍💻 Crédits

**Conception et réalisation** : Normand Rocheleau

---

## Guide des Versions

### Format de Version : MAJOR.MINOR.PATCH

- **MAJOR** : Changements incompatibles avec les versions précédentes
- **MINOR** : Ajout de fonctionnalités rétro-compatibles
- **PATCH** : Corrections de bugs rétro-compatibles

### Types de Changements

- `✨ Ajouté` - Nouvelles fonctionnalités
- `🔄 Modifié` - Changements aux fonctionnalités existantes
- `⚠️ Déprécié` - Fonctionnalités bientôt retirées
- `🗑️ Retiré` - Fonctionnalités retirées
- `🐛 Corrigé` - Corrections de bugs
- `🔒 Sécurité` - Corrections de vulnérabilités

---

**Conçu et réalisé par Normand Rocheleau**
