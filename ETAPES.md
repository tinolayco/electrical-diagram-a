# 🔧 ÉTAPES D'UTILISATION - Electrical Schematic Analyzer

## ✅ RÉCAPITULATIF RAPIDE

### 📌 Fonctionnement actuel de l'application

L'application est **OPÉRATIONNELLE** et utilise **OpenCV.js** pour la détection avancée avec rotation automatique.

---

## 🚀 ÉTAPES PRINCIPALES

### **ÉTAPE 1 : Charger un schéma**

**Options :**
- Bouton `Upload` → Télécharger votre schéma (PNG/JPG)
- Bouton `Example` → Charger un exemple pré-analysé

---

### **ÉTAPE 2 : Entraînement supervisé (PREMIÈRE UTILISATION)**

⚠️ **IMPORTANT : Obligatoire si vous n'avez jamais entraîné l'application**

1. Cliquez sur `⚡ Analyser`
2. Le **mode d'entraînement** s'ouvre automatiquement
3. **Dessinez des boîtes** autour des composants :
   - Cliquez + glissez pour créer une boîte
   - Sélectionnez le type (Disjoncteur, Transformateur, etc.)
   - Annotez **au moins 5 composants**
4. Cliquez `✓ Entraîner`

**Résultat :**
- Vos annotations deviennent des **templates de référence**
- L'application cherche des composants **similaires** dans tout le schéma
- Chaque template est testé avec **4 rotations** (0°, 90°, 180°, 270°)

---

### **ÉTAPE 3 : Analyse automatique**

**Ce qui se passe :**
1. **Extraction des templates** depuis vos annotations
2. **Détection OpenCV** avec `cv.matchTemplate()` (méthode `TM_CCOEFF_NORMED`)
3. **Rotation automatique** : chaque template est pivoté 4 fois
4. **Affichage progressif** : les composants apparaissent en temps réel
5. **Raffinement IA** : GPT-4o améliore les résultats

**Indicateurs :**
- ✅ "OpenCV.js activé - Détection avancée" → Mode optimal
- Barre de progression : 30% → 70% → 90% → 100%
- Composants affichés immédiatement dès détection

---

### **ÉTAPE 4 : Ajuster le seuil de confiance**

📍 **Où trouver le slider ?**
- **En haut à droite**, à côté des onglets (Analysis / Catalog / Paths)
- Dans une **Card** avec l'icône `Sliders ⚙️`
- Affiche : `Seuil : XX%` et `Y/Z` (composants affichés / total)

🎛️ **Comment l'utiliser :**
- **Déplacez le slider** de 80% à 99%
- **Baissez (80-85%)** → Plus de composants (risque de faux positifs)
- **Augmentez (90-95%)** → Moins de composants, plus précis

⭐ **Règle importante :**
- Composants annotés manuellement (100%) → **TOUJOURS affichés**
- Seuls les composants auto-détectés sont filtrés

---

### **ÉTAPE 5 : Explorer les résultats**

#### 📊 **Onglet Analysis**
- Vue du schéma avec composants surlignés
- **Zoom** : Molette de la souris (zoom contextuel à la position du curseur)
- **Pan** : Clic + glisser pour déplacer
- Cliquez sur un composant pour le sélectionner

#### 📦 **Onglet Catalog**
- Tous les types de composants détectés
- Nombre d'instances par type

#### 🔀 **Onglet Paths**
- Chemins électriques identifiés
- Cliquez sur un chemin pour le visualiser

---

## 🔄 FONCTIONNALITÉS AVANCÉES

### **Réentraîner sur de nouveaux composants**
1. Bouton `🎓 Entraîner (X)` dans l'en-tête
2. Annotez de nouveaux composants
3. L'analyse se relance automatiquement

### **Éditer un composant**
1. Sélectionnez le composant
2. Bouton `✏️ Edit`
3. Modifiez les propriétés
4. Sauvegardez

### **Réinitialiser les données**
Icône `🗑️` dans l'en-tête :
- **Réinitialiser l'entraînement** : Supprime les annotations
- **Réinitialiser les schémas** : Supprime les schémas
- **Tout réinitialiser** : Remet tout à zéro

---

