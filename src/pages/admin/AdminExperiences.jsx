import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../../lib/supabase'
import { Plus, Pencil, Trash2, X, Save, Briefcase, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  type: 'work', title: '', company: '', location: '',
  start_date: '', end_date: '', current: false, description: '', tags: '',
}

export default function AdminExperiences() {
  const [exps, setExps] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => getExperiences().then(({ data }) => setExps(data || []))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (e) => { setForm({ ...e, tags: (e.tags || []).join(', ') }); setEditId(e.id); setModal(true) }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async () => {
    if (!form.title || !form.company) return toast.error('Titre et entreprise requis.')
    setLoading(true)
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] }
    const { error } = editId ? await updateExperience(editId, payload) : await createExperience(payload)
    setLoading(false)
    if (error) toast.error('Erreur.')
    else { toast.success(editId ? 'Mis à jour !' : 'Créé !'); setModal(false); load() }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return
    const { error } = await deleteExperience(id)
    if (error) toast.error('Erreur.')
    else { toast.success('Supprimé.'); load() }
  }

  return (
    <AdminLayout title="Expériences & Formations">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted text-sm">{exps.length} entrée(s)</p>
        <button onClick={openAdd} className="neon-btn text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Nouvelle entrée
        </button>
      </div>

      <div className="space-y-4">
        {exps.map((e) => (
          <div key={e.id} className="glass glow-border rounded-2xl p-5 flex gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              e.type === 'work' ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-cyan-500/10 border border-cyan-500/20'
            }`}>
              {e.type === 'work'
                ? <Briefcase size={16} className="text-violet-400" />
                : <GraduationCap size={16} className="text-cyan-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold">{e.title}</h3>
                  <p className="text-violet-400 text-sm">{e.company} · {e.location}</p>
                  <p className="text-muted text-xs font-mono mt-1">
                    {e.start_date} → {e.current ? 'Présent' : (e.end_date || '?')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(e)} className="text-muted hover:text-violet-400 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(e.id)} className="text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              {e.description && <p className="text-muted text-sm mt-2 leading-relaxed">{e.description}</p>}
              <div className="flex flex-wrap gap-1 mt-3">
                {(e.tags || []).map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 w-full max-w-lg glass glow-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-white">{editId ? 'Modifier' : 'Nouvelle entrée'}</h2>
              <button onClick={() => setModal(false)} className="text-muted hover:text-light"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Type</label>
                <div className="flex gap-3">
                  {[{ v: 'work', l: '💼 Expérience' }, { v: 'education', l: '🎓 Formation' }].map(({ v, l }) => (
                    <button key={v} onClick={() => setForm((p) => ({ ...p, type: v }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${form.type === v ? 'neon-btn text-white' : 'glass text-subtle border border-border hover:text-light'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { label: 'Titre *', name: 'title' },
                { label: 'Entreprise/École *', name: 'company' },
                { label: 'Lieu', name: 'location' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-muted text-xs mb-2 font-mono">{f.label}</label>
                  <input name={f.name} value={form[f.name]} onChange={handleChange}
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Date début (YYYY-MM)</label>
                  <input name="start_date" value={form.start_date} onChange={handleChange} placeholder="2023-01"
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60" />
                </div>
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Date fin</label>
                  <input name="end_date" value={form.end_date} onChange={handleChange} placeholder="2024-06" disabled={form.current}
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60 disabled:opacity-40" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="current" name="current" checked={form.current} onChange={handleChange} className="w-4 h-4 accent-violet-500" />
                <label htmlFor="current" className="text-sm text-subtle">Poste actuel</label>
              </div>
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60 resize-none" />
              </div>
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Tags (séparés par virgule)</label>
                <input name="tags" value={form.tags} onChange={handleChange}
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
