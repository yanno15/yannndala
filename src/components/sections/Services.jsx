import { useEffect, useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { getServices } from '../../lib/supabase'
import { Monitor, Smartphone, TrendingUp, Network, Palette, BarChart3 } from 'lucide-react'

const iconMap = { Monitor, Smartphone, TrendingUp, Network, Palette, BarChart3 }

const fallbackServices = [
  { id: 1, icon: 'Monitor', title: 'Développement Web', description: 'Sites vitrine, applications web complexes, e-commerce. Stack moderne React, Node.js, PostgreSQL.', tags: ['React', 'Node.js', 'SQL'] },
  { id: 2, icon: 'Smartphone', title: 'Apps Mobiles', description: 'Applications iOS et Android avec React Native. Expérience utilisateur native et performante.', tags: ['React Native', 'Expo', 'Firebase'] },
  { id: 3, icon: 'TrendingUp', title: 'Marketing Digital', description: 'Stratégie de contenu, gestion réseaux sociaux, campagnes publicitaires et analytics.', tags: ['SEO', 'Meta Ads', 'Analytics'] },
  { id: 4, icon: 'Network', title: 'Systèmes & Réseaux', description: "Configuration, maintenance et sécurisation d'infrastructures réseau et serveurs.", tags: ['Linux', 'Cisco', 'Sécurité'] },
  { id: 5, icon: 'Palette', title: 'UI/UX Design', description: 'Maquettes et prototypes Figma, design system cohérent, interfaces intuitives.', tags: ['Figma', 'Design System', 'Prototypage'] },
  { id: 6, icon: 'BarChart3', title: 'Stratégie Digitale', description: 'Audit digital, business model canvas, stratégie de croissance et KPIs.', tags: ['Canvas', 'Growth', 'KPIs'] },
]

export default function Services() {
  const ref = useReveal()
  const [services, setServices] = useState(fallbackServices)

  useEffect(() => {
    getServices().then(({ data }) => {
      if (data && data.length > 0) setServices(data)
    })
  }, [])

  return (
    <section id="services" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-radial from-brand-600/8 via-transparent to-transparent" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div ref={ref} className="reveal text-center mb-16">
          <span className="tag">// Services</span>
          <h2 className="section-title text-white mt-4">
            Ce que je{' '}
            <span className="bg-gradient-to-r from-brand-400 to-neon-purple bg-clip-text text-transparent">
              propose
            </span>
          </h2>
          <p className="text-subtle mt-4 max-w-2xl mx-auto">
            Une gamme complète de services tech et marketing pour donner vie à vos projets
            et accélérer votre présence digitale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] || Monitor
            return (
              <div
                key={service.id}
                className="glass glow-border rounded-2xl p-6 group hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/30 to-neon-purple/20 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(155,73,34,0.4)] transition-all duration-300">
                  <Icon size={22} className="text-brand-400" />
                </div>
                <h3 className="text-white font-display font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-muted text-sm leading-relaxed mb-4">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {(service.tags || []).map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
