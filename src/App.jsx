import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'

// Pages publiques
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import Login from './pages/Login'

// Pages admin
import Dashboard from './pages/admin/Dashboard'
import AdminProjects from './pages/admin/AdminProjects'
import AdminSkills from './pages/admin/AdminSkills'
import AdminServices from './pages/admin/AdminServices'
import AdminExperiences from './pages/admin/AdminExperiences'
import AdminMessages from './pages/admin/AdminMessages'
import AdminProfile from './pages/admin/AdminProfile'
import AdminSettings from './pages/admin/AdminSettings'
import AdminPublications from './pages/admin/AdminPublications'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-void">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/admin/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projet/:slug" element={<ProjectDetail />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/projets" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
      <Route path="/admin/competences" element={<ProtectedRoute><AdminSkills /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
      <Route path="/admin/experiences" element={<ProtectedRoute><AdminExperiences /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
      <Route path="/admin/profil" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
      <Route path="/admin/parametres" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/publications" element={<ProtectedRoute><AdminPublications /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#13131f',
              color: '#e5e7eb',
              border: '1px solid rgba(155,73,34,0.3)',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#9B4922', secondary: '#080810' } },
            error: { iconTheme: { primary: '#ff2d78', secondary: '#080810' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
