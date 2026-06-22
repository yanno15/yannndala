import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getProfile, updateProfile, uploadImage } from '../../lib/supabase'
import { Save, Upload, User } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  full_name: '', title: '', bio: '', email: '', phone: '', location: '',
  github_url: '', linkedin_url: '', twitter_url: '', avatar_url: '', cv_url: '',
  available: true,
}

export default function AdminProfile() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getProfile().then(({ data }) => {
      if (data) setForm({ ...EMPTY, ...data })
    })
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const { url, error } = await uploadImage(file, 'avatars')
    setUploading(false)
    if (error) toast.error('Erreur upload avatar')
    else setForm((prev) => ({ ...prev, avatar_url: url }))
  }

  const handleSave = async () => {
    setLoading(true)
    const { error } = await updateProfile(form)
    setLoading(false)
    if (error) toast.error('Erreur lors de la sauvegarde.')
    else toast.success('Profil mis à jour !')
  }

  return (
    <AdminLayout title="Mon Profil">
      <div className="max-w-2xl space-y-6">

        {/* Avatar */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Photo de profil</h3>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-neon-purple flex items-center justify-center overflow-hidden shrink-0">
              {form.avatar_url
                ? <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                : <User size={30} className="text-white" />
              }
            </div>
            <label className="glass glow-border cursor-pointer px-5 py-2.5 rounded-xl text-sm text-subtle hover:text-violet-400 flex items-center gap-2 transition-all">
              {uploading
                ? <span className="w-4 h-4 border border-violet-400 border-t-transparent rounded-full animate-spin" />
                : <><Upload size={14} /> Changer la photo</>
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
        </div>

        {/* Infos principales */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Informations principales</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom complet" name="full_name" value={form.full_name} onChange={handleChange} />
              <Field label="Titre / Poste" name="title" value={form.title} onChange={handleChange} placeholder="Dev Full Stack & Marketing" />
            </div>
            <div>
              <label className="block text-muted text-xs mb-2 font-mono">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60 resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" name="email" value={form.email} onChange={handleChange} />
              <Field label="Téléphone / WhatsApp" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <Field label="Localisation" name="location" value={form.location} onChange={handleChange} placeholder="Brazzaville, Congo" />
          </div>
        </div>

        {/* Réseaux & liens */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Réseaux & liens</h3>
          <div className="space-y-4">
            <Field label="GitHub URL" name="github_url" value={form.github_url} onChange={handleChange} placeholder="https://github.com/..." />
            <Field label="LinkedIn URL" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            <Field label="Twitter/X URL" name="twitter_url" value={form.twitter_url} onChange={handleChange} placeholder="https://twitter.com/..." />
            <Field label="Lien CV (PDF)" name="cv_url" value={form.cv_url} onChange={handleChange} placeholder="https://..." />
          </div>
        </div>

        {/* Disponibilité */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Disponibilité</h3>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="available" name="available" checked={form.available} onChange={handleChange}
              className="w-5 h-5 accent-violet-500" />
            <label htmlFor="available" className="text-subtle text-sm">
              Je suis disponible pour de nouveaux projets
            </label>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={loading}
          className="w-full neon-btn text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
          {loading
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Save size={16} /> Sauvegarder le profil</>
          }
        </button>
      </div>
    </AdminLayout>
  )
}

function Field({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-muted text-xs mb-2 font-mono">{label}</label>
      <input name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light placeholder-muted text-sm focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all" />
    </div>
  )
}
