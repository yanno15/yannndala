import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getProjects, createProject, updateProject, deleteProject, uploadImage } from '../../lib/supabase'
import { Plus, Pencil, Trash2, X, Save, Upload, ExternalLink, FolderOpen, ImagePlus, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  title: '', slug: '', description: '', long_description: '',
  category: 'web', tags: '', image_url: '', screenshots: [],
  demo_url: '', github_url: '', featured: false, order_index: 0,
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false)

  const load = () => getProjects().then(({ data }) => setProjects(data || []))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  const openEdit = (p) => {
    setForm({ ...p, tags: (p.tags || []).join(', '), screenshots: p.screenshots || [] })
    setEditId(p.id)
    setModal(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  // Upload image de couverture
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const { url, error } = await uploadImage(file)
    setUploading(false)
    if (error) toast.error('Erreur upload image')
    else setForm((prev) => ({ ...prev, image_url: url }))
  }

  // Upload plusieurs captures d'écran
  const handleScreenshotsUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadingScreenshots(true)
    const uploads = await Promise.all(files.map((f) => uploadImage(f)))
    setUploadingScreenshots(false)
    const urls = uploads.filter((u) => !u.error).map((u) => u.url)
    if (urls.length < files.length) toast.error(`${files.length - urls.length} fichier(s) n'ont pas pu être uploadés`)
    if (urls.length > 0) {
      setForm((prev) => ({ ...prev, screenshots: [...(prev.screenshots || []), ...urls] }))
      toast.success(`${urls.length} capture(s) ajoutée(s)`)
    }
  }

  // Supprimer une capture
  const removeScreenshot = (index) => {
    setForm((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!form.title || !form.slug) return toast.error('Titre et slug requis.')
    setLoading(true)
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      screenshots: form.screenshots || [],
    }
    const { error } = editId
      ? await updateProject(editId, payload)
      : await createProject(payload)
    setLoading(false)
    if (error) toast.error('Erreur lors de la sauvegarde.')
    else {
      toast.success(editId ? 'Projet mis à jour !' : 'Projet créé !')
      setModal(false)
      load()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce projet ?')) return
    const { error } = await deleteProject(id)
    if (error) toast.error('Erreur suppression.')
    else { toast.success('Projet supprimé.'); load() }
  }

  const categoryBadge = {
    web: 'text-brand-400 bg-brand-400/10',
    mobile: 'text-cyan-400 bg-cyan-400/10',
    marketing: 'text-pink-400 bg-pink-400/10',
    network: 'text-blue-400 bg-blue-400/10',
  }

  return (
    <AdminLayout title="Projets">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted text-sm">{projects.length} projet(s)</p>
        <button onClick={openAdd} className="neon-btn text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Nouveau projet
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-muted font-mono text-xs">Titre</th>
              <th className="text-left px-5 py-3 text-muted font-mono text-xs hidden md:table-cell">Catégorie</th>
              <th className="text-left px-5 py-3 text-muted font-mono text-xs hidden lg:table-cell">Tags</th>
              <th className="text-left px-5 py-3 text-muted font-mono text-xs hidden lg:table-cell">Captures</th>
              <th className="text-left px-5 py-3 text-muted font-mono text-xs">Featured</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-white font-medium">{p.title}</p>
                    <p className="text-muted text-xs font-mono mt-0.5">{p.slug}</p>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className={`tag capitalize ${categoryBadge[p.category] || ''}`}>{p.category}</span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(p.tags || []).slice(0, 3).map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-xs text-muted font-mono">
                    {(p.screenshots || []).length} image{(p.screenshots || []).length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {p.featured
                    ? <span className="text-xs text-yellow-400">★ Oui</span>
                    : <span className="text-xs text-muted">Non</span>
                  }
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    {p.demo_url && (
                      <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-brand-400 transition-colors">
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button onClick={() => openEdit(p)} className="text-muted hover:text-brand-400 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-muted hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div className="py-16 text-center text-muted">
            <FolderOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucun projet. Créez-en un !</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 w-full max-w-2xl glass glow-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-white">
                {editId ? 'Modifier le projet' : 'Nouveau projet'}
              </h2>
              <button onClick={() => setModal(false)} className="text-muted hover:text-light">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Titre *" name="title" value={form.title} onChange={handleChange} />
                <Field label="Slug *" name="slug" value={form.slug} onChange={handleChange} placeholder="mon-projet" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Catégorie</label>
                  <select name="category" value={form.category} onChange={handleChange}
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-brand-500/60">
                    {['web', 'mobile', 'marketing', 'network'].map((c) => (
                      <option key={c} value={c} className="bg-panel">{c}</option>
                    ))}
                  </select>
                </div>
                <Field label="Tags (séparés par virgule)" name="tags" value={form.tags} onChange={handleChange} placeholder="React, Node.js" />
              </div>

              <Field label="Description courte" name="description" value={form.description} onChange={handleChange} textarea />
              <Field label="Description longue" name="long_description" value={form.long_description} onChange={handleChange} textarea rows={4} />

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="URL Demo" name="demo_url" value={form.demo_url} onChange={handleChange} />
                <Field label="URL GitHub" name="github_url" value={form.github_url} onChange={handleChange} />
              </div>

              {/* Image de couverture */}
              <div>
                <label className="block text-muted text-xs mb-2 font-mono">Image de couverture</label>
                <div className="flex gap-3">
                  <input type="text" name="image_url" value={form.image_url} onChange={handleChange}
                    placeholder="URL ou uploadez"
                    className="flex-1 bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60" />
                  <label className="glass glow-border cursor-pointer px-4 py-2.5 rounded-xl text-muted hover:text-brand-400 flex items-center gap-2 text-sm transition-all shrink-0">
                    {uploading
                      ? <span className="w-4 h-4 border border-brand-400 border-t-transparent rounded-full animate-spin" />
                      : <><Upload size={14} /> Upload</>
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                </div>
                {form.image_url && (
                  <img src={form.image_url} alt="cover" className="mt-2 h-24 rounded-xl object-cover w-full" />
                )}
              </div>

              {/* Captures d'écran */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-muted text-xs font-mono">
                    Captures d'écran ({(form.screenshots || []).length})
                  </label>
                  <label className="glass glow-border cursor-pointer px-3 py-1.5 rounded-lg text-muted hover:text-brand-400 flex items-center gap-2 text-xs transition-all">
                    {uploadingScreenshots
                      ? <span className="w-3 h-3 border border-brand-400 border-t-transparent rounded-full animate-spin" />
                      : <><ImagePlus size={13} /> Ajouter des captures</>
                    }
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshotsUpload} />
                  </label>
                </div>

                {/* Grille des captures */}
                {(form.screenshots || []).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {form.screenshots.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden aspect-video bg-white/5">
                        <img src={url} alt={`capture ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeScreenshot(i)}
                            className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <X size={13} className="text-white" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 right-1 text-white text-xs font-mono bg-black/60 px-1.5 py-0.5 rounded">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                    {/* Zone d'ajout rapide */}
                    <label className="aspect-video border border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group">
                      <ImagePlus size={18} className="text-muted group-hover:text-brand-400 transition-colors" />
                      <span className="text-muted text-xs mt-1 group-hover:text-brand-400 transition-colors">Ajouter</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshotsUpload} />
                    </label>
                  </div>
                ) : (
                  <label className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group">
                    <ImagePlus size={24} className="text-muted group-hover:text-brand-400 transition-colors mb-2" />
                    <p className="text-muted text-sm group-hover:text-brand-400 transition-colors">
                      Cliquez ou glissez vos captures ici
                    </p>
                    <p className="text-muted text-xs mt-1">PNG, JPG, WebP — plusieurs fichiers acceptés</p>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshotsUpload} />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange}
                  className="w-4 h-4 accent-brand-500" />
                <label htmlFor="featured" className="text-sm text-subtle">Projet mis en avant (featured)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 glass text-subtle py-3 rounded-xl hover:text-light transition-colors text-sm">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={loading} className="flex-1 neon-btn text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">
                  {loading
                    ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Save size={14} /> Sauvegarder</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function Field({ label, name, value, onChange, placeholder, textarea, rows = 3 }) {
  const cls = "w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60 focus:bg-brand-500/5 transition-all"
  return (
    <div>
      <label className="block text-muted text-xs mb-2 font-mono">{label}</label>
      {textarea
        ? <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={cls + ' resize-none'} />
        : <input name={name} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}
