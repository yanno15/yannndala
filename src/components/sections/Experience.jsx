import { useEffect, useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { getExperiences } from '../../lib/supabase'
import { Briefcase, GraduationCap, Calendar } from 'lucide-react'

const fallbackExperiences = [
  { id: 1, type: 'work', title: 'Développeur Full Stack Freelance', company: 'Indépendant', location: 'Brazzaville, Congo', start_date: '2022-01', end_date: null, current: true, description: "Développement d'applications web et mobiles pour des clients locaux et internationaux. Conception d'architectures techniques, intégration d'APIs, déploiement sur cloud.", tags: ['React', 'Node.js', 'React Native', 'Supabase'] },
  { id: 2, type: 'work', title: 'Chargé Marketing Digital', company: 'Entreprise XYZ', location: 'Brazzaville, Congo', start_date: '2021-06', end_date: '2022-12', current: false, description: 'Gestion des réseaux sociaux, création de campagnes publicitaires Meta & Google, analyse des KPIs et reporting hebdomadaire.', tags: ['Meta Ads', 'Google Ads', 'Analytics', 'Canva'] },
  { id: 3, type: 'education', title: 'Formation Marketing Digital', company: 'Institut de Formation', location: 'En ligne', start_date: '2021-01', end_date: '2021-06', current: false, description: 'Formation certifiante en marketing digital : stratégie de contenu, publicité en ligne, SEO et gestion de communauté.', tags: ['SEO', 'Content Marketing', 'Social Media'] },
  { id: 4, type: 'education', title: 'Développement Web & Mobile', company: 'École/Bootcamp', location: 'Brazzaville, Congo', start_date: '2020-01', end_date: '2021-06', current: false, description: 'Formation intensive en développement web fullstack et mobile. Projets pratiques en équipe, méthodologies agiles.', tags: ['JavaScript', 'React', 'Node.js', 'React Native'] },
  { id: 5, type: 'education', title: 'Systèmes & Réseaux Informatiques', company: 'Institut Technique', location: 'Brazzaville, Congo', start_date: '2018-09', end_date: '2020-06', current: false, description: "Formation en administration des systèmes d'exploitation, configuration réseau, sécurité informatique et maintenance.", tags: ['Linux', 'Cisco', 'Windows Server', 'Sécurité'] },
]

export default function Experience() {
  const ref = useReveal()
  const [experiences, setExperiences] = useState(fallbackExperiences)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    getExperiences().then(({ data }) => {
      if (data && data.length > 0) setExperiences(data)
    })
  }, [])

  const filtered = tab === 'all' ? experiences : experiences.filter((e) => e.type === tab)

  return (
    <section id="experience" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="reveal text-center mb-12">
          <span className="tag">// Parcours</span>
          <h2 className="section-title text-white mt-4">
            Mon{' '}
            <span className="bg-gradient-to-r from-brand-400 to-neon-purple bg-clip-text text-transparent">
              chemin
            </span>
          </h2>
          <p className="text-subtle mt-4 max-w-xl mx-auto">
            Expériences professionnelles et formations qui ont forgé mon expertise.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-12">
          {[
            { key: 'all', label: 'Tout' },
            { key: 'work', label: '💼 Expériences' },
            { key: 'education', label: '🎓 Formations' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                tab === t.key ? 'neon-btn text-white' : 'glass text-subtle hover:text-light border border-border'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          {/* Vertical line — orange */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500 via-brand-700/40 to-transparent" />

          <div className="space-y-8">
            {filtered.map((exp, i) => (
              <TimelineItem key={exp.id} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TimelineItem({ exp, index }) {
  const isWork = exp.type === 'work'
  const Icon = isWork ? Briefcase : GraduationCap
  const isLeft = index % 2 === 0

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className={`relative flex items-start gap-6 md:gap-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      <div className={`md:w-1/2 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-14 md:pl-0`}>
        <div className="glass glow-border rounded-2xl p-5 hover:border-brand-500/40 transition-all duration-300">
          <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
            <Calendar size={12} className="text-muted" />
            <span className="font-mono text-xs text-muted">
              {formatDate(exp.start_date)} — {exp.current ? 'Présent' : formatDate(exp.end_date)}
            </span>
            {exp.current && (
              <span className="flex items-center gap-1 text-xs text-green-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Actuel
              </span>
            )}
          </div>
          <h3 className="text-white font-display font-semibold">{exp.title}</h3>
          <p className="text-brand-400 text-sm font-medium mt-0.5">
            {exp.company} · {exp.location}
          </p>
          <p className="text-muted text-sm mt-3 leading-relaxed">{exp.description}</p>
          <div className={`flex flex-wrap gap-2 mt-3 ${isLeft ? 'md:justify-end' : ''}`}>
            {(exp.tags || []).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Dot on timeline */}
      <div className="absolute left-3 md:left-1/2 top-5 md:-translate-x-1/2 flex items-center justify-center">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
          isWork
            ? 'bg-brand-600/20 border-brand-500'
            : 'bg-neon-cyan/10 border-neon-cyan/60'
        }`}>
          <Icon size={14} className={isWork ? 'text-brand-400' : 'text-cyan-400'} />
        </div>
      </div>
    </div>
  )
}
