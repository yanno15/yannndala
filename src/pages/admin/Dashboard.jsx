import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getProjects, getMessages, getSkills, getServices } from '../../lib/supabase'
import { FolderOpen, MessageSquare, Star, Wrench, Eye, TrendingUp, Send, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, messages: 0, skills: 0, services: 0, unread: 0 })

  useEffect(() => {
    Promise.all([
      getProjects(),
      getMessages(),
      getSkills(),
      getServices(),
    ]).then(([projects, messages, skills, services]) => {
      const unread = (messages.data || []).filter((m) => !m.read).length
      setStats({
        projects: (projects.data || []).length,
        messages: (messages.data || []).length,
        skills: (skills.data || []).length,
        services: (services.data || []).length,
        unread,
      })
    })
  }, [])

  const cards = [
    { icon: FolderOpen,   label: 'Projets',       value: stats.projects,  href: '/admin/projets',       color: 'from-violet-600 to-violet-400' },
    { icon: Star,         label: 'Compétences',   value: stats.skills,    href: '/admin/competences',   color: 'from-neon-purple to-violet-500' },
    { icon: Wrench,       label: 'Services',      value: stats.services,  href: '/admin/services',      color: 'from-neon-cyan to-violet-400' },
    { icon: MessageSquare,label: 'Messages',      value: stats.messages,  badge: stats.unread, href: '/admin/messages', color: 'from-neon-pink to-neon-purple' },
    { icon: Send,         label: 'Publications',  value: null,            href: '/admin/publications',  color: 'from-blue-500 to-cyan-400' },
    { icon: Settings2,    label: 'Paramètres',    value: null,            href: '/admin/parametres',    color: 'from-gray-500 to-gray-400' },
  ]

  const quickLinks = [
    { label: '+ Nouveau projet',       href: '/admin/projets' },
    { label: '+ Nouvelle compétence',  href: '/admin/competences' },
    { label: '+ Nouveau service',      href: '/admin/services' },
    { label: '+ Nouvelle publication', href: '/admin/publications' },
    { label: 'Paramètres',            href: '/admin/parametres' },
    { label: 'Voir le portfolio',      href: '/' },
  ]

  return (
    <AdminLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-xl font-display font-semibold text-white mb-1">
          Bonjour 👋
        </h2>
        <p className="text-muted text-sm">
          Bienvenue dans votre espace d'administration. Gérez votre portfolio depuis ici.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map(({ icon: Icon, label, value, badge, href, color }) => (
          <Link key={label} to={href}
            className="glass glow-border rounded-2xl p-5 hover:border-violet-500/40 transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon size={18} className="text-white" />
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display font-bold text-2xl text-white">
                {value !== null ? value : '—'}
              </span>
              {badge > 0 && (
                <span className="text-xs bg-neon-pink/20 text-pink-400 border border-pink-400/20 px-1.5 py-0.5 rounded-full mb-0.5">
                  {badge} non lu{badge > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-muted text-xs mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-display font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-400" />
            Actions rapides
          </h3>
          <div className="space-y-2">
            {quickLinks.map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="block px-4 py-2.5 rounded-xl text-sm text-subtle hover:text-violet-400 hover:bg-violet-500/5 border border-transparent hover:border-violet-500/20 transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-display font-semibold mb-4 flex items-center gap-2">
            <Eye size={16} className="text-violet-400" />
            Vue portfolio
          </h3>
          <p className="text-muted text-sm mb-4">
            Votre portfolio public est en ligne. Toutes les modifications ici sont visibles en temps réel.
          </p>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-2 neon-btn text-white text-sm font-medium px-5 py-2.5 rounded-xl"
          >
            <Eye size={14} />
            Voir le portfolio
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}
