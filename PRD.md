# iSchémateur - Analyseur de Schémas Électriques

**Conception et réalisation : Normand Rocheleau**

Une application web permettant de téléverser des schémas électriques unifilaires, d'analyser les barres omnibus et les chemins électriques, de reconnaître les composants et de construire un catalogue de composants évolutif utilisant l'analyse alimentée par l'IA.

**Qualités de l'expérience** :
1. **Technique** - Interface d'ingénierie professionnelle qui transmet la précision et l'expertise technique
2. **Intelligent** - La reconnaissance de composants alimentée par l'IA est intelligente et apprend des corrections de l'utilisateur
3. **Organisé** - Hiérarchie visuelle claire entre l'analyse de schéma, le catalogue de composants et les chemins électriques

**Niveau de complexité** : Application complexe (fonctionnalité avancée, probablement avec plusieurs vues)
Cette application nécessite plusieurs fonctionnalités interconnectées : téléversement et affichage d'images, analyse de composants alimentée par l'IA, gestion de catalogue de composants avec capacités d'apprentissage, traçage de chemins électriques et identification de barres omnibus. Le catalogue évolutif avec composants pré-entraînés représente un modèle de données sophistiqué.

## Fonctionnalités Essentielles

### Fonctionnalité 1 : Chargeur d'Exemple Démo
- **Fonctionnalité** : Charger un schéma électrique pré-analysé depuis le web avec reconnaissance complète des composants et analyse des chemins
- **Objectif** : Permettre aux utilisateurs de voir immédiatement les capacités de l'application sans téléverser leur propre schéma
- **Déclencheur** : L'utilisateur clique sur le bouton "Exemple" sur l'écran d'accueil
- **Progression** : Cliquer "Exemple" → Récupérer le schéma depuis le web → Afficher un schéma de sous-station industrielle pré-analysé → Montrer 10 composants identifiés → Afficher 4 chemins électriques
- **Critères de Succès** : L'exemple se charge rapidement, démontre toutes les fonctionnalités clés (liste de composants, catalogue, chemins), fournit des données industrielles réalistes

### Fonctionnalité 2 : Téléversement et Affichage de Schéma
- **Fonctionnalité** : Téléverser et afficher des schémas électriques unifilaires (PNG, JPG, SVG)
- **Objectif** : Fournir la base pour toutes les opérations d'analyse
- **Déclencheur** : L'utilisateur clique sur le bouton téléverser ou glisse un fichier dans la zone de dépôt
- **Progression** : Cliquer téléverser → Sélectionner le fichier → Aperçu miniature → Confirmer → Afficher le schéma complet avec contrôles de zoom/panoramique
- **Critères de Succès** : L'image s'affiche clairement à différents niveaux de zoom, supporte les formats de schéma électrique courants

### Fonctionnalité 3 : Système de Détection Hybride de Composants (par Normand Rocheleau + IA)
- **Fonctionnalité** : Détection en trois étapes combinant la correspondance de modèles par Normand Rocheleau avec détection de rotation et analyse IA GPT-4o
- **Objectif** : Atteindre une précision maximale en exploitant la vision par ordinateur (par Normand Rocheleau), la détection de motifs géométriques et la compréhension contextuelle de l'IA
- **Déclencheur** : L'utilisateur clique sur le bouton "Analyser" après le téléversement
- **Progression** : Cliquer analyser → Étape 1 : L'utilisateur annote des composants échantillons → Étape 2 : Correspondance de modèles par Normand Rocheleau avec rotation à 4 angles (0°, 90°, 180°, 270°) → Affichage en temps réel des composants détectés → Étape 3 : L'IA affine les résultats, extrait les étiquettes de texte, identifie les valeurs nominales → Afficher les composants avec scores de confiance → Montrer les statistiques de détection
- **Critères de Succès** : Détecte les disjoncteurs L1BT, barres omnibus, transformateurs, moteurs et autres symboles standards avec >85% de confiance; gère automatiquement les composants pivotés; fournit des statistiques détaillées sur la qualité de détection

**Pipeline de Détection par Normand Rocheleau** :
- **Extraction de Modèle** : Régions annotées par l'utilisateur extraites comme modèles
- **Correspondance Multi-Angles** : Modèles pivotés (0°, 90°, 180°, 270°) utilisant les matrices de rotation par Normand Rocheleau
- **TM_CCOEFF_NORMED** : Correspondance de modèles par corrélation croisée normalisée pour une détection robuste
- **Suppression Non-Maximale** : Élimine les détections qui se chevauchent dans le rayon
- **Filtrage par Confiance** : Seules les correspondances au-dessus du seuil sont affichées
- **Mode de Secours** : Si par Normand Rocheleau n'est pas disponible, utilise une comparaison pixel par pixel basique

**Algorithmes de Détection** :
- **Disjoncteurs (L1BT, CB)** : Régions rectangulaires sombres avec rectangles intérieurs blancs
- **Barres Omnibus** : Lignes horizontales épaisses (6+ pixels), souvent de couleur rouge/orange
- **Transformateurs** : Cercles concentriques avec marqueurs de texte au centre
- **Moteurs** : Régions rectangulaires bleues avec symbole M circulaire
- **Compteurs** : Régions rectangulaires jaunes/dorées
- **Sectionneurs** : Petits rectangles en positions amont (<30% hauteur du schéma)

