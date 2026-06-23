import { useEffect, useState, useRef, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase, uploadImage } from '../../lib/supabase'
import {
  Plus, Trash2, Send, Clock, Image, X, Eye, EyeOff,
  Facebook, Linkedin, Calendar, CheckCircle2, AlertCircle,
  FileText, Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Link, Quote, Minus, RotateCcw, Edit3
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Helpers Supabase ──────────────────────────────────────────
const getPublications = () =>
  supabase.from('publications').select('*').order('created_at', { ascending: false })

const savePublication = (data) =>
  supabase.from('publications').insert([data]).select().single()

const updatePublication = (id, data) =>
  supabase.from('publications').update(data).eq('id', id).select().single()

const deletePublication = (id) =>
  supabase.from('publications').delete().eq('id', id)

// ── Publier via Edge Function Supabase ────────────────────────
const publishNow = async (pubId) => {
  const { data, error } = await supabase.functions.invoke('publish-social', {
    body: { publication_id: pubId },
  })
  return { data, error }
}

// ── Helper pour optimiser l'URL Supabase à la volée ───────────
const optimizeSupabaseUrl = (url, width = 600, height = 400) => {
  if (!url) return ''
  // Si l'image provient bien de votre stockage Supabase, on lui injecte les paramètres
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    return `${url}?width=${width}&height=${height}&resize=contain&format=webp`
  }
  return url
}

// ── Statut badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    draft:     { label: 'Brouillon', cls: 'text-muted bg-white/5 border-white/10' },
    scheduled: { label: 'Programmé',  cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
    published: { label: 'Publié',     cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
    failed:    { label: 'Échec',      cls: 'text-red-400 bg-red-400/10 border-red-400/20' },
  }
  const s = map[status] || map.draft
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  )
}

