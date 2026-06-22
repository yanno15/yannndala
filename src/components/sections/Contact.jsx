import { useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { sendMessage } from '../../lib/supabase'
import { Send, Mail, MapPin, Phone, Github, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'ndalayann5@gmail.com', href: 'mailto:ndalayann5@gmail.com' },
  { icon: MapPin, label: 'Localisation', value: 'Brazzaville, Congo', href: null },
  { icon: Phone, label: 'WhatsApp', value: '+242 055057513', href: 'https://wa.me/242055057513' },
]

const socials = [
  { icon: Github, href: 'https://github.com/yanno15/yanno15.github.io', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/yannndala', label: 'LinkedIn' },
]

export default function Contact() {
  const ref = useReveal()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    const { error } = await sendMessage({ ...form, read: false })
    setLoading(false)
    if (error) {
      toast.error("Erreur lors de l'envoi. Réessayez.")
    } else {
      toast.success('Message envoyé ! Je vous répondrai rapidement.')
      setForm({ name: '', email: '', subject: '', message: '' })
    }
  }

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-radial from-brand-600/8 via-transparent to-transparent" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <div ref={ref} className="reveal text-center mb-16">
          <span className="tag">// Contact</span>
          <h2 className="section-title text-white mt-4">
            Démarrons un{' '}
            <span className="bg-gradient-to-r from-brand-400 to-neon-purple bg-clip-text text-transparent">
              projet
            </span>
          </h2>
          <p className="text-subtle mt-4 max-w-xl mx-auto">
            Vous avez une idée, un projet ou juste envie d'échanger ? Je suis là.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-muted text-xs mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-light text-sm hover:text-brand-400 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-light text-sm">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-11 h-11 glass glow-border rounded-xl flex items-center justify-center text-muted hover:text-brand-400 hover:border-brand-500/40 transition-all duration-200"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            <div className="glass rounded-xl p-5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Disponible maintenant</span>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                Ouvert aux projets freelance, aux opportunités de collaboration et aux postes full-time.
              </p>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-3">
            <div className="glass glow-border rounded-2xl p-8">
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-muted text-xs mb-2 font-mono">Nom complet *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Votre nom"
                      className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60 focus:bg-brand-500/5 transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-muted text-xs mb-2 font-mono">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com"
                      className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60 focus:bg-brand-500/5 transition-all duration-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Sujet</label>
                  <input name="subject" value={form.subject} onChange={handleChange} placeholder="Objet du message"
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60 focus:bg-brand-500/5 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5}
                    placeholder="Décrivez votre projet ou votre demande..."
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60 focus:bg-brand-500/5 transition-all duration-200 resize-none" />
                </div>

                <button onClick={handleSubmit} disabled={loading}
                  className="w-full neon-btn text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Send size={16} /> Envoyer le message</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
