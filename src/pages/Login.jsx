import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../lib/supabase'
import { Code2, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(form.email, form.password)
    setLoading(false)
    if (error) {
      toast.error('Email ou mot de passe incorrect.')
    } else {
      toast.success('Bienvenue dans le dashboard !')
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6">
      {/* BG orbs */}
      <div className="orb w-96 h-96 bg-violet-600 -top-20 -left-20" />
      <div className="orb w-64 h-64 bg-neon-purple bottom-20 right-10" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-neon-purple mb-4 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
            <Code2 size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Accès Admin</h1>
          <p className="text-muted text-sm mt-1">Connectez-vous à votre tableau de bord</p>
        </div>

        <div className="glass glow-border rounded-2xl p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-muted text-xs mb-2 font-mono">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@portfolio.com"
                  className="w-full bg-white/5 border border-border rounded-xl pl-10 pr-4 py-3 text-light placeholder-muted text-sm focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted text-xs mb-2 font-mono">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-border rounded-xl pl-10 pr-10 py-3 text-light placeholder-muted text-sm focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-light transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full neon-btn text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Se connecter'
              }
            </button>
          </div>
        </div>

        <p className="text-center text-muted text-xs mt-6">
          Accès réservé à l'administrateur du portfolio.
        </p>
      </div>
    </div>
  )
}
