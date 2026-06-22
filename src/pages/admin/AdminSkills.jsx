import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getSkills, createSkill, updateSkill, deleteSkill } from '../../lib/supabase'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', level: 80, category: 'Frontend' }

const categories = ['Frontend', 'Backend', 'Mobile', 'Marketing', 'Systèmes & Réseaux', 'Outils']

export default function AdminSkills() {
  const [skills, setSkills] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => getSkills().then(({ data }) => setSkills(data || []))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (s) => { setForm(s); setEditId(s.id); setModal(true) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'level' ? Number(value) : value }))
  }

  const handleSave = async () => {
    if (!form.name) return toast.error('Nom requis.')
    setLoading(true)
    const { error } = editId
      ? await updateSkill(editId, form)
      : await createSkill(form)
    setLoading(false)
    if (error) toast.error('Erreur.')
    else { toast.success(editId ? 'Mis à jour !' : 'Créé !'); setModal(false); load() }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return
    const { error } = await deleteSkill(id)
    if (error) toast.error('Erreur.')
    else { toast.success('Supprimé.'); load() }
  }

  const grouped = skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <AdminLayout title="Compétences">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted text-sm">{skills.length} compétence(s)</p>
        <button onClick={openAdd} className="neon-btn text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Nouvelle compétence
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, catSkills]) => (
          <div key={cat} className="glass rounded-2xl p-5">
            <h3 className="text-white font-display font-semibold mb-4 flex items-center gap-2">
              <span className="tag">{cat}</span>
            </h3>
            <div className="space-y-3">
              {catSkills.map((s) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-light text-sm">{s.name}</span>
                      <span className="text-muted font-mono text-xs">{s.level}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(s)} className="text-muted hover:text-violet-400 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-muted hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 w-full max-w-md glass glow-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-white">
                {editId ? 'Modifier' : 'Nouvelle compétence'}
              </h2>
              <button onClick={() => setModal(false)} className="text-muted hover:text-light"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Nom *</label>
                <input name="name" value={form.name} onChange={handleChange}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60" />
              </div>
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Catégorie</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-violet-500/60">
                  {categories.map((c) => <option key={c} value={c} className="bg-panel">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">
                  Niveau : <span className="text-violet-400">{form.level}%</span>
                </label>
                <input type="range" name="level" min="0" max="100" value={form.level} onChange={handleChange}
                  className="w-full accent-violet-500" />
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