**Raffinement par IA** :
- GPT-4o examine les résultats de la vision par ordinateur
- Extrait les étiquettes de composants (CB-1, T1, M2, etc.)
- Identifie les tensions nominales et courants nominaux depuis le texte
- Vérifie que les types de composants correspondent aux conventions électriques
- Ajoute les composants manquants que la vision par ordinateur a pu manquer

### Fonctionnalité 4 : Traçage de Barres Omnibus et Chemins
- **Fonctionnalité** : Tracer les connexions électriques et identifier les réseaux de barres omnibus
- **Objectif** : Comprendre le flux électrique et les chemins de distribution d'énergie
- **Déclencheur** : L'utilisateur clique sur un composant ou une barre omnibus
- **Progression** : Cliquer sur le composant → Mettre en surbrillance le chemin électrique connecté → Afficher le niveau de tension → Afficher les composants connectés dans la vue des chemins
- **Critères de Succès** : Mise en surbrillance visuelle des éléments connectés, indication claire de la direction du flux électrique

### Fonctionnalité 5 : Catalogue de Composants Évolutif
- **Fonctionnalité** : Maintenir un catalogue persistant de composants reconnus qui apprend des corrections de l'utilisateur
- **Objectif** : Construire des connaissances institutionnelles et améliorer la précision de reconnaissance au fil du temps
- **Déclencheur** : Automatique lors de la reconnaissance de composants, manuel lors des modifications de l'utilisateur
- **Progression** : Composant reconnu → Stocké dans le catalogue avec métadonnées → L'utilisateur corrige le type → Le catalogue se met à jour → La reconnaissance future est améliorée
- **Critères de Succès** : Le catalogue grandit avec l'utilisation, l'utilisateur peut parcourir/éditer le catalogue, précision améliorée sur les types de composants répétés

### Fonctionnalité 6 : Éditeur de Détails de Composants
- **Fonctionnalité** : Visualiser et modifier les propriétés détaillées des composants reconnus
- **Objectif** : Ajouter des spécifications techniques au-delà de la reconnaissance visuelle
- **Déclencheur** : Cliquer sur n'importe quel composant reconnu
- **Progression** : Cliquer sur le composant → Le panneau latéral s'ouvre → Afficher/modifier les propriétés (valeur nominale, tension, fabricant) → Enregistrer → Mettre à jour le catalogue
- **Critères de Succès** : Toutes les métadonnées de composants sont modifiables et persistantes

## Gestion des Cas Limites
- **Images de Mauvaise Qualité** : Afficher un avertissement si la résolution de l'image est trop faible, suggérer une largeur minimale de 1000px
- **Aucun Composant Détecté** : Fournir des outils d'ajout manuel de composants, guider l'utilisateur pour améliorer la qualité de l'image
- **Composants Qui se Chevauchent** : Permettre à l'utilisateur de séparer/identifier manuellement les détections conflictuelles
- **Types de Fichiers Non Supportés** : Message d'erreur clair avec liste des formats supportés
- **Téléversements de Fichiers Volumineux** : Indicateur de progression, limite de taille de fichier de 10 Mo avec message clair

## Direction de Conception
La conception devrait évoquer l'ingénierie de précision, la compétence technique et l'automatisation intelligente. Pensez aux interfaces de salle de contrôle, aux esthétiques de logiciels CAO et aux outils d'ingénierie professionnels - propres, structurés, avec une utilisation ciblée de couleurs d'accentuation techniques pour mettre en évidence les connexions électriques et les états des composants.

## Sélection de Couleurs

- **Couleur Principale** : Bleu Électrique Profond `oklch(0.45 0.15 250)` - Transmet l'énergie électrique, la précision technique et la confiance
- **Couleurs Secondaires** : 
  - Gris Ardoise `oklch(0.35 0.02 255)` - Arrière-plan professionnel pour le contenu technique
  - Gris Technique Clair `oklch(0.92 0.01 255)` - Surfaces propres pour les schémas
- **Couleur d'Accentuation** : Orange Tension `oklch(0.68 0.18 45)` - Haute visibilité pour les composants actifs, avertissements et chemins électriques
- **Paires Premier Plan/Arrière-Plan** :
  - Bleu Principal sur Blanc `oklch(0.45 0.15 250)` / `oklch(0.98 0 0)` - Ratio 7.2:1 ✓
  - Blanc sur Bleu Principal `oklch(0.98 0 0)` / `oklch(0.45 0.15 250)` - Ratio 7.2:1 ✓
  - Ardoise sur Gris Clair `oklch(0.35 0.02 255)` / `oklch(0.92 0.01 255)` - Ratio 8.5:1 ✓
  - Orange Tension sur Blanc `oklch(0.68 0.18 45)` / `oklch(0.98 0 0)` - Ratio 5.1:1 ✓

