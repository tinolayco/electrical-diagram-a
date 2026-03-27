# 📘 Guide d'utilisation - Electrical Schematic Analyzer

## 🎯 Vue d'ensemble

Cette application analyse automatiquement les schémas électriques unifilaires pour identifier les composants (disjoncteurs, transformateurs, barres de bus, etc.) en utilisant **OpenCV.js** et l'**intelligence artificielle**.

---

## 🚀 Étapes d'utilisation

### **Étape 1 : Charger un schéma**

Deux options :

1. **📤 Télécharger votre schéma** : Cliquez sur le bouton `Upload` et sélectionnez une image (PNG, JPG)
2. **✨ Charger l'exemple** : Cliquez sur le bouton `Example` pour tester avec un schéma pré-analysé

---

### **Étape 2 : Entraînement supervisé (OBLIGATOIRE la première fois)**

⚠️ **IMPORTANT** : L'application doit d'abord apprendre à reconnaître vos composants !

#### Comment entraîner l'application :

1. Cliquez sur le bouton `⚡ Analyser`
2. L'application ouvre automatiquement le **mode d'entraînement**
3. **Dessinez des boîtes** autour des composants sur votre schéma :
   - Cliquez et glissez pour créer une boîte
   - Sélectionnez le type de composant (Disjoncteur, Transformateur, etc.)
   - Répétez pour **au moins 5 composants différents**

4. Cliquez sur `✓ Entraîner` pour lancer la détection

#### Ce qui se passe ensuite :

- ✅ Vos annotations sont sauvegardées comme **références d'entraînement**
- 🔍 L'application extrait ces composants comme **templates**
- 🔄 Pour chaque template, elle cherche des composants **similaires** dans tout le schéma
- 🌀 La recherche est effectuée avec **4 rotations** (0°, 90°, 180°, 270°) pour détecter les composants tournés

---

### **Étape 3 : Détection automatique**

Une fois l'entraînement effectué, l'analyse commence automatiquement :

#### **Détection OpenCV avec rotation :**
- Utilise `cv.matchTemplate()` avec méthode `TM_CCOEFF_NORMED`
- Teste chaque template sous **4 angles** (0°, 90°, 180°, 270°)
- Affiche les composants **en temps réel** dès qu'ils sont détectés
- Chaque composant détecté a un **score de confiance** (0-100%)

#### **Affichage progressif :**
- Les composants apparaissent **immédiatement** sur le schéma
- Le compteur se met à jour en temps réel : `X/Y composants`
- Les composants annotés manuellement ont **100% de confiance**
- Les composants similaires détectés ont des scores variables (85-99%)

---

### **Étape 4 : Ajuster le seuil de confiance**

Le **slider de confiance** contrôle quels composants sont affichés :

**📍 Où le trouver ?**
- En haut à droite, à côté des onglets (Analysis / Catalog / Paths)
- Dans une petite carte avec l'icône `Sliders`
- Affiche : `Seuil : XX% | Y/Z` (composants affichés / total détectés)

**🎛️ Comment l'utiliser ?**
- **Déplacez le slider** de 80% à 99%
- **Baissez le seuil** (ex: 85%) → Plus de composants affichés (risque de faux positifs)
- **Augmentez le seuil** (ex: 95%) → Moins de composants, mais plus précis

**💡 Règle importante :**
- Les composants annotés manuellement (100%) sont **TOUJOURS affichés**
- Seuls les composants auto-détectés sont filtrés par le seuil

---

### **Étape 5 : Explorer les résultats**

#### **Onglet Analysis :**
- Vue principale avec le schéma et les composants détectés
- Cliquez sur un composant dans la liste pour le voir surligné
- Utilisez le **zoom** (molette de la souris) et le **pan** (clic + glisser)
- Zoom contextuel : la molette zoome à la position de votre souris

#### **Onglet Catalog :**
- Vue de tous les types de composants détectés
- Nombre total d'instances par type
- Statistiques de détection

#### **Onglet Paths :**
- Chemins électriques identifiés par l'IA
- Connexions entre composants
- Tensions et descriptions

---

## 🔧 Fonctionnalités avancées

### **Exporter les résultats en CSV pour Excel**

Vous pouvez exporter vos analyses et bibliothèques en format CSV pour une analyse approfondie dans Excel, Google Sheets ou LibreOffice Calc.

#### **Exporter un schéma analysé :**

1. Après avoir analysé un schéma, cliquez sur le bouton `📄 Exporter CSV` à côté du seuil de confiance
2. Choisissez l'emplacement de sauvegarde
3. Le fichier CSV contient :
   - **Informations du schéma** : nom, date, nombre de composants
   - **Statistiques par type** : nombre, confiance moyenne, annotations manuelles vs auto-détectées
   - **Détails des composants** : position, dimensions, confiance, tension, puissance, connexions
   - **Chemins électriques** : description, tension, liste des composants
   - **Matrice de connexions** : toutes les connexions entre composants

#### **Exporter une bibliothèque d'entraînement :**

1. Cliquez sur l'icône `⬇️` (télécharger) dans le gestionnaire de bibliothèques
2. Sélectionnez le format **CSV** dans la boîte de dialogue
3. Le fichier CSV contient :
   - **Informations de la bibliothèque** : nom, version, auteur, tags
   - **Statistiques par type** : répartition des annotations par type de composant
   - **Détails des annotations** : position, dimensions, aires, ratios, centres

