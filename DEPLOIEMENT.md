# 📚 Guide de Déploiement - iSchémateur

**Par Normand Rocheleau**

Ce guide explique comment déployer votre application iSchémateur sur différentes plateformes.

## 🌐 Option 1 : GitHub Pages (Gratuit et Simple)

### Prérequis
- Votre code doit être sur GitHub
- Votre repository doit être public (ou GitHub Pro/Team pour privé)

### Configuration Automatique

Le projet inclut déjà un workflow GitHub Actions (`.github/workflows/deploy.yml`) qui déploie automatiquement votre application à chaque push sur la branche `main`.

### Étapes de Configuration

#### 1. Activer GitHub Pages

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Pages**
4. Sous **Source**, sélectionnez **GitHub Actions**
5. Sauvegardez les modifications

#### 2. Configurer l'URL de Base (Important!)

Si votre repository s'appelle `ischemateur`, modifiez le fichier `vite.config.ts` :

```typescript
export default defineConfig({
  base: '/ischemateur/',  // Ajoutez cette ligne (le nom exact de votre repo)
  plugins: [
    react(),
    tailwindcss(),
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  // ... reste de la configuration
});
```

**Note** : Si votre repository utilise un domaine personnalisé (ex: `ischemateur.com`), utilisez `base: '/'` au lieu du nom du repo.

#### 3. Déployer

```bash
# Committez vos changements
git add .
git commit -m "🚀 Configuration pour GitHub Pages"
git push
```

#### 4. Vérifier le Déploiement

1. Allez dans l'onglet **Actions** de votre repository
2. Vous verrez un workflow en cours d'exécution
3. Une fois terminé (coche verte ✓), votre site sera en ligne !
4. L'URL sera : `https://VOTRE_NOM_UTILISATEUR.github.io/ischemateur/`

### Problèmes Courants

#### Erreur 404 après le déploiement
- Vérifiez que `base: '/nom-du-repo/'` dans `vite.config.ts` correspond exactement au nom de votre repository
- Les chemins sont sensibles à la casse !

#### Le workflow échoue
- Allez dans **Settings** → **Actions** → **General**
- Sous **Workflow permissions**, sélectionnez "Read and write permissions"
- Sauvegardez et relancez le workflow

#### Les changements ne s'affichent pas
- Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
- Attendez quelques minutes, GitHub Pages peut prendre du temps à se mettre à jour

## 🚀 Option 2 : Vercel (Recommandé pour la Production)

Vercel offre un hébergement gratuit avec des performances excellentes et un domaine HTTPS automatique.

### Étapes

1. **Créez un compte** sur [vercel.com](https://vercel.com)
2. **Cliquez sur "New Project"**
3. **Importez votre repository GitHub**
4. **Configuration** :
   - Framework Preset : `Vite`
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Root Directory : `./` (laissez vide si à la racine)
5. **Cliquez sur "Deploy"**

Votre application sera disponible sur : `https://votre-projet.vercel.app`

### Configuration du Domaine Personnalisé

1. Allez dans **Settings** → **Domains**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS

## ☁️ Option 3 : Netlify (Alternative à Vercel)

Similaire à Vercel, Netlify offre un hébergement gratuit avec CI/CD automatique.

### Étapes

1. **Créez un compte** sur [netlify.com](https://netlify.com)
2. **Cliquez sur "Add new site" → "Import an existing project"**
3. **Connectez votre repository GitHub**
4. **Configuration** :
   - Build command : `npm run build`
   - Publish directory : `dist`
5. **Cliquez sur "Deploy site"**

Votre application sera disponible sur : `https://votre-site.netlify.app`

## 🐳 Option 4 : Docker (Pour les Serveurs Personnalisés)

### Créer un Dockerfile

Créez un fichier `Dockerfile` à la racine du projet :

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Créer nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optimisation des assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build et Run

```bash
# Build l'image
docker build -t ischemateur .

# Run le container
docker run -d -p 8080:80 ischemateur
```

L'application sera disponible sur : `http://localhost:8080`

## 📊 Comparaison des Options

| Plateforme | Gratuit | Facile | CI/CD Auto | Domaine Perso | Perf |
|------------|---------|--------|------------|---------------|------|
| **GitHub Pages** | ✅ | ⭐⭐⭐ | ✅ | ✅ (limité) | ⭐⭐⭐ |
| **Vercel** | ✅ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Netlify** | ✅ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Docker** | Dépend | ⭐⭐ | ❌ | ✅ | Configurable |

## 🔒 Sécurité et Performance

### Variables d'Environnement

Pour les clés API et secrets :

**Vercel/Netlify** :
```bash
# Ajoutez dans les settings du projet :
VITE_API_KEY=votre_cle_ici
```

**GitHub Pages** :
1. **Settings** → **Secrets and variables** → **Actions**
2. Ajoutez vos secrets
3. Référencez-les dans `.github/workflows/deploy.yml`

### Optimisations

1. **Compression** : Activée automatiquement sur Vercel/Netlify
2. **CDN** : Inclus sur toutes les plateformes modernes
3. **HTTPS** : Automatique sur toutes les plateformes
4. **Caching** : Configuré automatiquement

## 📝 Checklist Avant le Déploiement

- [ ] Tous les tests passent (`npm run test` si configuré)
- [ ] Le build fonctionne localement (`npm run build && npm run preview`)
- [ ] Les variables d'environnement sont configurées
- [ ] Le `.gitignore` exclut les fichiers sensibles
- [ ] Le README est à jour avec l'URL de production
- [ ] Les métadonnées SEO sont configurées dans `index.html`
- [ ] Les images ont des tailles optimisées
- [ ] Le `base` dans `vite.config.ts` est correct

## 🆘 Support et Dépannage

### GitHub Pages

- **Documentation** : https://docs.github.com/pages
- **Statut** : https://www.githubstatus.com/

### Vercel

- **Documentation** : https://vercel.com/docs
- **Support** : https://vercel.com/support

### Netlify

- **Documentation** : https://docs.netlify.com/
- **Support** : https://www.netlify.com/support/

## 🎉 Prochaines Étapes

Après le déploiement :

1. ✅ Testez toutes les fonctionnalités en production
2. ✅ Configurez Google Analytics (optionnel)
3. ✅ Ajoutez un domaine personnalisé
4. ✅ Configurez un certificat SSL (automatique sur la plupart des plateformes)
5. ✅ Partagez votre application !

---

**Conçu et réalisé par Normand Rocheleau**
