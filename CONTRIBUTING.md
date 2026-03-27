# 🤝 Guide de Contribution - iSchémateur

**Par Normand Rocheleau**

Merci de votre intérêt pour contribuer à iSchémateur ! Ce guide vous aidera à démarrer.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Processus de Développement](#processus-de-développement)
- [Standards de Code](#standards-de-code)
- [Soumettre une Pull Request](#soumettre-une-pull-request)

## 📜 Code de Conduite

En participant à ce projet, vous acceptez de :

- ✅ Être respectueux envers tous les contributeurs
- ✅ Fournir des critiques constructives
- ✅ Accepter les critiques de manière professionnelle
- ✅ Se concentrer sur ce qui est meilleur pour la communauté
- ❌ Ne pas harceler ou dénigrer les autres participants

## 🚀 Comment Contribuer

Il y a plusieurs façons de contribuer :

### 🐛 Signaler des Bugs

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](../../issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs réel
   - Captures d'écran si pertinent
   - Informations sur votre navigateur/OS

### ✨ Proposer des Fonctionnalités

1. Vérifiez qu'elle n'existe pas déjà dans les [Issues](../../issues)
2. Créez une nouvelle issue avec le template "Feature Request"
3. Décrivez :
   - Le problème que la fonctionnalité résout
   - La solution proposée
   - Les alternatives considérées
   - Des exemples d'utilisation

### 📝 Améliorer la Documentation

- Corrections de typos
- Clarification d'instructions
- Ajout d'exemples
- Traductions

### 💻 Contribuer du Code

Voir la section [Processus de Développement](#processus-de-développement) ci-dessous.

## 🛠️ Configuration de l'Environnement

### Prérequis

- **Node.js** : Version 20.x ou supérieure
- **npm** : Version 10.x ou supérieure
- **Git** : Version 2.x ou supérieure
- **Éditeur de code** : VS Code recommandé

### Installation

```bash
# 1. Fork le repository sur GitHub (cliquez sur "Fork")

# 2. Clonez votre fork
git clone https://github.com/VOTRE_NOM_UTILISATEUR/ischemateur.git
cd ischemateur

# 3. Ajoutez le repository original comme remote
git remote add upstream https://github.com/ORIGINAL_OWNER/ischemateur.git

# 4. Installez les dépendances
npm install

# 5. Lancez le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Extensions VS Code Recommandées

Créez ou modifiez `.vscode/extensions.json` :

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 🔄 Processus de Développement

### 1. Créer une Branche

```bash
# Mettez à jour votre main
git checkout main
git pull upstream main

# Créez une branche pour votre fonctionnalité
git checkout -b feature/nom-de-la-fonctionnalite
```

**Conventions de nommage des branches** :
- `feature/description` - Nouvelles fonctionnalités
- `fix/description` - Corrections de bugs
- `docs/description` - Documentation
- `refactor/description` - Refactoring de code
- `test/description` - Ajout de tests

### 2. Développer

```bash
# Faites vos modifications

# Testez fréquemment
npm run dev

# Vérifiez le linting
npm run lint

# Créez le build
npm run build
```

### 3. Committer

```bash
# Ajoutez vos fichiers
git add .

# Committez avec un message descriptif
git commit -m "✨ Add: Description de votre changement"
```

**Conventions de messages de commit** :

- ✨ `feat:` - Nouvelle fonctionnalité
- 🐛 `fix:` - Correction de bug
- 📝 `docs:` - Documentation
- 🎨 `style:` - Formatage, point-virgules manquants, etc.
- ♻️ `refactor:` - Refactoring de code
- ⚡ `perf:` - Amélioration de performance
- ✅ `test:` - Ajout de tests
- 🔧 `chore:` - Maintenance, dépendances

**Exemples** :
```bash
git commit -m "✨ feat: Add multi-angle component detection"
git commit -m "🐛 fix: Resolve CSV export encoding issue"
git commit -m "📝 docs: Update installation instructions"
git commit -m "♻️ refactor: Optimize image processing pipeline"
```

### 4. Pousser

```bash
git push origin feature/nom-de-la-fonctionnalite
```

## 📏 Standards de Code

### TypeScript

- ✅ Utilisez TypeScript pour tous les nouveaux fichiers
- ✅ Définissez des types explicites pour les props et states
- ✅ Évitez `any`, utilisez `unknown` si nécessaire
- ✅ Utilisez des interfaces pour les objets complexes

**Exemple** :
```typescript
// ✅ Bon
interface ComponentProps {
  id: string
  name: string
  confidence: number
}

// ❌ Mauvais
const props: any = { ... }
```

### React

- ✅ Utilisez les hooks fonctionnels (pas de classes)
- ✅ Nommez les composants en PascalCase
- ✅ Nommez les fichiers selon le composant (`DiagramViewer.tsx`)
- ✅ Utilisez `useKV` pour la persistance (pas `localStorage`)
- ✅ Évitez les commentaires sauf si absolument nécessaire

**Exemple** :
```typescript
// ✅ Bon
import { useKV } from '@github/spark/hooks'

function ComponentList({ components }: ComponentListProps) {
  const [selected, setSelected, deleteSelected] = useKV('selected-id', null)
  
  return (
    <div>
      {components.map(comp => (
        <ComponentCard key={comp.id} component={comp} />
      ))}
    </div>
  )
}

// ❌ Mauvais
const ComponentList = (props) => {
  const [selected, setSelected] = useState(
    localStorage.getItem('selected') // N'utilisez pas localStorage !
  )
  // ...
}
```

### Tailwind CSS

- ✅ Utilisez les classes utilitaires Tailwind
- ✅ Respectez les couleurs du thème (`bg-primary`, `text-foreground`)
- ✅ Responsive mobile-first (`sm:`, `md:`, `lg:`)
- ✅ Utilisez les composants shadcn/ui quand possible

**Exemple** :
```tsx
// ✅ Bon
<Button variant="outline" size="sm" className="gap-2">
  <Upload size={16} />
  Téléverser
</Button>

// ❌ Mauvais
<button style={{ backgroundColor: 'blue', padding: '8px' }}>
  Téléverser
</button>
```

### Fichiers et Organisation

```
src/
├── components/          # Composants React
│   ├── DiagramViewer.tsx
│   ├── ComponentList.tsx
│   └── ui/             # shadcn components (ne pas modifier)
├── lib/                # Logique métier
│   ├── analysis.ts
│   ├── types.ts
│   └── utils.ts
├── hooks/              # Hooks personnalisés
│   └── use-mobile.ts
└── App.tsx             # Composant racine
```

## 🚀 Soumettre une Pull Request

### 1. Préparez votre PR

- [ ] Votre code suit les standards ci-dessus
- [ ] `npm run build` fonctionne sans erreur
- [ ] `npm run lint` ne montre pas d'erreurs
- [ ] Vous avez testé vos changements manuellement
- [ ] La documentation est à jour si nécessaire

### 2. Créez la PR

1. Allez sur votre fork sur GitHub
2. Cliquez sur "Compare & pull request"
3. Remplissez le template de PR :
   - **Titre** : Description claire et concise
   - **Description** : Qu'est-ce qui change et pourquoi
   - **Issue liée** : Référencez une issue si applicable (#123)
   - **Screenshots** : Si changement visuel
   - **Checklist** : Cochez les cases pertinentes

### 3. Revue de Code

- Un mainteneur examinera votre PR
- Répondez aux commentaires de manière constructive
- Effectuez les modifications demandées
- Poussez les changements (la PR se mettra à jour automatiquement)

### 4. Merge

Une fois approuvée, votre PR sera mergée ! 🎉

## 🎯 Priorités Actuelles

Consultez les [Issues](../../issues) avec les labels :

- `good first issue` - Parfait pour les nouveaux contributeurs
- `help wanted` - Nous recherchons activement de l'aide
- `priority: high` - Important et urgent
- `enhancement` - Nouvelles fonctionnalités

## 💡 Conseils

### Pour les Nouveaux Contributeurs

1. Commencez par les issues `good first issue`
2. N'hésitez pas à poser des questions dans les issues
3. Lisez le code existant pour comprendre le style
4. Testez sur différents navigateurs si possible

### Pour les Contributeurs Expérimentés

1. Considérez les issues `priority: high`
2. Proposez des architectures pour les fonctionnalités complexes
3. Aidez à la revue de code d'autres PRs
4. Mentorez les nouveaux contributeurs

## 📞 Questions ?

- **Issues** : Pour les bugs et fonctionnalités
- **Discussions** : Pour les questions générales
- **Email** : Pour les questions privées (si configuré)

## 🙏 Remerciements

Merci d'avoir pris le temps de contribuer ! Chaque contribution, petite ou grande, est appréciée. 💙

---

**Conçu et réalisé par Normand Rocheleau**
