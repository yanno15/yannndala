# 🚀 Portfolio — Dev Full Stack & Marketing Digital

Portfolio moderne dark mode avec dashboard d'administration complet.
**Stack :** React + Vite + Tailwind CSS + Supabase · **Déploiement :** Vercel

---

## 📁 Structure du projet

```
portfolio/
├── src/
│   ├── components/
│   │   ├── layout/          # Navbar, Footer
│   │   ├── sections/        # Hero, About, Services, Projects, Skills, Experience, Contact
│   │   └── admin/           # AdminLayout (sidebar)
│   ├── pages/
│   │   ├── Home.jsx         # Page publique principale
│   │   ├── ProjectDetail.jsx
│   │   ├── Login.jsx        # Connexion admin
│   │   └── admin/           # Dashboard, Projets, Compétences, Services, Expériences, Messages, Profil
│   ├── lib/
│   │   └── supabase.js      # Client + toutes les fonctions CRUD
│   └── hooks/
│       ├── useAuth.jsx      # Context d'authentification
│       └── useReveal.js     # Animation au scroll
├── supabase/
│   └── setup.sql            # ⭐ Script SQL complet à exécuter
├── .env.example
├── vercel.json
└── package.json
```

---

## ⚡ Installation rapide

### 1. Cloner et installer

```bash
git clone <votre-repo>
cd portfolio
npm install
```

### 2. Configurer Supabase

1. Allez sur [supabase.com](https://supabase.com) → Créez un projet
2. Dans **SQL Editor** → **New Query**, copiez-collez le contenu de `supabase/setup.sql` et exécutez
3. Dans **Settings > API**, copiez votre **Project URL** et **anon public key**

### 3. Variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` :
```env
VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=VOTRE_ANON_KEY
```

### 4. Créer votre compte admin

Dans Supabase → **Authentication > Users > Add user** :
- Email : votre email
- Password : votre mot de passe
- ✅ Auto Confirm User

### 5. Lancer en local

```bash
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173)

---

## 🌐 Déploiement sur Vercel

### Option A — Via GitHub (recommandé)

1. Push votre code sur GitHub
2. Sur [vercel.com](https://vercel.com) → **New Project** → importez votre repo
3. Ajoutez vos variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Cliquez **Deploy** ✅

### Option B — Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔐 Accès Admin

| URL | Description |
|-----|-------------|
| `/` | Portfolio public |
| `/admin/login` | Connexion admin |
| `/admin` | Dashboard |
| `/admin/projets` | Gérer les projets |
| `/admin/competences` | Gérer les compétences |
| `/admin/services` | Gérer les services |
| `/admin/experiences` | Gérer le parcours |
| `/admin/messages` | Voir les messages de contact |
| `/admin/profil` | Modifier votre profil |

---

## ✏️ Personnalisation

### Remplacer les infos par défaut

Les infos pré-remplies (nom, localisation, email, projets...) sont dans deux endroits :
1. **Base de données Supabase** → modifiez via le dashboard admin `/admin/profil`
2. **Fallback local** dans chaque composant section → remplacez les valeurs `fallback*`

### Changer les couleurs

Éditez `tailwind.config.js` → section `colors` :
```js
violet: { ... },   // couleur principale
neon: { purple, cyan, pink }  // accents néon
```

### Changer les polices

Éditez `index.html` (import Google Fonts) et `tailwind.config.js` → `fontFamily`.
Actuellement : **Space Grotesk** (titres) + **Inter** (corps) + **JetBrains Mono** (code)

---

## 📦 Technologies utilisées

| Technologie | Rôle |
|-------------|------|
| React 18 | UI |
| Vite | Bundler |
| Tailwind CSS | Styles |
| React Router v6 | Navigation |
| Supabase | BDD + Auth + Storage |
| react-hot-toast | Notifications |
| lucide-react | Icônes |

---

## 🗄️ Structure de la base de données

| Table | Description |
|-------|-------------|
| `profile` | Informations du propriétaire |
| `projects` | Projets du portfolio |
| `skills` | Compétences avec niveaux |
| `services` | Services proposés |
| `experiences` | Expériences & formations |
| `messages` | Messages du formulaire contact |

---

Construit avec ❤️ — Dark mode · Animé · Responsive · Admin inclus
