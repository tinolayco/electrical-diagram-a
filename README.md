# ⚡ iSchémateur - Analyseur de schémas électriques

**Par Normand Rocheleau**

Application web intelligente pour l'analyse automatisée de schémas électriques unifilaires utilisant la vision par ordinateur et l'intelligence artificielle.

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

## 👨‍💻 Développeur

**Normand Rocheleau**

---

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