## Sélection de Police
La typographie devrait transmettre la précision technique avec une excellente lisibilité pour les spécifications détaillées - utilisez JetBrains Mono pour les données techniques et Space Grotesk pour les éléments d'interface utilisateur afin d'équilibrer l'esthétique d'ingénierie avec l'utilisabilité moderne.

- **Hiérarchie Typographique** :
  - H1 (Titre de Page) : Space Grotesk Bold / 32px / -0.02em espacement des lettres
  - H2 (En-têtes de Section) : Space Grotesk SemiBold / 24px / -0.01em espacement des lettres
  - H3 (Noms de Composants) : Space Grotesk Medium / 18px / espacement normal des lettres
  - Texte de Corps : Space Grotesk Regular / 15px / espacement normal des lettres / hauteur de ligne 1.5
  - Données Techniques : JetBrains Mono Regular / 14px / espacement normal des lettres / monospace pour l'alignement
  - Étiquettes de Composants : JetBrains Mono Medium / 12px / pour les superpositions de schéma

## Animations
Les animations devraient être précises et ciblées, comme les interactions de logiciels CAO - retour instantané sur la sélection de composant avec mise en surbrillance par pulsation subtile, panoramique/zoom fluide avec accélération qui ressemble à des contrôles de précision, éléments de liste de composants qui glissent après la fin de l'analyse, et mise en surbrillance des chemins électriques qui tracent le long des connexions avec un effet de lueur animé subtil.

## Sélection de Composants

- **Composants** :
  - **Card** : Conteneur principal pour le visualiseur de schéma, le catalogue de composants et les panneaux de détails avec ombres subtiles
  - **Button** : Actions principales (Téléverser, Analyser) utilisent le style principal rempli; actions secondaires (Annuler, Réinitialiser) utilisent la variante contour
  - **Tabs** : Basculer entre Vue d'Analyse, Vue Catalogue et Vue Chemins
  - **ScrollArea** : Pour les listes de composants et la navigation du catalogue avec style de barre de défilement personnalisé
  - **Dialog** : Flux de travail de téléversement de nouveau schéma, édition des détails de composant
  - **Badge** : Scores de confiance des composants, indicateurs de niveau de tension avec codage couleur
  - **Input / Label** : Édition des propriétés de composant dans le panneau de détails
  - **Separator** : Division visuelle entre le visualiseur de schéma et la liste de composants
  - **Progress** : Progression de l'analyse pendant le traitement IA
  - **Tooltip** : Informations rapides sur les composants au survol du schéma

- **Personnalisations** :
  - Composant canvas personnalisé pour l'affichage de schéma avec contrôles de zoom/panoramique utilisant la molette de la souris et le glisser
  - Système de superposition de boîtes englobantes personnalisé pour mettre en surbrillance les composants reconnus
  - Mise en surbrillance de chemin électrique personnalisé avec traçage de ligne SVG
  - Badges codés par couleur pour les types de composants (rouge pour les disjoncteurs, bleu pour les transformateurs, orange pour les barres omnibus)

- **États** :
  - Bouton Téléverser : Bleu par défaut, survol avec échelle subtile, actif avec effet pressé, gris désactivé pendant l'analyse
  - Cartes de Composants : Blanc par défaut, survol avec mise en surbrillance de bordure, sélectionné avec bordure bleue principale et ombre
  - Boîtes Englobantes : Contour bleu par défaut, survol avec contour orange plus épais, sélectionné avec superposition orange remplie à 20% d'opacité

- **Sélection d'Icônes** :
  - Téléverser : `UploadSimple` pour l'action de téléversement de fichier
  - Analyse : `MagnifyingGlass` ou `Lightning` pour le déclenchement de l'analyse IA
  - Composants : `Cube` pour le catalogue, `CircuitBoard` pour le schéma
  - Chemins : `GitBranch` ou `Lightning` pour les connexions électriques
  - Éditer : `PencilSimple` pour l'édition de composant
  - Zoom : `MagnifyingGlassMinus` / `MagnifyingGlassPlus` pour les contrôles de schéma
  - Enregistrer : `FloppyDisk` pour les mises à jour du catalogue

- **Espacement** :
  - Remplissage de page : `p-6` sur bureau, `p-4` sur mobile
  - Remplissage interne de carte : `p-6` pour les zones de contenu
  - Écart de liste de composants : `gap-3` entre les éléments
  - Espacement des champs de formulaire : `gap-4` pour l'empilement vertical
  - Remplissage de bouton : `px-6 py-2.5` pour les actions principales

- **Mobile** :
  - Empiler le visualiseur de schéma au-dessus de la liste de composants sur mobile
  - Onglets pleine largeur avec défilement horizontal si nécessaire
  - Le bouton téléverser s'étend à pleine largeur
  - Le panneau de détails de composant glisse vers le haut depuis le bas comme une feuille au lieu d'un panneau latéral
  - Contrôles de zoom optimisés pour le tactile avec support du geste de pincement
  - Superposition de schéma simplifiée avec cibles de toucher plus grandes pour la sélection de composant
