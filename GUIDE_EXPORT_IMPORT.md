# Guide d'Exportation et d'Importation - iSchémateur

## Vue d'ensemble

Toutes les exportations et importations dans iSchémateur utilisent le **système de fichiers local** de votre ordinateur via le dialogue natif du navigateur. Aucune donnée n'est envoyée vers un serveur distant.

## 📤 Exportations Disponibles

### 1. Exporter une Bibliothèque

**Formats supportés:**
- **JSON** (recommandé) - Format complet avec versioning, réimportable
- **CSV** - Compatible Excel/Google Sheets pour analyse
- **XML** - Format structuré universel

**Comment exporter:**
1. Sélectionnez la bibliothèque à exporter dans le menu déroulant
2. Cliquez sur l'icône de téléchargement (↓)
3. Choisissez le format d'export
4. Pour JSON: définissez le type de version (patch/minor/major) et les notes
5. Cliquez sur "Exporter"
6. **Le navigateur ouvrira une boîte de dialogue** vous permettant de choisir où sauvegarder le fichier

**Nom des fichiers générés:**
- JSON: `bibliotheque_[nom]_v[version]_[timestamp].json`
- CSV: `bibliotheque_[nom]_[timestamp].csv`
- XML: `bibliotheque_[nom]_[timestamp].xml`

### 2. Exporter un Schéma

**Format:** CSV uniquement

**Comment exporter:**
1. Ouvrez le schéma que vous souhaitez exporter
2. Dans l'onglet "Analyse", cliquez sur "Exporter CSV"
3. **Le navigateur ouvrira une boîte de dialogue** vous permettant de choisir où sauvegarder le fichier

**Contenu de l'export:**
- Informations du schéma
- Liste complète des composants détectés
- Statistiques par type
- Chemins électriques identifiés
- Matrice de connexions

**Nom du fichier:** `schema_[nom]_[timestamp].csv`

### 3. Exporter le Catalogue

**Format:** CSV uniquement

**Comment exporter:**
1. Allez dans l'onglet "Catalogue"
2. Cliquez sur "Exporter CSV"
3. **Le navigateur ouvrira une boîte de dialogue** vous permettant de choisir où sauvegarder le fichier

**Contenu de l'export:**
- Liste de tous les types de composants
- Nombre d'instances de chaque type
- Statistiques récapitulatives
- Pourcentages de distribution

**Nom du fichier:** `catalogue_composants_[timestamp].csv`

## 📥 Importations Disponibles

### 1. Importer une Bibliothèque

**Formats acceptés:** JSON, CSV, XML

**Comment importer:**
1. Cliquez sur l'icône d'upload (↑) dans la section des bibliothèques
2. **Le navigateur ouvrira une boîte de dialogue** pour sélectionner un fichier
3. Sélectionnez votre fichier (`.json`, `.csv`, ou `.xml`)
4. La bibliothèque sera importée et activée automatiquement

**Notes importantes:**
- Les bibliothèques importées reçoivent un nouvel ID unique
- L'historique des versions est préservé (format JSON uniquement)
- Les bibliothèques importées ne sont jamais marquées comme "par défaut"

### 2. Importer un Catalogue

**Format accepté:** CSV uniquement

**Comment importer:**
1. Allez dans l'onglet "Catalogue"
2. Cliquez sur "Importer CSV"
3. **Le navigateur ouvrira une boîte de dialogue** pour sélectionner un fichier
4. Sélectionnez votre fichier CSV
5. Les données seront fusionnées avec le catalogue existant

**Comportement de fusion:**
- Les types existants voient leur compteur augmenter
- Les nouveaux types sont ajoutés au catalogue

### 3. Téléverser un Schéma

**Formats acceptés:** PNG, JPG, JPEG, SVG

**Comment téléverser:**
1. Cliquez sur "Téléverser"
2. **Le navigateur ouvrira une boîte de dialogue** pour sélectionner une image
3. Sélectionnez votre schéma électrique
4. Le schéma sera ajouté à la liste et activé

## 🔒 Sécurité et Confidentialité

### Stockage Local Uniquement

✅ **Tous les fichiers sont sauvegardés/chargés localement sur votre ordinateur**
- Utilise l'API File System Access du navigateur moderne
- Vous choisissez exactement où sauvegarder chaque fichier
- Aucune donnée n'est envoyée vers un serveur externe
- Les données de session sont stockées dans le navigateur (localStorage)

### Compatibilité des Navigateurs

**API moderne (showSaveFilePicker):**
- ✅ Chrome/Edge 86+
- ✅ Opera 72+
- ❌ Firefox (fallback automatique)
- ❌ Safari (fallback automatique)

**Fallback automatique:**
Si votre navigateur ne supporte pas l'API moderne, l'application utilise automatiquement le téléchargement classique avec un lien `<a download>`.

## 💡 Conseils d'Utilisation

### Organisation des Fichiers

**Recommandé:**
```
📁 Mes_Schémas/
  📁 Bibliothèques/
    📄 bibliotheque_industrie_v1.0.0.json
    📄 bibliotheque_residentiel_v1.2.0.json
  📁 Schémas/
    📄 schema_usine_A_2024.csv
    📄 schema_batiment_B_2024.csv
  📁 Catalogues/
    📄 catalogue_complet_2024.csv
```

### Versioning des Bibliothèques

**Format JSON uniquement:**
- **Patch (1.0.0 → 1.0.1)**: Corrections mineures, ajustements
- **Minor (1.0.0 → 1.1.0)**: Nouvelles annotations, ajout de composants
- **Major (1.0.0 → 2.0.0)**: Changements structurels importants

### Sauvegarde Régulière

1. Exportez vos bibliothèques personnalisées régulièrement
2. Conservez plusieurs versions pour historique
3. Exportez les schémas analysés importants en CSV
4. Créez des snapshots du catalogue après analyses importantes

## ❓ Dépannage

### "L'export ne fonctionne pas"

**Vérifiez:**
1. Autorisations du navigateur pour accéder aux fichiers
2. Espace disque disponible
3. Droits d'écriture dans le dossier de destination
4. Bloqueur de pop-ups désactivé

### "Le fichier importé n'est pas reconnu"

**Vérifiez:**
1. Format du fichier (JSON/CSV/XML)
2. Structure du fichier (doit être créé par iSchémateur)
3. Encodage UTF-8
4. Fichier non corrompu

### "Annulation d'export"

Si vous fermez la boîte de dialogue sans choisir de destination:
- L'opération est annulée
- Message "Export annulé" affiché
- Aucune donnée n'est perdue

## 📞 Support

Pour toute question ou problème:
1. Consultez le guide d'utilisation principal (GUIDE_UTILISATION.md)
2. Vérifiez la console du navigateur (F12) pour les messages d'erreur
3. Assurez-vous d'utiliser un navigateur moderne à jour