#### **Réimporter une bibliothèque CSV :**

1. Cliquez sur l'icône `⬆️` (téléverser) dans le gestionnaire de bibliothèques
2. Sélectionnez votre fichier CSV exporté
3. La bibliothèque est automatiquement recréée avec toutes ses annotations

> **💡 Astuce :** Les fichiers CSV sont parfaits pour :
> - Créer des tableaux croisés dynamiques dans Excel
> - Générer des graphiques et statistiques
> - Partager les résultats avec des collègues
> - Archiver les analyses pour référence future
> - Importer dans d'autres outils d'analyse

---

### **Réentraîner sur de nouveaux composants**

Si vous voulez détecter un nouveau type de composant :

1. Cliquez sur le bouton `🎓 Entraîner (X)` dans l'en-tête
2. Annotez les nouveaux composants
3. Cliquez `✓ Entraîner` → L'analyse se relance avec les nouveaux templates

### **Éditer un composant**

1. Cliquez sur un composant dans la liste
2. Cliquez sur `✏️ Edit` 
3. Modifiez le type, le nom, la tension, etc.

### **Réinitialiser les données**

Cliquez sur l'icône `🗑️` (corbeille) dans l'en-tête :

- **Réinitialiser l'entraînement** : Supprime les annotations (garde les schémas)
- **Réinitialiser les schémas** : Supprime tous les schémas (garde l'entraînement)
- **Tout réinitialiser** : Remet l'application à zéro

---

## 🧠 Comment fonctionne la détection ?

### **Technologie utilisée :**

1. **OpenCV.js** (Computer Vision)
   - Template matching avec corrélation normalisée
   - Rotation automatique des templates (4 angles)
   - Non-Maximum Suppression pour éviter les doublons

2. **GPT-4o** (Intelligence Artificielle)
   - Raffine les résultats de la détection
   - Extrait les labels textuels (CB-1, T1, etc.)
   - Identifie les tensions et courants nominaux

### **Pipeline de détection :**

```
Annotation utilisateur
    ↓
Extraction du template
    ↓
Rotation (0°, 90°, 180°, 270°)
    ↓
Template matching OpenCV
    ↓
Filtrage par seuil de confiance
    ↓
Élimination des doublons
    ↓
Raffinement IA (GPT-4o)
    ↓
Affichage final
```

---

## ⚙️ Paramètres de détection

| Paramètre | Valeur par défaut | Description |
|-----------|------------------|-------------|
| Seuil de confiance | 85% | Minimum pour afficher un composant |
| Méthode OpenCV | TM_CCOEFF_NORMED | Corrélation normalisée |
| Rotations testées | 0°, 90°, 180°, 270° | Détection multi-angles |
| Rayon NMS | 50% template | Non-Maximum Suppression |
| Max composants/type | 20 | Limite par type de composant |

---

## 🐛 Résolution de problèmes

### **"Aucun composant détecté"**
→ Assurez-vous d'avoir **entraîné** l'application d'abord (Étape 2)

### **"Trop de fausses détections"**
→ Augmentez le **seuil de confiance** (ex: 90-95%)

### **"Pas assez de composants détectés"**
→ Baissez le **seuil de confiance** (ex: 80-85%)

### **"OpenCV non disponible"**
→ L'application utilise un mode de détection de base (pixels)
→ Rechargez la page pour charger OpenCV.js

### **"Composants tournés non détectés"**
→ Vérifiez que le message "OpenCV.js activé" apparaît en haut
→ La rotation automatique nécessite OpenCV.js

---

## 📊 Indicateurs de performance

**En haut de l'interface :**
- ✅ "OpenCV.js activé - Détection avancée" → Mode optimal
- ⚠️ "AI-powered component recognition" → Mode de base (sans rotation)

**Pendant l'analyse :**
- Barre de progression : 0% → 30% → 70% → 90% → 100%
- Affichage temps réel des composants détectés
- Notification finale avec statistiques détaillées

**Après l'analyse :**
- `X annotés + Y similaires détectés`
- `Affichés avec seuil Z%: N composants (M masqués)`
- `P chemins électriques identifiés`

---

## 💾 Données persistantes

Toutes vos données sont sauvegardées localement :

- ✅ Schémas téléchargés
- ✅ Annotations d'entraînement
- ✅ Catalogue de composants
- ✅ Seuil de confiance préféré
- ✅ Résultats d'analyse

Les données survivent à la fermeture du navigateur !

---

## 🎓 Conseils pour de meilleurs résultats

1. **Qualité de l'image** : Utilisez des images haute résolution (>1000px)
2. **Contraste** : Les schémas avec un bon contraste sont mieux détectés
3. **Annotations précises** : Dessinez des boîtes serrées autour des composants
4. **Variété** : Annotez différents types de composants
5. **Rotation** : Si vos composants sont tournés, OpenCV.js les détectera automatiquement

---

## 📞 Support

Pour toute question ou problème, consultez :
- Le bouton `❓` (Help) dans l'en-tête de l'application
- Ce guide d'utilisation
- La console du navigateur (F12) pour les messages de débogage