## ⚙️ PARAMÈTRES TECHNIQUES

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| **Seuil de confiance** | 85% par défaut | Score minimum pour afficher |
| **Méthode OpenCV** | TM_CCOEFF_NORMED | Corrélation normalisée |
| **Rotations** | 0°, 90°, 180°, 270° | Détection multi-angles |
| **NMS Radius** | 50% template | Anti-doublons |
| **Max composants/type** | 20 | Limite de détection |

---

## 🔍 COMMENT FONCTIONNE LA DÉTECTION ?

### **Pipeline complet :**

```
1. Annotation utilisateur (mode entraînement)
   ↓
2. Extraction des templates (ImageData)
   ↓
3. Chargement OpenCV.js
   ↓
4. Pour chaque template :
   ├── Rotation 0°   → Template matching
   ├── Rotation 90°  → Template matching
   ├── Rotation 180° → Template matching
   └── Rotation 270° → Template matching
   ↓
5. Filtrage par seuil de confiance (85%)
   ↓
6. Non-Maximum Suppression (élimination doublons)
   ↓
7. Affichage progressif en temps réel
   ↓
8. Raffinement IA (GPT-4o)
   ├── Extraction labels (CB-1, T1, etc.)
   ├── Identification tensions/courants
   └── Vérification cohérence
   ↓
9. Résultat final affiché
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### ❌ "Aucun composant détecté"
**Solution :** Assurez-vous d'avoir **entraîné** l'application (Étape 2)

### ❌ "Trop de fausses détections"
**Solution :** **Augmentez** le seuil de confiance → 90-95%

### ❌ "Pas assez de composants détectés"
**Solution :** **Baissez** le seuil de confiance → 80-85%

### ❌ "OpenCV non disponible"
**Solution :** 
- Rechargez la page (OpenCV.js se charge au démarrage)
- Vérifiez la console (F12) pour voir les messages

### ❌ "Composants tournés non détectés"
**Solution :** 
- Vérifiez que "OpenCV.js activé" apparaît en haut
- La rotation nécessite OpenCV.js (mode de base ne supporte pas)

### ❌ "Le slider de confiance a disparu"
**Solution :** 
- Le slider n'apparaît **qu'après l'analyse**
- Il faut avoir au moins 1 composant détecté
- Cherchez-le en haut à droite, à côté des onglets

---

## 📊 INDICATEURS DE PERFORMANCE

### **État OpenCV :**
- ✅ "OpenCV.js activé - Détection avancée" → **Optimal**
- ⚠️ "AI-powered component recognition" → **Mode de base**

### **Pendant l'analyse :**
- Barre de progression : 0% → 30% → 70% → 90% → 100%
- Composants affichés **en temps réel**
- Notification finale avec statistiques

### **Après l'analyse :**
```
Détection terminée! 15 composants trouvés
(5 annotés + 10 similaires détectés)
Affichés avec seuil 85%: 12 composants (3 masqués)
4 chemins électriques identifiés
```

---

## 💾 DONNÉES PERSISTANTES

**Sauvegardées automatiquement :**
- ✅ Schémas téléchargés
- ✅ Annotations d'entraînement
- ✅ Catalogue de composants
- ✅ Seuil de confiance
- ✅ Résultats d'analyse

**Stockage :** Navigateur local (survit à la fermeture)

---

## 🎯 CONSEILS POUR DE MEILLEURS RÉSULTATS

1. **Image haute résolution** : Minimum 1000px de largeur
2. **Bon contraste** : Schémas clairs, bien définis
3. **Annotations précises** : Boîtes serrées autour des composants
4. **Variété** : Annotez différents types de composants
5. **OpenCV activé** : Vérifiez le message en haut de l'interface

---

## 📞 AIDE SUPPLÉMENTAIRE

- Cliquez sur le bouton `❓` dans l'en-tête
- Consultez ce fichier ETAPES.md
- Vérifiez la console (F12) pour les messages de débogage
- Regardez les notifications (toasts) en bas à droite

---

## ✨ RÉSUMÉ EN 3 POINTS

1. **Première utilisation** : Entraînez avec 5+ annotations
2. **Ajustez le seuil** : Slider en haut à droite (80-99%)
3. **Explorez** : 3 onglets (Analysis / Catalog / Paths)

**L'application fonctionne !** 🎉