// ── Éditeur riche (toolbar + contentEditable) ─────────────────
function RichEditor({ value, onChange }) {
  const editorRef = useRef(null)

  // Sync initial value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [])

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    onChange(editorRef.current?.innerHTML || '')
  }, [onChange])

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || '')
  }

  const tools = [
    { icon: Bold,         cmd: 'bold',            title: 'Gras (Ctrl+B)' },
    { icon: Italic,       cmd: 'italic',          title: 'Italique (Ctrl+I)' },
    { sep: true },
    { icon: Heading2,     cmd: 'formatBlock',     val: 'h2', title: 'Titre H2' },
    { icon: Heading3,     cmd: 'formatBlock',     val: 'h3', title: 'Titre H3' },
    { icon: FileText,     cmd: 'formatBlock',     val: 'p',  title: 'Paragraphe' },
    { sep: true },
    { icon: List,         cmd: 'insertUnorderedList',   title: 'Liste à puces' },
    { icon: ListOrdered,  cmd: 'insertOrderedList',     title: 'Liste numérotée' },
    { icon: Quote,        cmd: 'formatBlock',     val: 'blockquote', title: 'Citation' },
    { sep: true },
    { icon: Minus,        cmd: 'insertHorizontalRule',  title: 'Séparateur' },
    { icon: RotateCcw,    cmd: 'undo',            title: 'Annuler' },
  ]

  return (
    <div className="glass rounded-xl overflow-hidden border border-border focus-within:border-brand-500/60 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-white/2">
        {tools.map((t, i) =>
          t.sep ? (
            <div key={i} className="w-px h-5 bg-border mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              title={t.title}
              onClick={() => exec(t.cmd, t.val)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-brand-400 hover:bg-brand-500/10 transition-all"
            >
              <t.icon size={14} />
            </button>
          )
        )}
      </div>

      {/* Editable zone */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[200px] px-4 py-3 text-light text-sm leading-relaxed focus:outline-none
          [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-2 [&>h2]:mt-3
          [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-white [&>h3]:mb-1 [&>h3]:mt-2
          [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-2
          [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-2
          [&>blockquote]:border-l-2 [&>blockquote]:border-brand-500 [&>blockquote]:pl-3 [&>blockquote]:text-muted [&>blockquote]:italic
          [&>hr]:border-border [&>hr]:my-3"
        data-placeholder="Rédigez votre publication ici..."
        style={{ caretColor: '#d4622e' }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

// ── Aperçu réseau ─────────────────────────────────────────────
function Preview({ title, contentHtml, imageUrl, network }) {
  const isFB = network === 'facebook'
  return (
    <div className={`rounded-2xl overflow-hidden border text-sm ${isFB ? 'border-blue-500/30 bg-blue-950/20' : 'border-sky-500/30 bg-sky-950/20'}`}>
      {/* Header simulé */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isFB ? 'bg-blue-600' : 'bg-sky-600'}`}>
          {isFB ? <Facebook size={16} className="text-white" /> : <Linkedin size={16} className="text-white" />}
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Votre Page</p>
          <p className="text-muted text-xs">{isFB ? 'Facebook' : 'LinkedIn'} · À l'instant</p>
        </div>
      </div>
      {/* Contenu */}
      <div className="px-4 pb-3">
        {title && <p className="text-white font-semibold mb-1">{title}</p>}
        {contentHtml && (
          <div className="text-subtle text-xs leading-relaxed line-clamp-4"
            dangerouslySetInnerHTML={{ __html: contentHtml }} />
        )}
      </div>
      {imageUrl && (
        <img 
          src={optimizeSupabaseUrl(imageUrl, 600, 400)} 
          alt="visuel" 
          width="600"
          height="400"
          className="w-full max-h-48 object-cover" 
          loading="lazy"
        />
      )}
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────
export default function AdminPublications() {
  const [publications, setPublications] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [tab, setTab] = useState('all')

  const [form, setForm] = useState({
    title: '',
    content: '',
    content_html: '',
    image_url: '',
    networks: ['facebook', 'linkedin'],
    status: 'draft',
    scheduled_at: '',
  })

  const load = async () => {
    const { data } = await getPublications()
    setPublications(data || [])
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm({ title: '', content: '', content_html: '', image_url: '', networks: ['facebook', 'linkedin'], status: 'draft', scheduled_at: '' })
    setEditId(null)
    setShowPreview(false)
    setModal(true)
  }

  const openEdit = (pub) => {
    setForm({
      title: pub.title || '',
      content: pub.content || '',
      content_html: pub.content_html || '',
      image_url: pub.image_url || '',
      networks: pub.networks || [],
      status: pub.status,
      scheduled_at: pub.scheduled_at ? pub.scheduled_at.slice(0, 16) : '',
    })
    setEditId(pub.id)
    setShowPreview(false)
    setModal(true)
  }

  const toggleNetwork = (n) => {
    setForm((prev) => ({
      ...prev,
      networks: prev.networks.includes(n)
        ? prev.networks.filter((x) => x !== n)
        : [...prev.networks, n],
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const { url, error } = await uploadImage(file)
    setUploading(false)
    if (error) toast.error('Erreur upload image')
    else setForm((prev) => ({ ...prev, image_url: url }))
  }

  // Extraire le texte brut du HTML pour Supabase `content`
  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || ''
  }

  const handleSave = async (statusOverride) => {
    if (!form.content_html && !form.content) {
      return toast.error('Le contenu est requis.')
    }
    if (form.networks.length === 0) {
      return toast.error('Sélectionnez au moins un réseau.')
    }
    setLoading(true)

    const status = statusOverride || (form.scheduled_at ? 'scheduled' : 'draft')
    const payload = {
      title: form.title || null,
      content: stripHtml(form.content_html) || form.content,
      content_html: form.content_html,
      image_url: form.image_url || null,
      networks: form.networks,
      status,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
    }

    const { error } = editId
      ? await updatePublication(editId, payload)
      : await savePublication(payload)

    setLoading(false)
    if (error) return toast.error('Erreur lors de la sauvegarde.')
    toast.success(status === 'draft' ? 'Brouillon sauvegardé !' : status === 'scheduled' ? 'Publication programmée !' : 'Publication enregistrée.')
    setModal(false)
    load()
  }

  const handlePublishNow = async (pub) => {
    if (!window.confirm(`Publier "${pub.title || 'cette publication'}" maintenant sur ${pub.networks.join(', ')} ?`)) return
    setPublishing(pub.id)
    const { data, error } = await publishNow(pub.id)
    setPublishing(null)

    if (error) {
      toast.error(`❌ ${error.message || 'Impossible de contacter la fonction. Redéployez-la.'}`, { duration: 6000 })
    } else if (data?.errors?.length > 0) {
      data.errors.forEach((e) => toast.error(`❌ ${e}`, { duration: 8000 }))
    } else {
      toast.success('✅ Publié avec succès !')
    }
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette publication ?')) return
    await deletePublication(id)
    toast.success('Supprimé.')
    load()
  }

  const filtered = tab === 'all' ? publications : publications.filter((p) => p.status === tab)

  const formatDate = (d) => d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <AdminLayout title="Publications Sociales">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'draft', label: 'Brouillons' },
            { key: 'scheduled', label: 'Programmées' },
            { key: 'published', label: 'Publiées' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.key ? 'neon-btn text-white' : 'glass text-subtle hover:text-light border border-border'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={openNew} className="neon-btn text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Nouvelle publication
        </button>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-20 text-center text-muted">
          <Edit3 size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Aucune publication pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pub) => (
            <div key={pub.id} className="glass glow-border rounded-2xl p-5 flex gap-4 group hover:border-brand-500/30 transition-all">
              {/* Visuel miniature optimisé (150x150) */}
              {pub.image_url ? (
                <img 
                  src={optimizeSupabaseUrl(pub.image_url, 150, 150)} 
                  alt="" 
                  width="64"
                  height="64"
                  className="w-16 h-16 rounded-xl object-cover shrink-0" 
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-brand-400/50" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {pub.title && <p className="text-white font-semibold text-sm truncate">{pub.title}</p>}
                    <p className="text-muted text-xs leading-relaxed mt-0.5 line-clamp-2">
                      {pub.content}
                    </p>
                  </div>
                  <StatusBadge status={pub.status} />
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {/* Réseaux */}
                  <div className="flex gap-1.5">
                    {(pub.networks || []).includes('facebook') && (
                      <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                        <Facebook size={10} /> Facebook
                      </span>
                    )}
                    {(pub.networks || []).includes('linkedin') && (
                      <span className="flex items-center gap-1 text-xs text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-full">
                        <Linkedin size={10} /> LinkedIn
                      </span>
                    )}
                  </div>

                  {pub.scheduled_at && pub.status === 'scheduled' && (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Clock size={11} /> {formatDate(pub.scheduled_at)}
                    </span>
                  )}
                  {pub.published_at && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle2 size={11} /> {formatDate(pub.published_at)}
                    </span>
                  )}
                  {pub.status === 'failed' && (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle size={11} /> Échec publication
                    </span>
                  )}

                  {/* Actions */}
                  <div className="ml-auto flex gap-2">
                    {['draft', 'failed', 'scheduled'].includes(pub.status) && (
                      <button
                        onClick={() => handlePublishNow(pub)}
                        disabled={publishing === pub.id}
                        className="neon-btn text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {publishing === pub.id
                          ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          : <Send size={11} />
                        }
                        Publier
                      </button>
                    )}
                    <button onClick={() => openEdit(pub)}
                      className="glass text-muted hover:text-brand-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 border border-border transition-all">
                      <Edit3 size={11} /> Modifier
                    </button>
                    <button onClick={() => handleDelete(pub.id)}
                      className="text-muted hover:text-red-400 p-1.5 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal création/édition ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 w-full max-w-3xl glass glow-border rounded-2xl max-h-[95vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-white">
                {editId ? 'Modifier la publication' : 'Nouvelle publication'}
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-brand-400 glass px-3 py-1.5 rounded-lg border border-border transition-all">
                  {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                  Aperçu
                </button>
                <button onClick={() => setModal(false)} className="text-muted hover:text-light">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={`p-6 grid gap-6 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
              {/* Formulaire */}
              <div className="space-y-5">
                {/* Titre (optionnel) */}
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Titre (optionnel)</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Titre de la publication..."
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                  />
                </div>

                {/* Contenu riche */}
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Contenu *</label>
                  <RichEditor
                    value={form.content_html}
                    onChange={(html) => setForm((p) => ({ ...p, content_html: html }))}
                  />
                </div>

                {/* Image (optionnelle) */}
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">Visuel (optionnel)</label>
                  {form.image_url ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={optimizeSupabaseUrl(form.image_url, 600, 400)} 
                        alt="" 
                        width="600"
                        height="400"
                        className="w-full max-h-48 object-cover" 
                      />
                      <button
                        onClick={() => setForm((p) => ({ ...p, image_url: '' }))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className="border border-dashed border-border rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group">
                      {uploading
                        ? <span className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                        : <Image size={22} className="text-muted group-hover:text-brand-400 transition-colors" />
                      }
                      <span className="text-muted text-xs group-hover:text-brand-400 transition-colors">
                        {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter un visuel'}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>

                {/* Réseaux */}
                <div>
                  <label className="block text-muted text-xs mb-3 font-mono">Réseaux de publication</label>
                  <div className="flex gap-3">
                    {[
                      { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'blue' },
                      { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'sky' },
                    ].map(({ key, label, icon: Icon, color }) => {
                      const active = form.networks.includes(key)
                      return (
                        <button key={key} onClick={() => toggleNetwork(key)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            active
                              ? color === 'blue'
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'bg-sky-600/20 border-sky-500/50 text-sky-400'
                              : 'glass border-border text-muted hover:text-light'
                          }`}>
                          <Icon size={16} />
                          {label}
                          {active && <CheckCircle2 size={13} />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Programmation */}
                <div>
                  <label className="block text-muted text-xs mb-2 font-mono">
                    <Clock size={11} className="inline mr-1" />
                    Programmer la publication (optionnel)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light text-sm focus:outline-none focus:border-brand-500/60 transition-all [color-scheme:dark]"
                  />
                  {form.scheduled_at && (
                    <p className="text-yellow-400 text-xs mt-1.5 flex items-center gap-1">
                      <Clock size={11} />
                      Sera publié le {new Date(form.scheduled_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={loading}
                    className="flex-1 glass text-subtle py-3 rounded-xl text-sm hover:text-light border border-border transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={14} /> Brouillon
                  </button>

                  {form.scheduled_at ? (
                    <button
                      onClick={() => handleSave('scheduled')}
                      disabled={loading}
                      className="flex-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-yellow-500/30 transition-all disabled:opacity-50"
                    >
                      {loading
                        ? <span className="w-4 h-4 border border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                        : <><Clock size={14} /> Programmer</>
                      }
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        if (!form.content_html && !form.content) {
                          return toast.error('Le contenu est requis.')
                        }
                        if (form.networks.length === 0) {
                          return toast.error('Sélectionnez au moins un réseau.')
                        }
                        setLoading(true)
                        const payload = {
                          title: form.title || null,
                          content: form.content_html?.replace(/<[^>]*>/g, '') || form.content,
                          content_html: form.content_html,
                          image_url: form.image_url || null,
                          networks: form.networks,
                          status: 'draft',
                          scheduled_at: null,
                        }
                        const { data: saved, error: saveErr } = editId
                          ? await updatePublication(editId, payload)
                          : await savePublication(payload)
                        setLoading(false)
                        if (saveErr) return toast.error('Erreur sauvegarde.')
                        setModal(false)
                        await load()
                        
                        const pubId = saved?.id ?? editId
                        if (pubId) {
                          setPublishing(pubId)
                          const { data: res, error: pubErr } = await publishNow(pubId)
                          setPublishing(null)
                          if (pubErr) {
                            toast.error(`❌ ${pubErr.message || 'Fonction non joignable. Redéployez-la.'}`, { duration: 6000 })
                          } else if (res?.errors?.length > 0) {
                            res.errors.forEach((e) => toast.error(`❌ ${e}`, { duration: 8000 }))
                          } else {
                            toast.success('✅ Publié avec succès !')
                          }
                          load()
                        }
                      }}
                      disabled={loading}
                      className="flex-1 neon-btn text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading
                        ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Send size={14} /> Publier maintenant</>
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* Aperçu */}
              {showPreview && (
                <div className="space-y-4">
                  <p className="text-muted text-xs font-mono">Aperçu de rendu</p>
                  {form.networks.includes('facebook') && (
                    <Preview title={form.title} contentHtml={form.content_html} imageUrl={form.image_url} network="facebook" />
                  )}
                  {form.networks.includes('linkedin') && (
                    <Preview title={form.title} contentHtml={form.content_html} imageUrl={form.image_url} network="linkedin" />
                  )}
                  {form.networks.length === 0 && (
                    <p className="text-muted text-xs text-center py-8">Sélectionnez un réseau pour voir l'aperçu</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}