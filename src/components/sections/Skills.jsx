import { useEffect, useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { getSkills } from '../../lib/supabase'

const fallbackSkills = [
  { id: 1, name: 'React / Next.js', level: 90, category: 'Frontend' },
  { id: 2, name: 'JavaScript / TypeScript', level: 88, category: 'Frontend' },
  { id: 3, name: 'HTML5 / CSS3 / Tailwind', level: 92, category: 'Frontend' },
  { id: 4, name: 'Node.js / Express', level: 82, category: 'Backend' },
  { id: 5, name: 'PostgreSQL / Supabase', level: 78, category: 'Backend' },
  { id: 6, name: 'Firebase / MongoDB', level: 75, category: 'Backend' },
  { id: 7, name: 'React Native / Expo', level: 80, category: 'Mobile' },
  { id: 8, name: 'Flutter (notions)', level: 50, category: 'Mobile' },
  { id: 9, name: 'SEO / SEA', level: 80, category: 'Marketing' },
  { id: 10, name: 'Meta Ads / Google Ads', level: 75, category: 'Marketing' },
  { id: 11, name: 'Stratégie de contenu', level: 82, category: 'Marketing' },
  { id: 12, name: 'Business Model Canvas', level: 78, category: 'Marketing' },
  { id: 13, name: 'Administration Linux', level: 72, category: 'Systèmes & Réseaux' },
  { id: 14, name: 'Cisco / Networking', level: 68, category: 'Systèmes & Réseaux' },
  { id: 15, name: 'Git / GitHub', level: 88, category: 'Outils' },
  { id: 16, name: 'Docker / Vercel', level: 70, category: 'Outils' },
  { id: 17, name: 'Figma / Design', level: 72, category: 'Outils' },
]

// Toutes les barres en dégradé orange
const categoryColors = {
  Frontend:             'from-brand-600 to-brand-400',
  Backend:              'from-brand-700 to-brand-500',
  Mobile:               'from-neon-cyan to-brand-400',
  Marketing:            'from-neon-pink to-neon-purple',
  'Systèmes & Réseaux': 'from-brand-600 to-neon-cyan',
  Outils:               'from-brand-500 to-brand-400',
}

// Badges de catégorie tous en orange
const categoryBg = {
  Frontend:             'text-brand-400 bg-brand-400/10 border-brand-400/20',
  Backend:              'text-brand-400 bg-brand-500/10 border-brand-500/20',
  Mobile:               'text-brand-400 bg-brand-400/10 border-brand-400/20',
  Marketing:            'text-brand-400 bg-brand-400/10 border-brand-400/20',
  'Systèmes & Réseaux': 'text-brand-400 bg-brand-400/10 border-brand-400/20',
  Outils:               'text-brand-400 bg-brand-400/10 border-brand-400/20',
}

export default function Skills() {
  const ref = useReveal()
  const [skills, setSkills] = useState(fallbackSkills)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    getSkills().then(({ data }) => {
      if (data && data.length > 0) setSkills(data)
    })
  }, [])

  const categories = ['all', ...new Set(skills.map((s) => s.category))]
  const filtered = activeCategory === 'all' ? skills : skills.filter((s) => s.category === activeCategory)
  const grouped = filtered.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  return (
    <section id="skills" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-radial from-brand-600/8 via-transparent to-transparent" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <div ref={ref} className="reveal text-center mb-12">
          <span className="tag">// Compétences</span>
          <h2 className="section-title text-white mt-4">
            Mon{' '}
            <span className="bg-gradient-to-r from-brand-400 to-neon-purple bg-clip-text text-transparent">
              arsenal
            </span>{' '}
            tech
          </h2>
          <p className="text-subtle mt-4 max-w-xl mx-auto">
            Des compétences construites sur des projets réels, toujours en évolution.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                activeCategory === cat ? 'neon-btn text-white' : 'glass text-subtle hover:text-light border border-border'
              }`}
            >
              {cat === 'all' ? 'Toutes' : cat}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catSkills]) => (
            <div key={category} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className={`tag border ${categoryBg[category] || categoryBg.Outils}`}>
                  {category}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {catSkills.map((skill) => (
                  <SkillBar key={skill.id} skill={skill} color={categoryColors[skill.category]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillBar({ skill, color }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-light text-sm font-medium">{skill.name}</span>
        <span className="font-mono text-xs text-muted">{skill.level}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color || 'from-brand-600 to-brand-400'} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: animated ? `${skill.level}%` : '0%' }}
        />
      </div>
    </div>
  )
}
