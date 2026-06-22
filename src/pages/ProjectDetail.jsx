import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject } from '../lib/supabase'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useSEO } from '../hooks/useSEO'
import { ArrowLeft, ExternalLink, Github, Calendar, Layers, ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function ProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    getProject(slug).then(({ data }) => {
      setProject(data)
      setLoading(false)
    })
  }, [slug])

  // ── SEO dynamique par projet ──
  useSEO(
    project
      ? {
          title: `${project.title} — Yann NDALA | Développeur Full Stack Brazzaville`,
          description: project.description
            ? `${project.description.slice(0, 155)}…`
            : `Projet ${project.title} réalisé par Yann NDALA, développeur Full Stack à Brazzaville, Congo.`,
          image: project.image_url || 'https://yannndala.vercel.app/og-image.jpg',
          url: `https://yannndala.vercel.app/projet/${slug}`,
          type: 'article',
        }
      : {}
  )

  // Navigation lightbox
  const screenshots = project?.screenshots || []
  const prevImg = () => setLightbox((i) => (i - 1 + screenshots.length) % screenshots.length)
  const nextImg = () => setLightbox((i) => (i + 1) % screenshots.length)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft' && lightbox !== null) prevImg()
      if (e.key === 'ArrowRight' && lightbox !== null) nextImg()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, screenshots.length])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-void">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!project) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">404</p>
        <p className="text-muted mb-6">Projet introuvable</p>
        <Link to="/" className="neon-btn text-white px-6 py-3 rounded-xl">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-void text-light">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">

        <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-brand-400 transition-colors mb-8">
          <ArrowLeft size={16} />
          Retour aux projets
        </Link>

        {/* Image de couverture */}
        <div className="h-72 rounded-2xl bg-gradient-to-br from-brand-600/30 via-neon-purple/20 to-transparent glass mb-8 flex items-center justify-center overflow-hidden">
          {project.image_url ? (
            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <Layers size={60} className="text-brand-500/40" />
          )}
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="tag capitalize">{project.category}</span>
              {project.featured && (
                <span className="tag bg-brand-600/20 text-brand-400">★ Featured</span>
              )}
            </div>
            <h1 className="section-title text-white text-3xl md:text-4xl">{project.title}</h1>
          </div>
          <div className="flex gap-3">
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                className="neon-btn text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium">
                <ExternalLink size={14} /> Demo live
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                className="glass glow-border text-light px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium hover:text-brand-400 transition-all">
                <Github size={14} /> Code source
              </a>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(project.tags || []).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        {/* Description */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-white font-display font-semibold text-lg mb-4">À propos du projet</h2>
          <div className="text-subtle leading-relaxed whitespace-pre-wrap">
            {project.long_description || project.description}
          </div>
        </div>

        {/* Galerie captures d'écran */}
        {screenshots.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-display font-semibold text-lg mb-4 flex items-center gap-2">
              Captures d'écran
              <span className="tag font-mono">{screenshots.length}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {screenshots.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(i)}
                  className="group relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-border hover:border-brand-500/50 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <img
                    src={url}
                    alt={`${project.title} — capture ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-brand-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">
                      Agrandir
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date */}
        {project.created_at && (
          <div className="flex items-center gap-2 text-muted text-sm">
            <Calendar size={14} />
            <span>Publié le {new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
      </main>
      <Footer />

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={screenshots[lightbox]}
              alt={`capture ${lightbox + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-mono px-3 py-1 rounded-full">
              {lightbox + 1} / {screenshots.length}
            </div>
            <button onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors">
              <X size={16} />
            </button>
            {screenshots.length > 1 && (
              <button onClick={prevImg}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-brand-600/80 flex items-center justify-center text-white transition-all">
                <ChevronLeft size={20} />
              </button>
            )}
            {screenshots.length > 1 && (
              <button onClick={nextImg}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-brand-600/80 flex items-center justify-center text-white transition-all">
                <ChevronRight size={20} />
              </button>
            )}
            {screenshots.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {screenshots.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(i)}
                    className={`w-14 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                      i === lightbox ? 'border-brand-400 scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                    }`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
