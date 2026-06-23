import { useReveal } from '../../hooks/useReveal'
import { User, Layers, TrendingUp, Award } from 'lucide-react'
import yann from '../../assets/images/yann.webp'

const pillars = [
  {
    icon: Layers,
    title: 'Dev Full Stack',
    desc: 'Applications web et mobiles de bout en bout, de la conception à la mise en production.',
    color: 'from-brand-600 to-brand-400',
  },
  {
    icon: TrendingUp,
    title: 'Marketing Digital',
    desc: 'Stratégies digitales, réseaux sociaux, SEO/SEA et création de contenu qui convertissent.',
    color: 'from-neon-purple to-neon-pink',
  },
  {
    icon: Award,
    title: 'Systèmes & Réseaux',
    desc: 'Administration système, configuration réseau, sécurité et infrastructure IT.',
    color: 'from-neon-cyan to-brand-400',
  },
]

export default function About() {
  const ref = useReveal()

  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="reveal grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div className="space-y-6">
            <div>
              <span className="tag">// À propos</span>
              <h2 className="section-title text-white mt-4">
                Profil{' '}
                <span className="bg-gradient-to-r from-brand-400 to-neon-purple bg-clip-text text-transparent">
                  hybride
                </span>
                ,<br /> impact double
              </h2>
            </div>

            <p className="text-subtle text-lg leading-relaxed">
              Développeur Full Stack passionné avec une double expertise en développement
              web/mobile et en marketing digital. Je ne me contente pas de coder,
              je pense la stratégie derrière chaque produit que je construis.
            </p>

            <p className="text-subtle leading-relaxed">
              Formé en systèmes & réseaux, en développement web et en marketing digital,
              je suis capable de piloter un projet de A à Z : architecture technique,
              développement, déploiement, et visibilité en ligne.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { label: 'Localisation', value: 'Brazzaville, Congo' },
                { label: 'Disponibilité', value: 'Freelance / CDI' },
                { label: 'Langues', value: 'Français, Anglais' },
                { label: 'Expérience', value: '1+ ans' },
              ].map((item) => (
                <div key={item.label} className="glass rounded-xl p-4">
                  <p className="text-muted text-xs font-mono mb-1">{item.label}</p>
                  <p className="text-light text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — pillar cards */}
          <div className="flex flex-col gap-4">
            {pillars.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="glass glow-border rounded-2xl p-6 flex gap-4 group hover:border-brand-500/40 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-display font-semibold mb-1">{p.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              )
            })}

            {/* Avatar — ✅ FIX CLS : width/height explicites sur l'image */}
            <div className="glass rounded-2xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-neon-purple flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={yann}
                  alt="Yann NDALA"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover rounded-full"
                  fetchpriority="high"
                />
              </div>
              <div>
                <p className="text-white font-semibold">Yann NDALA</p>
                <p className="text-muted text-sm">Dev Full Stack & Marketing Digital</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs">Disponible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
