-- ============================================================
--  PORTFOLIO — Script SQL Supabase complet
--  Copiez-collez ce script dans :
--  Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── TABLE : profile ──────────────────────────────────────────
create table if not exists public.profile (
  id              integer primary key default 1,
  name            text,
  title           text,
  bio             text,
  email           text,
  phone           text,
  location        text,
  github_url      text,
  linkedin_url    text,
  twitter_url     text,
  cv_url          text,
  avatar_url      text,
  available       boolean default true,
  updated_at      timestamptz default now()
);

-- Ligne de profil unique (id = 1 toujours)
insert into public.profile (id, name, title, bio, location, available)
values (
  1,
  'Votre Nom Complet',
  'Développeur Full Stack & Marketing Digital',
  'Passionné par le développement web, mobile et le marketing digital. Je conçois des solutions complètes alliant technologie et stratégie digitale.',
  'Brazzaville, Congo',
  true
) on conflict (id) do nothing;

-- ── TABLE : projects ─────────────────────────────────────────
create table if not exists public.projects (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  slug             text not null unique,
  description      text,
  long_description text,
  image_url        text,
  demo_url         text,
  github_url       text,
  category         text check (category in ('web','mobile','marketing','network','design','other')) default 'web',
  tags             text[] default '{}',
  featured         boolean default false,
  order_index      integer default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Index pour tri rapide
create index if not exists projects_order_idx on public.projects(order_index asc);
create index if not exists projects_category_idx on public.projects(category);
create index if not exists projects_featured_idx on public.projects(featured);

-- Données d'exemple
insert into public.projects (title, slug, description, long_description, category, tags, featured, order_index)
values
  (
    'Plateforme E-commerce',
    'plateforme-ecommerce',
    'Application e-commerce complète avec gestion des stocks, paiements intégrés et dashboard vendeur.',
    'Ce projet est une plateforme e-commerce full stack développée avec React pour le frontend et Node.js pour le backend. Elle intègre Stripe pour les paiements, une gestion complète des stocks, un dashboard vendeur avec analytiques, et un système de notifications en temps réel.',
    'web',
    ARRAY['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    true, 1
  ),
  (
    'App Livraison Mobile',
    'app-livraison-mobile',
    'Application mobile de livraison avec tracking en temps réel, paiement mobile money et interface livreur.',
    'Application React Native cross-platform pour un service de livraison. Fonctionnalités : suivi GPS en temps réel, intégration Mobile Money, interface client et livreur distinctes, notifications push, historique des commandes.',
    'mobile',
    ARRAY['React Native', 'Firebase', 'Google Maps', 'Expo'],
    true, 2
  ),
  (
    'Dashboard Analytics Marketing',
    'dashboard-analytics',
    'Tableau de bord analytique pour campagnes marketing multi-canal avec visualisations temps réel.',
    'Dashboard React connecté aux APIs Meta Ads et Google Ads. Visualisation des KPIs clés, comparaison de performances entre campagnes, rapports exportables PDF/Excel et alertes automatiques.',
    'marketing',
    ARRAY['React', 'Chart.js', 'Meta API', 'Google Ads API'],
    true, 3
  )
on conflict (slug) do nothing;

-- ── TABLE : skills ───────────────────────────────────────────
create table if not exists public.skills (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  level       integer check (level between 0 and 100) default 80,
  category    text not null default 'Frontend',
  created_at  timestamptz default now()
);

create index if not exists skills_category_idx on public.skills(category);

-- Données d'exemple
insert into public.skills (name, level, category) values
  ('React / Next.js', 90, 'Frontend'),
  ('JavaScript / TypeScript', 88, 'Frontend'),
  ('HTML5 / CSS3 / Tailwind', 92, 'Frontend'),
  ('Node.js / Express', 82, 'Backend'),
  ('PostgreSQL / Supabase', 78, 'Backend'),
  ('Firebase / MongoDB', 75, 'Backend'),
  ('React Native / Expo', 80, 'Mobile'),
  ('SEO / SEA', 80, 'Marketing'),
  ('Meta Ads / Google Ads', 75, 'Marketing'),
  ('Stratégie de contenu', 82, 'Marketing'),
  ('Business Model Canvas', 78, 'Marketing'),
  ('Administration Linux', 72, 'Systèmes & Réseaux'),
  ('Cisco / Networking', 68, 'Systèmes & Réseaux'),
  ('Git / GitHub', 88, 'Outils'),
  ('Docker / Vercel', 70, 'Outils'),
  ('Figma / Design', 72, 'Outils');

-- ── TABLE : services ─────────────────────────────────────────
create table if not exists public.services (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text,
  icon         text default 'Monitor',
  tags         text[] default '{}',
  order_index  integer default 0,
  created_at   timestamptz default now()
);

insert into public.services (title, description, icon, tags, order_index) values
  ('Développement Web', 'Sites vitrine, applications web complexes, e-commerce. Stack moderne React, Node.js, PostgreSQL.', 'Monitor', ARRAY['React', 'Node.js', 'SQL'], 1),
  ('Apps Mobiles', 'Applications iOS et Android avec React Native. Expérience utilisateur native et performante.', 'Smartphone', ARRAY['React Native', 'Expo', 'Firebase'], 2),
  ('Marketing Digital', 'Stratégie de contenu, gestion réseaux sociaux, campagnes publicitaires et analytics.', 'TrendingUp', ARRAY['SEO', 'Meta Ads', 'Analytics'], 3),
  ('Systèmes & Réseaux', 'Configuration, maintenance et sécurisation d''infrastructures réseau et serveurs.', 'Network', ARRAY['Linux', 'Cisco', 'Sécurité'], 4),
  ('UI/UX Design', 'Maquettes et prototypes Figma, design system cohérent, interfaces intuitives.', 'Palette', ARRAY['Figma', 'Design System', 'Prototypage'], 5),
  ('Stratégie Digitale', 'Audit digital, business model canvas, stratégie de croissance et KPIs.', 'BarChart3', ARRAY['Canvas', 'Growth', 'KPIs'], 6);

-- ── TABLE : experiences ──────────────────────────────────────
create table if not exists public.experiences (
  id           uuid primary key default uuid_generate_v4(),
  type         text check (type in ('work','education')) default 'work',
  title        text not null,
  company      text,
  location     text,
  start_date   text,          -- format "YYYY-MM"
  end_date     text,          -- format "YYYY-MM" ou null si current
  current      boolean default false,
  description  text,
  tags         text[] default '{}',
  created_at   timestamptz default now()
);

create index if not exists experiences_type_idx on public.experiences(type);
create index if not exists experiences_date_idx on public.experiences(start_date desc);

insert into public.experiences (type, title, company, location, start_date, current, description, tags) values
  ('work', 'Développeur Full Stack Freelance', 'Indépendant', 'Brazzaville, Congo', '2022-01', true,
   'Développement d''applications web et mobiles pour des clients locaux et internationaux. Conception d''architectures techniques, intégration d''APIs, déploiement sur cloud.',
   ARRAY['React', 'Node.js', 'React Native', 'Supabase']),
  ('education', 'Développement Web & Mobile', 'École/Bootcamp', 'Brazzaville, Congo', '2020-01',
   false, 'Formation intensive en développement web fullstack et mobile. Projets pratiques en équipe, méthodologies agiles.',
   ARRAY['JavaScript', 'React', 'Node.js', 'React Native']),
  ('education', 'Systèmes & Réseaux Informatiques', 'Institut Technique', 'Brazzaville, Congo', '2018-09',
   false, 'Formation en administration des systèmes d''exploitation, configuration réseau, sécurité informatique et maintenance.',
   ARRAY['Linux', 'Cisco', 'Windows Server', 'Sécurité']);

-- ── TABLE : messages ─────────────────────────────────────────
create table if not exists public.messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

create index if not exists messages_read_idx on public.messages(read);
create index if not exists messages_date_idx on public.messages(created_at desc);

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────
-- Active RLS sur toutes les tables
alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.services enable row level security;
alter table public.experiences enable row level security;
alter table public.messages enable row level security;

-- PROFILE : lecture publique, écriture admin uniquement
create policy "profile_public_read" on public.profile
  for select using (true);
create policy "profile_admin_write" on public.profile
  for all using (auth.role() = 'authenticated');

-- PROJECTS : lecture publique, écriture admin
create policy "projects_public_read" on public.projects
  for select using (true);
create policy "projects_admin_write" on public.projects
  for all using (auth.role() = 'authenticated');

-- SKILLS : lecture publique, écriture admin
create policy "skills_public_read" on public.skills
  for select using (true);
create policy "skills_admin_write" on public.skills
  for all using (auth.role() = 'authenticated');

-- SERVICES : lecture publique, écriture admin
create policy "services_public_read" on public.services
  for select using (true);
create policy "services_admin_write" on public.services
  for all using (auth.role() = 'authenticated');

-- EXPERIENCES : lecture publique, écriture admin
create policy "experiences_public_read" on public.experiences
  for select using (true);
create policy "experiences_admin_write" on public.experiences
  for all using (auth.role() = 'authenticated');

-- MESSAGES : insertion publique (contact form), lecture/update admin
create policy "messages_public_insert" on public.messages
  for insert with check (true);
create policy "messages_admin_read" on public.messages
  for select using (auth.role() = 'authenticated');
create policy "messages_admin_update" on public.messages
  for update using (auth.role() = 'authenticated');

-- ── STORAGE BUCKETS ──────────────────────────────────────────
-- Créer manuellement dans : Supabase → Storage → New Bucket
-- Bucket 1 : "portfolio"  → Public : OUI
-- Bucket 2 : "avatars"    → Public : OUI
--
-- Ou via SQL :
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies Storage
create policy "storage_public_read" on storage.objects
  for select using (bucket_id in ('portfolio', 'avatars'));

create policy "storage_admin_upload" on storage.objects
  for insert with check (auth.role() = 'authenticated' and bucket_id in ('portfolio', 'avatars'));

create policy "storage_admin_delete" on storage.objects
  for delete using (auth.role() = 'authenticated' and bucket_id in ('portfolio', 'avatars'));

-- ── TRIGGERS updated_at ──────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger profile_updated_at
  before update on public.profile
  for each row execute function public.handle_updated_at();

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
-- Après exécution :
-- 1. Allez dans Authentication → Users → Create User
--    pour créer votre compte admin (email + mot de passe)
-- 2. Créez un fichier .env.local avec vos clés Supabase
-- ============================================================
