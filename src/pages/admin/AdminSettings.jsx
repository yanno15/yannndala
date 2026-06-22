import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabase'
import {
  Save, Facebook, Linkedin, Eye, EyeOff, CheckCircle2,
  AlertCircle, Settings, Key, TestTube, Info
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Helpers Supabase (table settings clé/valeur) ──────────────
const getSettings = async () => {
  const { data } = await supabase.from('settings').select('*')
  return (data || []).reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {})
}

const saveSetting = async (key, value) => {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
  return { error }
}

const saveAllSettings = async (obj) => {
  const rows = Object.entries(obj).map(([key, value]) => ({ key, value }))
  const { error } = await supabase
    .from('settings')
    .upsert(rows, { onConflict: 'key' })
  return { error }
}

// ── Champ avec toggle show/hide pour les tokens ───────────────
function SecretField({ label, name, value, onChange, placeholder, hint }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-muted text-xs mb-2 font-mono">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 pr-10 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60 focus:bg-brand-500/5 transition-all font-mono"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand-400 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {hint && <p className="text-muted text-xs mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

function TextField({ label, name, value, onChange, placeholder, hint }) {
  return (
    <div>
      <label className="block text-muted text-xs mb-2 font-mono">{label}</label>
      <input
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-light placeholder-muted text-sm focus:outline-none focus:border-brand-500/60 focus:bg-brand-500/5 transition-all font-mono"
      />
      {hint && <p className="text-muted text-xs mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

// ── Indicateur de statut config ───────────────────────────────
function StatusIndicator({ configured, label }) {
  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
      configured
        ? 'text-green-400 bg-green-400/10 border-green-400/20'
        : 'text-muted bg-white/5 border-border'
    }`}>
      {configured
        ? <CheckCircle2 size={12} />
        : <AlertCircle size={12} />
      }
      {configured ? `${label} configuré` : `${label} non configuré`}
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────
export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(null)

  const [fb, setFb] = useState({
    fb_page_id: '',
    fb_page_access_token: '',
  })

  const [li, setLi] = useState({
    linkedin_access_token: '',
    linkedin_person_urn: '',
  })

  // Charger les settings existants
  useEffect(() => {
    getSettings().then((s) => {
      setFb({
        fb_page_id: s.fb_page_id || '',
        fb_page_access_token: s.fb_page_access_token || '',
      })
      setLi({
        linkedin_access_token: s.linkedin_access_token || '',
        linkedin_person_urn: s.linkedin_person_urn || '',
      })
    })
  }, [])

  const handleFbChange = (e) =>
    setFb((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleLiChange = (e) =>
    setLi((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    setLoading(true)
    const all = { ...fb, ...li }
    const { error } = await saveAllSettings(all)
    setLoading(false)
    if (error) toast.error('Erreur lors de la sauvegarde.')
    else toast.success('Paramètres sauvegardés !')
  }

  // Test de connexion Facebook
  const testFacebook = async () => {
    if (!fb.fb_page_id || !fb.fb_page_access_token) {
      return toast.error('Remplissez d\'abord le Page ID et le Token Facebook.')
    }
    setTesting('facebook')
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${fb.fb_page_id}?fields=name,id&access_token=${fb.fb_page_access_token}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      toast.success(`✅ Facebook connecté ! Page : "${data.name}"`)
    } catch (e) {
      toast.error(`❌ Facebook : ${e.message}`)
    }
    setTesting(null)
  }

  // Test de connexion LinkedIn
  const testLinkedin = async () => {
    if (!li.linkedin_access_token) {
      return toast.error('Remplissez d\'abord le Token LinkedIn.')
    }
    setTesting('linkedin')
    try {
      const res = await fetch('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${li.linkedin_access_token}` },
      })
      const data = await res.json()
      if (data.message) throw new Error(data.message)
      const name = `${data.localizedFirstName || ''} ${data.localizedLastName || ''}`.trim()
      toast.success(`✅ LinkedIn connecté ! Profil : "${name}"`)
    } catch (e) {
      toast.error(`❌ LinkedIn : ${e.message}`)
    }
    setTesting(null)
  }

  const fbConfigured = !!(fb.fb_page_id && fb.fb_page_access_token)
  const liConfigured = !!(li.linkedin_access_token && li.linkedin_person_urn)

  return (
    <AdminLayout title="Paramètres">
      <div className="max-w-2xl space-y-6">

        {/* Statut global */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-display font-semibold mb-4 flex items-center gap-2">
            <Settings size={16} className="text-brand-400" />
            État des connexions
          </h3>
          <div className="flex flex-wrap gap-3">
            <StatusIndicator configured={fbConfigured} label="Facebook" />
            <StatusIndicator configured={liConfigured} label="LinkedIn" />
          </div>
        </div>

        {/* ── Facebook ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Facebook size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Facebook</h3>
              <p className="text-muted text-xs">Publication sur votre Page Facebook</p>
            </div>
          </div>

          {/* Info box */}
          <div className="flex gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 mb-5">
            <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-muted leading-relaxed">
              <p className="text-blue-400 font-medium mb-1">Comment obtenir ces informations ?</p>
              <p>1. Allez sur <span className="text-blue-400">developers.facebook.com</span></p>
              <p>2. Créez une app → ajoutez "Pages API"</p>
              <p>3. Dans l'explorateur API Graph, générez un token de Page</p>
              <p>4. Votre Page ID se trouve dans les infos de la Page</p>
            </div>
          </div>

          <div className="space-y-4">
            <TextField
              label="Page ID Facebook"
              name="fb_page_id"
              value={fb.fb_page_id}
              onChange={handleFbChange}
              placeholder="123456789012345"
              hint="L'identifiant numérique de votre Page Facebook"
            />
            <SecretField
              label="Page Access Token"
              name="fb_page_access_token"
              value={fb.fb_page_access_token}
              onChange={handleFbChange}
              placeholder="EAAxxxxxxxxxxxxxx..."
              hint="Token d'accès longue durée de votre Page (commence par EAA)"
            />
          </div>

          <button
            onClick={testFacebook}
            disabled={testing === 'facebook'}
            className="mt-4 flex items-center gap-2 glass border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {testing === 'facebook'
              ? <span className="w-4 h-4 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              : <TestTube size={14} />
            }
            Tester la connexion Facebook
          </button>
        </div>

        {/* ── LinkedIn ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center">
              <Linkedin size={16} className="text-sky-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">LinkedIn</h3>
              <p className="text-muted text-xs">Publication sur votre profil LinkedIn</p>
            </div>
          </div>

          {/* Info box */}
          <div className="flex gap-2 bg-sky-500/5 border border-sky-500/20 rounded-xl p-3 mb-5">
            <Info size={14} className="text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-muted leading-relaxed">
              <p className="text-sky-400 font-medium mb-1">Comment obtenir ces informations ?</p>
              <p>1. Allez sur <span className="text-sky-400">linkedin.com/developers</span></p>
              <p>2. Créez une app → activez "Share on LinkedIn"</p>
              <p>3. Générez un Access Token OAuth 2.0</p>
              <p>4. Votre Person URN : appelez /v2/me avec votre token → notez l'id</p>
              <p className="text-sky-400 mt-1">Format URN : urn:li:person:XXXXXXX</p>
            </div>
          </div>

          <div className="space-y-4">
            <SecretField
              label="Access Token LinkedIn"
              name="linkedin_access_token"
              value={li.linkedin_access_token}
              onChange={handleLiChange}
              placeholder="AQV..."
              hint="Token OAuth 2.0 avec permission w_member_social"
            />
            <TextField
              label="Person URN"
              name="linkedin_person_urn"
              value={li.linkedin_person_urn}
              onChange={handleLiChange}
              placeholder="urn:li:person:XXXXXXX"
              hint="Votre identifiant LinkedIn au format urn:li:person:XXXXXXX"
            />
          </div>

          <button
            onClick={testLinkedin}
            disabled={testing === 'linkedin'}
            className="mt-4 flex items-center gap-2 glass border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {testing === 'linkedin'
              ? <span className="w-4 h-4 border border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
              : <TestTube size={14} />
            }
            Tester la connexion LinkedIn
          </button>
        </div>

        {/* ── Clés Supabase Edge Function ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Key size={16} className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Edge Function Supabase</h3>
              <p className="text-muted text-xs">Ces valeurs doivent aussi être dans les Secrets Supabase</p>
            </div>
          </div>

          <div className="flex gap-2 bg-brand-500/5 border border-brand-500/20 rounded-xl p-3">
            <Info size={14} className="text-brand-400 shrink-0 mt-0.5" />
            <div className="text-xs text-muted leading-relaxed">
              <p className="text-brand-400 font-medium mb-1">En plus de sauvegarder ici, copiez ces valeurs dans :</p>
              <p>Supabase Dashboard → <span className="text-brand-400">Settings → Edge Functions → Secrets</span></p>
              <p className="mt-1">Noms des secrets :</p>
              <code className="block mt-1 text-brand-400">
                FB_PAGE_ID<br />
                FB_PAGE_ACCESS_TOKEN<br />
                LINKEDIN_ACCESS_TOKEN<br />
                LINKEDIN_PERSON_URN
              </code>
            </div>
          </div>
        </div>

        {/* Bouton sauvegarde */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full neon-btn text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Save size={16} /> Sauvegarder les paramètres</>
          }
        </button>
      </div>
    </AdminLayout>
  )
}
