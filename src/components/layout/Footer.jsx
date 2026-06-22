import { Github, Linkedin, Mail, Code2, ArrowUp } from 'lucide-react'
import logo from '../../assets/images/logo.png'

const socials = [
  { icon: Github, href: 'https://github.com/yanno15', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/yannndala', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:ndalayann5@gmail.com', label: 'Email' },
]

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative border-t border-border bg-void">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-neon-purple flex items-center justify-center">
              <Code2 size={14} className="text-white" />
            </div>
            <img src={logo} alt="logo" className=" h-6" />
          </div>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted hover:text-violet-400 hover:border-violet-500/40 transition-all duration-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* Back to top */}
          <button
            onClick={scrollTop}
            className="flex items-center gap-2 text-muted hover:text-violet-400 text-sm transition-colors"
          >
            <ArrowUp size={14} />
            Retour en haut
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-muted text-xs font-mono">
            © {new Date().getFullYear()} By Yann Ndala. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
