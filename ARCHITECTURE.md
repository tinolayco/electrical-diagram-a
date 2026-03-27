# 🏗️ Architecture - iSchémateur

**Par Normand Rocheleau**

Ce document décrit l'architecture technique de l'application iSchémateur.

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    Interface Utilisateur                 │
│              (React Components + Tailwind CSS)           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   Logique Métier                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Analyse    │  │  Bibliothèque │  │   Export     │  │
│  │              │  │   Manager     │  │   Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                Services & APIs                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  par Normand │  │   GPT-4o     │  │  Persistence │  │
│  │   Rocheleau  │  │   (Spark)    │  │   (useKV)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 📁 Structure des Fichiers

```
ischemateur/
│
├── 📄 Configuration
│   ├── index.html              # Point d'entrée HTML
│   ├── vite.config.ts          # Configuration Vite
│   ├── tsconfig.json           # Configuration TypeScript
│   ├── tailwind.config.js      # Configuration Tailwind
│   └── package.json            # Dépendances npm
│
├── 🎨 Source (src/)
│   ├── App.tsx                 # Composant racine, orchestration
│   ├── main.tsx                # Point d'entrée React (NE PAS MODIFIER)
│   ├── index.css               # Styles globaux et thème
│   ├── main.css                # Styles structurels (NE PAS MODIFIER)
│   │
│   ├── 🧩 components/
│   │   ├── DiagramViewer.tsx           # Visualisation du schéma avec zoom/pan
│   │   ├── ComponentList.tsx           # Liste des composants détectés
│   │   ├── ComponentEditor.tsx         # Édition des propriétés
│   │   ├── TrainingMode.tsx            # Mode annotation/entraînement
│   │   ├── LibraryManager.tsx          # Gestion des bibliothèques
│   │   ├── DetectionStats.tsx          # Statistiques de détection
│   │   ├── UploadDialog.tsx            # Dialog de téléversement
│   │   ├── HelpDialog.tsx              # Dialog d'aide
│   │   └── ui/                         # Composants shadcn/ui (NE PAS MODIFIER)
│   │
│   ├── 📚 lib/
│   │   ├── types.ts                    # Types TypeScript
│   │   ├── analysis.ts                 # Logique d'analyse principale
│   │   ├── opencv-detection.ts         # Détection par Normand Rocheleau
│   │   ├── demo-data.ts                # Données de démonstration
│   │   ├── export-formats.ts           # Export CSV/JSON/XML
│   │   └── utils.ts                    # Utilitaires généraux
│   │
│   └── 🪝 hooks/
│       └── use-mobile.ts               # Hook de détection mobile
│
├── 📖 Documentation
│   ├── README.md                       # Documentation principale
│   ├── PRD.md                          # Spécifications produit
│   ├── GITHUB_SETUP.md                 # Guide GitHub complet
│   ├── DEPLOIEMENT.md                  # Guide de déploiement
│   ├── DEMARRAGE_RAPIDE.md             # Démarrage ultra-rapide
│   ├── CONTRIBUTING.md                 # Guide de contribution
│   ├── CHANGELOG.md                    # Historique des versions
│   ├── CHECKLIST_GITHUB.md             # Checklist de publication
│   ├── GUIDE_UTILISATION.md            # Guide utilisateur
│   └── GUIDE_EXPORT_IMPORT.md          # Guide export/import
│
└── ⚙️ Configuration GitHub
    └── .github/
        ├── workflows/
        │   └── deploy.yml              # GitHub Actions (déploiement)
        ├── ISSUE_TEMPLATE/
        │   ├── bug_report.md           # Template de bug report
        │   └── feature_request.md      # Template de feature request
        └── PULL_REQUEST_TEMPLATE.md    # Template de PR
```

## 🔄 Flux de Données

### 1. Téléversement de Schéma

```
Utilisateur
    ↓ Téléverse image
UploadDialog
    ↓ Base64 encoding
App.tsx (handleUpload)
    ↓ Création Schematic
useKV('schematics')
    ↓ Persistance
IndexedDB (navigateur)
```

### 2. Analyse de Schéma

```
Utilisateur clique "Analyser"
    ↓
App.tsx (handleAnalyze)
    ↓
analyzeSchematic (lib/analysis.ts)
    ↓
    ├─→ Étape 1: Annotations utilisateur (TrainingMode)
    │       ↓
    │   Extraction de régions d'intérêt
    │
    ├─→ Étape 2: Détection par Normand Rocheleau (opencv-detection.ts)
    │       ↓
    │   ├─ Template matching multi-angles
    │   ├─ Suppression non-maximale
    │   └─ Filtrage par confiance
    │
    └─→ Étape 3: Raffinement IA (GPT-4o via Spark)
            ↓
        ├─ Extraction de texte/labels
        ├─ Validation des types
        └─ Ajout de métadonnées
    ↓
Composants détectés
    ↓
identifyElectricalPaths (lib/analysis.ts)
    ↓
Chemins électriques
    ↓
updateCatalog (App.tsx)
    ↓
useKV('component-catalog')
```

### 3. Gestion des Bibliothèques

```
Utilisateur crée bibliothèque
    ↓
LibraryManager
    ↓
App.tsx (handleLibraryCreate)
    ↓
useKV('component-libraries')
    ↓
Export → Fichier JSON local (via File System Access API)
Import → Lecture fichier → Merge avec bibliothèque existante
```

## 🧱 Composants Clés

