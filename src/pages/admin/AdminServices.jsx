import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getServices, createService, updateService, deleteService } from '../../lib/supabase'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const ICONS = ['Monitor', 'Smartphone', 'TrendingUp', 'Network', 'Palette', 'BarChart3', 'Code2', 'Globe', 'Shield', 'Zap']
const EMPTY = { title: '', description: '', icon: 'Monitor', tags: '', order_index: 0 }

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => getServices().then(({ data }) => setServices(data || []))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (s) => { setForm({ ...s, tags: (s.tags || []).join(', ') }); setEditId(s.id); setModal(true) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Titre requis.')
    setLoading(true)
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] }
    const { error } = editId ? await updateService(editId, payload) : await createService(payload)
    setLoading(false)
    if (error) toast.error('Erreur.')
    else { toast.success(editId ? 'Mis à jour !' : 'Créé !'); setModal(false); load() }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return
    const { error } = await deleteService(id)
    if (error) toast.error('Erreur.')
    else { toast.success('Supprimé.'); load() }
  }

  return (
    <AdminLayout title="Services">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted text-sm">{services.length} service(s)</p>
        <button onClick={openAdd} className="neon-btn text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Nouveau service
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="glass glow-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="tag font-mono">{s.icon}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="text-muted hover:text-violet-400 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(s.id)} className="text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">{s.title}</h3>
            <p className="text-muted text-sm leading-relaxed mb-3">{s.description}</p>
            <div className="flex flex-wrap gap-1">
              {(s.tags || []).map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 w-full max-w-lg glass glow-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-white">{editId ? 'Modifier' : 'Nouveau service'}</h2>
              <button onClick={() => setModal(false)} className="text-muted hover:text-light"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Titre *</label>
                <input name="title" value={form.title} onChange={handleChange}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60" />
              </div>
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Icône (lucide)</label>
                  <select name="icon" value={form.icon} onChange={handleChange}
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60">
                    {ICONS.map((i) => <option key={i} value={i} className="bg-panel">{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Ordre</label>
                  <input type="number" name="order_index" value={form.order_index} onChange={handleChange}
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60" />
                </div>
              </div>
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Tags (séparés par virgule)</label>
                <input name="tags" value={form.tags} onChange={handleChange} placeholder="React, Node.js"
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 glass text-subtle py-3 rounded-xl hover:text-light transition-colors text-sm">Annuler</button>
                <button onClick={handleSave} disabled={loading} className="flex-1 neon-btn text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">
                  {loading ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={14} /> Sauvegarder</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
