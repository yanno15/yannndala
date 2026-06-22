import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getMessages, markMessageRead } from '../../lib/supabase'
import { Mail, MailOpen, Calendar, User, AtSign, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)

  const load = () => getMessages().then(({ data }) => setMessages(data || []))
  useEffect(() => { load() }, [])

  const handleOpen = async (msg) => {
    setSelected(msg)
    if (!msg.read) {
      await markMessageRead(msg.id)
      load()
    }
  }

  const unread = messages.filter((m) => !m.read).length

  return (
    <AdminLayout title="Messages">
      <div className="mb-6 flex items-center gap-3">
        <p className="text-muted text-sm">{messages.length} message(s)</p>
        {unread > 0 && (
          <span className="text-xs bg-neon-pink/20 text-pink-400 border border-pink-400/20 px-2 py-0.5 rounded-full">
            {unread} non lu{unread > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {messages.length === 0 && (
            <div className="glass rounded-2xl py-16 text-center text-muted">
              <Mail size={32} className="mx-auto mb-3 opacity-30" />
              <p>Aucun message pour l'instant.</p>
            </div>
          )}
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleOpen(msg)}
              className={`w-full text-left glass rounded-xl p-4 transition-all duration-200 border ${
                selected?.id === msg.id
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : msg.read
                  ? 'border-border hover:border-border/80'
                  : 'border-violet-500/30 bg-violet-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {msg.read
                    ? <MailOpen size={14} className="text-muted shrink-0" />
                    : <Mail size={14} className="text-violet-400 shrink-0" />
                  }
                  <span className={`text-sm font-medium truncate ${msg.read ? 'text-subtle' : 'text-white'}`}>
                    {msg.name}
                  </span>
                </div>
                <span className="text-muted text-xs shrink-0">
                  {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-muted text-xs mt-1 truncate pl-5">{msg.subject || msg.message}</p>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="glass glow-border rounded-2xl p-6 h-full">
              <h3 className="font-display font-semibold text-white text-lg mb-4">
                {selected.subject || '(Sans sujet)'}
              </h3>
              <div className="space-y-2 mb-6">
                {[
                  { icon: User, label: 'De', value: selected.name },
                  { icon: AtSign, label: 'Email', value: selected.email, href: `mailto:${selected.email}` },
                  { icon: Calendar, label: 'Date', value: new Date(selected.created_at).toLocaleString('fr-FR') },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon size={13} className="text-muted shrink-0" />
                    <span className="text-muted">{label} :</span>
                    {href
                      ? <a href={href} className="text-violet-400 hover:text-violet-300 transition-colors">{value}</a>
                      : <span className="text-light">{value}</span>
                    }
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-5">
                <p className="text-subtle leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="mt-6">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Votre message'}`}
                  className="neon-btn text-white text-sm font-medium px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
                >
                  <Mail size={14} />
                  Répondre par email
                </a>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl h-64 flex items-center justify-center text-muted">
              <div className="text-center">
                <MailOpen size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sélectionnez un message</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
