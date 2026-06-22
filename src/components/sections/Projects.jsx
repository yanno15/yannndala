import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../../hooks/useReveal'
import { getProjects } from '../../lib/supabase'
import { ExternalLink, Github, Layers } from 'lucide-react'

const fallbackProjects = [
  { id: 1, slug: 'projet-ecommerce', title: 'Plateforme E-commerce', description: 'Application e-commerce complète avec gestion des stocks, paiements intégrés et dashboard vendeur.', image_url: null, category: 'web', tags: ['React', 'Node.js', 'Stripe', 'PostgreSQL'], demo_url: '#', github_url: '#', featured: true },
  { id: 2, slug: 'app-delivery', title: 'App Livraison Mobile', description: 'Application mobile de livraison avec tracking en temps réel, paiement mobile money et interface livreur.', image_url: null, category: 'mobile', tags: ['React Native', 'Firebase', 'Maps'], demo_url: '#', github_url: '#', featured: true },
  { id: 3, slug: 'dashboard-analytics', title: 'Dashboard Analytics', description: 'Tableau de bord analytique pour une campagne marketing multi-canal avec visualisations temps réel.', image_url: null, category: 'marketing', tags: ['React', 'Chart.js', 'API Marketing'], demo_url: '#', github_url: '#', featured: true },
  { id: 4, slug: 'gestion-ecole', title: 'Système de Gestion Scolaire', description: 'Plateforme de gestion complète pour établissements scolaires : élèves, notes, emplois du temps.', image_url: null, category: 'web', tags: ['Next.js', 'Supabase', 'Tailwind'], demo_url: '#', github_url: null, featured: false },
  { id: 5, slug: 'social-media-manager', title: 'Social Media Manager', description: 'Outil de planification et publication automatique de contenu sur les réseaux sociaux.', image_url: null, category: 'marketing', tags: ['Python', 'APIs Meta', 'Scheduler'], demo_url: '#', github_url: '#', featured: false },
  { id: 6, slug: 'reseau-entreprise', title: 'Infrastructure Réseau PME', description: "Conception et déploiement d'une infrastructure réseau sécurisée pour une PME de 50 postes.", image_url: null, category: 'network', tags: ['Cisco', 'VPN', 'Firewall'], demo_url: null, github_url: null, featured: false },
]

const categories = [
  { key: 'all', label: 'Tous' },
  { key: 'web', label: 'Web' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'network', label: 'Réseaux' },
]

export default function Projects() {
  const ref = useReveal()
  const [projects, setProjects] = useState(fallbackProjects)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getProjects().then(({ data }) => {
      if (data && data.length > 0) setProjects(data)
    })
  }, [])

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="reveal text-center mb-12">
          <span className="tag">// Projets</span>
          <h2 className="section-title text-white mt-4">
            Mes{' '}
            <span className="bg-gradient-to-r from-brand-400 to-neon-purple bg-clip-text text-transparent">
              réalisations
            </span>
          </h2>
          <p className="text-subtle mt-4 max-w-xl mx-auto">
            Une sélection de projets concrets illustrant mon expertise technique et créative.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === cat.key ? 'neon-btn text-white' : 'glass glow-border text-subtle hover:text-light'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {projects.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setFilter('all')}
              className="glass glow-border text-light font-medium px-8 py-3 rounded-xl hover:text-brand-400 transition-all duration-300"
            >
              Voir tous les projets ({projects.length})
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project }) {
  const gradients = [
    'from-brand-600/30 via-neon-purple/20 to-transparent',
    'from-neon-cyan/20 via-brand-600/20 to-transparent',
    'from-neon-pink/20 via-brand-600/20 to-transparent',
  ]
  const grad = gradients[project.id % 3]

  return (
    <div className="glass glow-border rounded-2xl overflow-hidden group hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className={`h-48 bg-gradient-to-br ${grad} relative overflow-hidden`}>
        {project.image_url ? (
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers size={40} className="text-brand-500/40" />
          </div>
        )}
        <span className="absolute top-3 left-3 tag capitalize">{project.category}</span>
        {project.featured && (
          <span className="absolute top-3 right-3 text-xs font-mono px-2 py-1 rounded bg-brand-600/80 text-white">
            ★ Featured
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-display font-semibold text-lg mb-2">{project.title}</h3>
        <p className="text-muted text-sm leading-relaxed flex-1">{project.description}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {(project.tags || []).slice(0, 4).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
          <Link to={`/projet/${project.slug}`} className="text-brand-400 hover:text-brand-400/80 text-sm font-medium flex items-center gap-1 transition-colors">
            Détails <ExternalLink size={12} />
          </Link>
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-light text-sm flex items-center gap-1 transition-colors">
              Demo <ExternalLink size={12} />
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-muted hover:text-light transition-colors">
              <Github size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
