-- ============================================================
-- PORTFOLIO — Script SQL Supabase complet
-- Exécutez ce script dans : Supabase > SQL Editor > New Query
-- ============================================================


-- ══════════════════════════════════════════════════════════════
-- 1. TABLE : profile
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profile (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  full_name     TEXT,
  title         TEXT,
  bio           TEXT,
  email         TEXT,
  phone         TEXT,
  location      TEXT,
  github_url    TEXT,
  linkedin_url  TEXT,
  twitter_url   TEXT,
  avatar_url    TEXT,
  cv_url        TEXT,
  available     BOOLEAN DEFAULT TRUE,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Insérer un profil par défaut (id fixe = 1)
INSERT INTO public.profile (id, full_name, title, bio, location, available)
VALUES (
  1,
  'Votre Nom Complet',
  'Développeur Full Stack & Marketing Digital',
  'Passionné de tech et de stratégie digitale, je conçois des solutions web/mobile performantes.',
  'Brazzaville, Congo',
  TRUE
)
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 2. TABLE : projects
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.projects (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  long_description  TEXT,
  image_url         TEXT,
  category          TEXT DEFAULT 'web',   -- web | mobile | marketing | network
  tags              TEXT[] DEFAULT '{}',
  demo_url          TEXT,
  github_url        TEXT,
  featured          BOOLEAN DEFAULT FALSE,
  order_index       INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Données exemple
INSERT INTO public.projects (title, slug, description, category, tags, featured, order_index) VALUES
(
  'Plateforme E-commerce',
  'plateforme-ecommerce',
  'Application e-commerce complète avec gestion des stocks, paiements intégrés et dashboard vendeur.',
  'web',
  ARRAY['React', 'Node.js', 'Stripe', 'PostgreSQL'],
  TRUE, 1
),
(
  'App Livraison Mobile',
  'app-livraison-mobile',
  'Application mobile de livraison avec tracking en temps réel, paiement mobile money et interface livreur.',
  'mobile',
  ARRAY['React Native', 'Firebase', 'Maps'],
  TRUE, 2
),
(
  'Dashboard Analytics Marketing',
  'dashboard-analytics',
  'Tableau de bord analytique pour campagne marketing multi-canal avec visualisations temps réel.',
  'marketing',
  ARRAY['React', 'Chart.js', 'Meta API'],
  TRUE, 3
);


-- ══════════════════════════════════════════════════════════════
-- 3. TABLE : skills
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.skills (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT NOT NULL,
  level      INTEGER DEFAULT 80 CHECK (level >= 0 AND level <= 100),
  category   TEXT DEFAULT 'Frontend',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.skills (name, level, category) VALUES
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


-- ══════════════════════════════════════════════════════════════
-- 4. TABLE : services
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.services (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  icon          TEXT DEFAULT 'Monitor',
  tags          TEXT[] DEFAULT '{}',
  order_index   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.services (title, description, icon, tags, order_index) VALUES
('Développement Web', 'Sites vitrine, applications web complexes, e-commerce. Stack moderne React, Node.js, PostgreSQL.', 'Monitor', ARRAY['React', 'Node.js', 'SQL'], 1),
('Apps Mobiles', 'Applications iOS et Android avec React Native. Expérience utilisateur native et performante.', 'Smartphone', ARRAY['React Native', 'Expo', 'Firebase'], 2),
('Marketing Digital', 'Stratégie de contenu, gestion réseaux sociaux, campagnes publicitaires et analytics.', 'TrendingUp', ARRAY['SEO', 'Meta Ads', 'Analytics'], 3),
('Systèmes & Réseaux', 'Configuration, maintenance et sécurisation d''infrastructures réseau et serveurs.', 'Network', ARRAY['Linux', 'Cisco', 'Sécurité'], 4),
('UI/UX Design', 'Maquettes et prototypes Figma, design system cohérent, interfaces intuitives.', 'Palette', ARRAY['Figma', 'Design System', 'Prototypage'], 5),
('Stratégie Digitale', 'Audit digital, business model canvas, stratégie de croissance et KPIs.', 'BarChart3', ARRAY['Canvas', 'Growth', 'KPIs'], 6);


-- ══════════════════════════════════════════════════════════════
-- 5. TABLE : experiences
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.experiences (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type         TEXT DEFAULT 'work' CHECK (type IN ('work', 'education')),
  title        TEXT NOT NULL,
  company      TEXT NOT NULL,
  location     TEXT,
  start_date   TEXT,   -- format YYYY-MM
  end_date     TEXT,
  current      BOOLEAN DEFAULT FALSE,
  description  TEXT,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.experiences (type, title, company, location, start_date, end_date, current, description, tags) VALUES
('work', 'Développeur Full Stack Freelance', 'Indépendant', 'Brazzaville, Congo', '2022-01', NULL, TRUE,
 'Développement d''applications web et mobiles pour des clients locaux et internationaux.',
 ARRAY['React', 'Node.js', 'React Native', 'Supabase']),
('work', 'Chargé Marketing Digital', 'Entreprise XYZ', 'Brazzaville, Congo', '2021-06', '2022-12', FALSE,
 'Gestion des réseaux sociaux, campagnes publicitaires Meta & Google, analyse des KPIs.',
 ARRAY['Meta Ads', 'Google Ads', 'Analytics']),
('education', 'Formation Marketing Digital', 'Institut de Formation', 'En ligne', '2021-01', '2021-06', FALSE,
 'Formation certifiante en marketing digital, SEO, publicité en ligne et gestion de communauté.',
 ARRAY['SEO', 'Content Marketing', 'Social Media']),
('education', 'Développement Web & Mobile', 'École/Bootcamp', 'Brazzaville, Congo', '2020-01', '2021-06', FALSE,
 'Formation intensive fullstack et mobile. Projets pratiques en équipe, méthodologies agiles.',
 ARRAY['JavaScript', 'React', 'Node.js', 'React Native']),
('education', 'Systèmes & Réseaux Informatiques', 'Institut Technique', 'Brazzaville, Congo', '2018-09', '2020-06', FALSE,
 'Formation en administration des systèmes, configuration réseau, sécurité et maintenance.',
 ARRAY['Linux', 'Cisco', 'Windows Server']);


-- ══════════════════════════════════════════════════════════════
-- 6. TABLE : messages (formulaire de contact)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.messages (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ══════════════════════════════════════════════════════════════
-- 7. STORAGE BUCKET : portfolio (images projets)
-- ══════════════════════════════════════════════════════════════
-- À exécuter depuis Supabase > Storage > New Bucket
-- Ou via SQL :
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 8. ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════

-- Activer RLS sur toutes les tables
ALTER TABLE public.profile     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages    ENABLE ROW LEVEL SECURITY;


-- ── PROFILE ──────────────────────────────────────────────────
-- Tout le monde peut lire
CREATE POLICY "profile_public_read" ON public.profile
  FOR SELECT USING (TRUE);

-- Seulement les utilisateurs connectés (admin) peuvent modifier
CREATE POLICY "profile_auth_update" ON public.profile
  FOR UPDATE USING (auth.role() = 'authenticated');


-- ── PROJECTS ─────────────────────────────────────────────────
CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT USING (TRUE);

CREATE POLICY "projects_auth_insert" ON public.projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_auth_update" ON public.projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "projects_auth_delete" ON public.projects
  FOR DELETE USING (auth.role() = 'authenticated');


-- ── SKILLS ───────────────────────────────────────────────────
CREATE POLICY "skills_public_read" ON public.skills
  FOR SELECT USING (TRUE);

CREATE POLICY "skills_auth_insert" ON public.skills
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "skills_auth_update" ON public.skills
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "skills_auth_delete" ON public.skills
  FOR DELETE USING (auth.role() = 'authenticated');


-- ── SERVICES ─────────────────────────────────────────────────
CREATE POLICY "services_public_read" ON public.services
  FOR SELECT USING (TRUE);

CREATE POLICY "services_auth_insert" ON public.services
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "services_auth_update" ON public.services
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "services_auth_delete" ON public.services
  FOR DELETE USING (auth.role() = 'authenticated');


-- ── EXPERIENCES ───────────────────────────────────────────────
CREATE POLICY "experiences_public_read" ON public.experiences
  FOR SELECT USING (TRUE);

CREATE POLICY "experiences_auth_insert" ON public.experiences
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "experiences_auth_update" ON public.experiences
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "experiences_auth_delete" ON public.experiences
  FOR DELETE USING (auth.role() = 'authenticated');


-- ── MESSAGES ─────────────────────────────────────────────────
-- Tout le monde peut envoyer un message (INSERT)
CREATE POLICY "messages_public_insert" ON public.messages
  FOR INSERT WITH CHECK (TRUE);

-- Seulement l'admin peut lire et modifier
CREATE POLICY "messages_auth_read" ON public.messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "messages_auth_update" ON public.messages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "messages_auth_delete" ON public.messages
  FOR DELETE USING (auth.role() = 'authenticated');


-- ══════════════════════════════════════════════════════════════
-- 9. STORAGE POLICIES (images publiques en lecture)
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "portfolio_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "portfolio_images_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio' AND auth.role() = 'authenticated'
  );

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );


-- ══════════════════════════════════════════════════════════════
-- 10. TRIGGER : updated_at automatique
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profile_updated_at
  BEFORE UPDATE ON public.profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ══════════════════════════════════════════════════════════════
-- ✅ Script terminé. Votre base de données est prête !
-- ══════════════════════════════════════════════════════════════
