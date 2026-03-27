# ❓ FAQ - Questions Fréquentes

**Par Normand Rocheleau**

## 📋 Table des Matières

- [Général](#général)
- [Installation et Configuration](#installation-et-configuration)
- [Utilisation](#utilisation)
- [Détection et Analyse](#détection-et-analyse)
- [Bibliothèques](#bibliothèques)
- [Export et Import](#export-et-import)
- [GitHub et Déploiement](#github-et-déploiement)
- [Problèmes Techniques](#problèmes-techniques)

---

## 🌐 Général

### Qu'est-ce qu'iSchémateur ?

iSchémateur est une application web qui analyse automatiquement les schémas électriques unifilaires pour détecter les composants (disjoncteurs, transformateurs, moteurs, etc.) et identifier les chemins électriques.

### Est-ce gratuit ?

Oui, l'application est totalement gratuite et open-source sous licence MIT.

### Dois-je créer un compte ?

Non, aucun compte n'est nécessaire. Toutes vos données sont stockées localement dans votre navigateur.

### Mes données sont-elles sécurisées ?

Oui ! Toutes vos données (schémas, bibliothèques, catalogue) sont stockées uniquement dans votre navigateur. Rien n'est envoyé à un serveur externe sauf les appels à l'IA pour l'analyse (qui ne stockent pas vos données).

### Sur quels navigateurs fonctionne l'application ?

- ✅ Chrome / Edge (recommandé) - Version 90+
- ✅ Firefox - Version 88+
- ✅ Safari - Version 14+
- ❌ Internet Explorer (non supporté)

---

## 💻 Installation et Configuration

### Comment installer l'application ?

Deux options :

1. **Utiliser la version en ligne** (si déployée) : Accédez simplement à l'URL
2. **Installer localement** :
   ```bash
   git clone https://github.com/votre-username/ischemateur.git
   cd ischemateur
   npm install
   npm run dev
   ```

### Pourquoi npm install prend autant de temps ?

C'est normal ! L'application utilise de nombreuses bibliothèques. La première installation peut prendre 2-5 minutes selon votre connexion internet.

### L'application ne démarre pas après `npm run dev`

Vérifiez :
- Avez-vous Node.js 20+ installé ? (`node --version`)
- Le port 5173 est-il disponible ?
- Essayez de supprimer `node_modules` et réinstaller :
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## 🎯 Utilisation

### Comment commencer ?

1. Cliquez sur **"Exemple"** pour voir un schéma pré-analysé
2. Ou cliquez sur **"Téléverser"** pour charger votre propre schéma
3. Cliquez sur **"Analyser"** pour détecter les composants

### Quels formats d'images sont supportés ?

- ✅ PNG
- ✅ JPG / JPEG
- ✅ SVG
- ❌ PDF (pas encore supporté)
- ❌ DWG / DXF (pas encore supporté)

Taille maximale : **10 Mo**

### L'image de mon schéma est floue

Pour de meilleurs résultats :
- Utilisez une résolution minimale de **1000px de largeur**
- Préférez les formats PNG pour la clarté
- Assurez-vous que le schéma est bien éclairé et contrasté

### Comment zoomer sur le schéma ?

- **Molette de la souris** : Zoom centré sur le curseur
- **Glisser-déposer** : Déplacer le schéma
- **Double-clic** : Réinitialiser le zoom

---

## 🔍 Détection et Analyse

### Aucun composant n'est détecté

Plusieurs raisons possibles :

1. **Bibliothèque vide** : Créez une bibliothèque et entraînez-la avec quelques exemples
2. **Image de mauvaise qualité** : Essayez une image plus nette
3. **Seuil de confiance trop élevé** : Réduisez le seuil avec le slider
4. **Composants non standards** : Entraînez manuellement avec le mode "Entraîner"

### Comment améliorer la détection ?

1. **Mode Entraînement** :
   - Cliquez sur "Entraîner"
   - Tracez des rectangles autour de quelques composants
   - Nommez-les correctement
   - Lancez l'analyse

2. **Ajustez le seuil de confiance** : Réduisez-le à 80-85% pour plus de détections

3. **Utilisez des images de qualité** : Plus c'est net, mieux c'est !

### Qu'est-ce que le seuil de confiance ?

C'est le score minimum (en %) qu'un composant doit avoir pour être affiché. 
- **80-85%** : Affiche plus de composants (peut inclure des faux positifs)
- **90-95%** : Affiche uniquement les détections très sûres
- **99%** : Affiche uniquement les composants annotés manuellement

### Pourquoi certains composants sont détectés plusieurs fois ?

L'IA peut parfois détecter le même composant sous différents angles. Utilisez le mode "Entraîner" pour améliorer la précision ou supprimez manuellement les doublons via l'éditeur.

### Les disjoncteurs ne changent pas de couleur quand je clique

Assurez-vous que :
- Le composant est bien un disjoncteur (type "breaker")
- Vous cliquez directement sur le rectangle du disjoncteur dans le schéma
- Le schéma a bien été analysé

---

## 📚 Bibliothèques

### Qu'est-ce qu'une bibliothèque ?

Une bibliothèque contient vos annotations d'entraînement. C'est comme un "dictionnaire" de composants que l'application utilise pour la détection.

### Bibliothèque par défaut vs personnalisée ?

- **Bibliothèque par défaut** : Pré-entraînée avec des composants standards, en lecture seule
- **Bibliothèque personnalisée** : Créée par vous, entraînable et modifiable

### Dois-je créer une bibliothèque ?

- **Non** si vous travaillez avec des schémas standards → utilisez la bibliothèque par défaut
- **Oui** si vous avez des composants spécifiques ou des symboles personnalisés

### Combien d'annotations dois-je faire ?

Pour de bons résultats :
- **Minimum** : 2-3 exemples par type de composant
- **Recommandé** : 5-10 exemples par type
- **Optimal** : 15+ exemples avec différents angles et tailles

### Puis-je avoir plusieurs bibliothèques ?

Oui ! Vous pouvez créer autant de bibliothèques que vous voulez. Utilisez-en une par projet ou type de schéma.

---

## 💾 Export et Import

### Où sont sauvegardées mes données ?

Dans **IndexedDB**, une base de données intégrée à votre navigateur. Les données persistent entre les sessions.

### Puis-je sauvegarder mes bibliothèques ?

Oui ! Utilisez les boutons d'export :
- **Export JSON** : Pour sauvegarder et partager
- **Export CSV** : Pour analyse dans Excel
- **Export XML** : Pour intégration avec d'autres outils

### Comment partager une bibliothèque avec un collègue ?

1. Exportez votre bibliothèque (bouton Export → JSON)
2. Envoyez le fichier .json à votre collègue
3. Votre collègue utilise "Importer" pour charger la bibliothèque

### L'export ne fonctionne pas

Vérifiez que :
- Votre navigateur supporte l'API File System Access (Chrome/Edge recommandés)
- Vous avez autorisé les téléchargements
- Il y a bien des données à exporter

### Que se passe-t-il si je vide le cache de mon navigateur ?

⚠️ **Toutes vos données seront perdues** ! Exportez régulièrement vos bibliothèques importantes.

---

## 🌐 GitHub et Déploiement

### Comment mettre mon projet sur GitHub ?

Consultez le [Guide de Démarrage Rapide](./DEMARRAGE_RAPIDE.md) pour un guide en 5 minutes.

### Puis-je héberger l'application en ligne gratuitement ?

Oui ! Plusieurs options :
- **GitHub Pages** : Gratuit, automatique via GitHub Actions
- **Vercel** : Gratuit, déploiement automatique
- **Netlify** : Gratuit, déploiement automatique

Voir le [Guide de Déploiement](./DEPLOIEMENT.md) pour les détails.

### GitHub Actions échoue lors du déploiement

Vérifiez :
1. GitHub Pages est activé dans Settings → Pages → Source: GitHub Actions
2. Les permissions du workflow sont correctes (Settings → Actions → General)
3. Le fichier `.github/workflows/deploy.yml` existe

### L'application déployée affiche une page blanche

Problème commun ! Vérifiez que dans `vite.config.ts` :
```typescript
base: '/nom-exact-du-repository/'
```

Le nom doit correspondre exactement au nom de votre repository GitHub.

---

## 🔧 Problèmes Techniques

### Erreur "par Normand Rocheleau is not defined"

C'est normal ! L'application fonctionne en mode basique si OpenCV.js ne charge pas. Les fonctionnalités principales restent disponibles via l'IA.

### L'application est lente

Optimisations possibles :
- Réduisez la taille des images avant téléversement
- Fermez les autres onglets
- Utilisez Chrome/Edge pour de meilleures performances
- Réduisez le nombre de composants affichés avec le seuil

### Erreur "Cannot read property of undefined"

Essayez :
1. Rafraîchir la page (F5)
2. Vider le cache (Ctrl+Shift+R)
3. Réinitialiser les données (bouton Réinitialiser)

### Le scroll ne fonctionne pas comme attendu

C'est intentionnel :
- **Sur le schéma** : Molette = Zoom
- **Sur la sidebar** : Molette = Scroll normal

### L'application consomme beaucoup de mémoire

L'analyse d'images est gourmande en ressources. Pour réduire la consommation :
- Téléversez des images plus petites
- Fermez les schémas inutilisés
- Rafraîchissez la page après plusieurs analyses

---

## 🤝 Support et Contribution

### J'ai trouvé un bug !

Super ! Créez une [issue sur GitHub](../../issues/new?template=bug_report.md) avec :
- Description du problème
- Étapes pour reproduire
- Captures d'écran si possible

### J'ai une idée de fonctionnalité !

Excellent ! Créez une [feature request](../../issues/new?template=feature_request.md) en décrivant votre idée.

### Comment puis-je contribuer ?

Consultez le [Guide de Contribution](./CONTRIBUTING.md) pour tous les détails !

### Où puis-je obtenir de l'aide ?

1. Consultez cette FAQ
2. Consultez les [Guides de Documentation](./README.md#-documentation)
3. Créez une [issue sur GitHub](../../issues)
4. Consultez les [discussions existantes](../../discussions)

---

## 📞 Contact

**Développeur** : Normand Rocheleau

Pour les questions, suggestions ou problèmes, utilisez [GitHub Issues](../../issues).

---

## 💡 Conseils et Astuces

### Astuce #1 : Commencez avec l'exemple
Chargez toujours l'exemple en premier pour comprendre comment fonctionne l'application.

### Astuce #2 : Exportez régulièrement
Vos bibliothèques personnalisées sont précieuses ! Exportez-les régulièrement.

### Astuce #3 : Nommez vos composants de manière cohérente
Utilisez toujours les mêmes noms (ex: "CB" pour circuit breaker, pas "CB", "cb", "disjoncteur")

### Astuce #4 : Qualité > Quantité
Mieux vaut 5 bonnes annotations qu'20 approximatives.

### Astuce #5 : Utilisez les raccourcis
- **Molette** : Zoom
- **Glisser** : Pan
- **Double-clic** : Reset zoom

---

**Cette FAQ est mise à jour régulièrement. N'hésitez pas à suggérer des ajouts !**

**Conçu et réalisé par Normand Rocheleau**
