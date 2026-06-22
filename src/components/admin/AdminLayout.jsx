import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/supabase'
import {
  LayoutDashboard, FolderOpen, Wrench, Briefcase, Star,
  MessageSquare, User, LogOut, Code2, Menu, X, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FolderOpen, label: 'Projets', href: '/admin/projets' },
  { icon: Star, label: 'Compétences', href: '/admin/competences' },
  { icon: Wrench, label: 'Services', href: '/admin/services' },
  { icon: Briefcase, label: 'Expériences', href: '/admin/experiences' },
  { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
  { icon: User, label: 'Mon profil', href: '/admin/profil' },
]

export default function AdminLayout({ children, title }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    toast.success('Déconnecté.')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-void flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-panel border-r border-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-neon-purple flex items-center justify-center">
              <Code2 size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-sm">
              dev<span className="text-violet-400">.</span>admin
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                    : 'text-muted hover:text-light hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
                {isActive && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
          <Link
            to="/"
            className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-violet-400 hover:bg-violet-500/5 transition-all duration-200"
          >
            <ChevronRight size={16} className="rotate-180" />
            Voir le portfolio
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-panel/50 backdrop-blur flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted hover:text-light">
            <Menu size={20} />
          </button>
          <h1 className="font-display font-semibold text-white">{title}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