### App.tsx
- **Responsabilité** : Orchestration de l'application
- **État** :
  - `schematics` (useKV) - Tous les schémas
  - `catalog` (useKV) - Catalogue de composants
  - `libraries` (useKV) - Bibliothèques personnalisées
  - `currentSchematic` (useState) - Schéma actif
  - `confidenceThreshold` (useKV) - Seuil de confiance
- **Fonctions principales** :
  - `handleUpload` - Téléversement de schéma
  - `handleAnalyze` - Lancement de l'analyse
  - `handleTrainingComplete` - Entraînement supervisé
  - `handleComponentSave` - Modification de composant

### DiagramViewer.tsx
- **Responsabilité** : Affichage et interaction avec le schéma
- **Fonctionnalités** :
  - Zoom contextuel (molette souris)
  - Pan (glisser-déposer)
  - Superposition de boîtes englobantes
  - Mise en surbrillance de composants
  - Interaction avec disjoncteurs (toggle état)

### TrainingMode.tsx
- **Responsabilité** : Mode d'entraînement supervisé
- **Fonctionnalités** :
  - Sélection de régions (rectangle)
  - Saisie du type de composant
  - Création d'annotations
  - Ajout à la bibliothèque

### LibraryManager.tsx
- **Responsabilité** : Gestion des bibliothèques
- **Fonctionnalités** :
  - CRUD bibliothèques
  - Export/Import (JSON, CSV, XML)
  - Versioning
  - Sélection bibliothèque active

## 🔧 Technologies et Librairies

### Frontend
- **React 19** : Framework UI
- **TypeScript 5.7** : Typage statique
- **Vite 7** : Build tool et dev server
- **Tailwind CSS 4** : Styling utility-first

### UI Components
- **shadcn/ui v4** : Composants UI pré-construits
- **Radix UI** : Primitives UI accessibles
- **Phosphor Icons** : Bibliothèque d'icônes
- **Framer Motion** : Animations

### Détection et IA
- **par Normand Rocheleau (OpenCV.js)** : Vision par ordinateur
- **GPT-4o** : Analyse contextuelle (via Spark SDK)
- **Spark SDK** : Runtime et APIs

### Persistance
- **useKV** : Hook de persistance (wrapper IndexedDB)
- **IndexedDB** : Base de données navigateur

### Utilitaires
- **clsx + tailwind-merge** : Gestion des classes CSS
- **date-fns** : Manipulation de dates
- **sonner** : Notifications toast

## 🎯 Patterns de Conception

### 1. Composition de Composants
```tsx
// Composants réutilisables et composables
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    Contenu
  </CardContent>
</Card>
```

### 2. Custom Hooks
```tsx
// Logique réutilisable encapsulée
const [data, setData, deleteData] = useKV('key', defaultValue)
const isMobile = useIsMobile()
```

### 3. Functional Updates (CRITIQUE!)
```tsx
// ❌ MAUVAIS - Utilise une valeur stale
setTodos([...todos, newTodo])

// ✅ BON - Utilise toujours la dernière valeur
setTodos(current => [...current, newTodo])
```

### 4. Type Safety
```tsx
// Types explicites pour props et états
interface ComponentProps {
  component: Component
  onSelect: (id: string) => void
}

function MyComponent({ component, onSelect }: ComponentProps) {
  // ...
}
```

## 🔐 Sécurité

### Données Sensibles
- ❌ Pas de clés API hardcodées
- ❌ Pas de mots de passe dans le code
- ✅ Utilisation de variables d'environnement (si nécessaire)
- ✅ Validation des entrées utilisateur

### Persistance
- ✅ Données stockées localement (pas de serveur externe)
- ✅ Pas de tracking ou analytics par défaut
- ✅ Contrôle total de l'utilisateur sur ses données

## ⚡ Performance

### Optimisations
- **Code splitting** : Vite le fait automatiquement
- **Lazy loading** : Composants chargés à la demande
- **Memoization** : `useMemo` pour calculs coûteux
- **Virtual scrolling** : Pour grandes listes (si nécessaire)

### Bonnes Pratiques
```tsx
// Filtrage optimisé avec useMemo
const filteredComponents = useMemo(() => {
  return components.filter(c => c.confidence >= threshold)
}, [components, threshold])
```

## 🧪 Tests (À Implémenter)

### Tests Recommandés
- **Unit Tests** : Fonctions utilitaires (lib/)
- **Component Tests** : Composants React
- **Integration Tests** : Flux utilisateur complets
- **E2E Tests** : Scénarios critiques

### Outils Suggérés
- **Vitest** : Test runner
- **React Testing Library** : Tests de composants
- **Playwright** : Tests E2E

## 📦 Build et Déploiement

### Build Local
```bash
npm run build
# Génère le dossier dist/ avec assets optimisés
```

### Déploiement
- **GitHub Pages** : Via GitHub Actions
- **Vercel** : Auto-deployment
- **Netlify** : Auto-deployment
- **Docker** : Container personnalisé

## 🔮 Évolutions Futures

### Court Terme
- [ ] Tests automatisés
- [ ] PWA (Progressive Web App)
- [ ] Mode hors-ligne
- [ ] Import de fichiers DWG/DXF

### Moyen Terme
- [ ] Collaboration temps réel
- [ ] API REST pour intégrations
- [ ] Application mobile native
- [ ] Export vers formats CAO

### Long Terme
- [ ] Machine Learning personnalisé
- [ ] Base de données cloud (optionnelle)
- [ ] Marketplace de bibliothèques
- [ ] Plugins et extensions

---

**Conçu et réalisé par Normand Rocheleau**
