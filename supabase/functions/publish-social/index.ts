import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { publication_id } = body

    if (!publication_id) {
      return new Response(
        JSON.stringify({ error: 'publication_id manquant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Connexion Supabase — essaie les deux clés possibles
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
                     ?? Deno.env.get('SUPABASE_SECRET_KEYS')
                     ?? ''

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'SUPABASE_URL ou clé service manquante dans les secrets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // 1. Récupérer la publication
    const { data: pub, error: pubError } = await supabase
      .from('publications')
      .select('*')
      .eq('id', publication_id)
      .single()

    if (pubError || !pub) {
      return new Response(
        JSON.stringify({ error: `Publication introuvable : ${pubError?.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 2. Clés API — secrets Supabase EN PRIORITÉ, fallback table settings
    const { data: settingsRows } = await supabase
      .from('settings')
      .select('key, value')

    const s: Record<string, string> = {}
    for (const row of (settingsRows ?? [])) s[row.key] = row.value

    const FB_PAGE_ID    = Deno.env.get('FB_PAGE_ID')            ?? s['fb_page_id']            ?? ''
    const FB_PAGE_TOKEN = Deno.env.get('FB_PAGE_ACCESS_TOKEN')  ?? s['fb_page_access_token']  ?? ''
    const LI_TOKEN      = Deno.env.get('LINKEDIN_ACCESS_TOKEN') ?? s['linkedin_access_token'] ?? ''
    const LI_PERSON     = Deno.env.get('LINKEDIN_PERSON_URN')   ?? s['linkedin_person_urn']   ?? ''

    const results: Record<string, string> = {}
    const errors: string[] = []

    // 3. Facebook
    if (pub.networks.includes('facebook')) {
      if (!FB_PAGE_ID || !FB_PAGE_TOKEN) {
        const msg = 'Page ID ou Token Facebook manquant dans les secrets'
        errors.push(msg)
        results.facebook = `error: ${msg}`
      } else {
        try {
          const message = [pub.title, pub.content].filter(Boolean).join('\n\n')

          let fbRes: Response
          if (pub.image_url) {
            fbRes = await fetch(
              `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: pub.image_url,
                  caption: message,
                  access_token: FB_PAGE_TOKEN,
                }),
              }
            )
          } else {
            fbRes = await fetch(
              `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message,
                  access_token: FB_PAGE_TOKEN,
                }),
              }
            )
          }

          const fbData = await fbRes.json()
          if (fbData.error) throw new Error(`${fbData.error.code} — ${fbData.error.message}`)
          results.facebook = fbData.id ?? 'ok'

        } catch (e: any) {
          errors.push(`Facebook: ${e.message}`)
          results.facebook = `error: ${e.message}`
        }
      }
    }

    // 4. LinkedIn
    if (pub.networks.includes('linkedin')) {
      if (!LI_TOKEN || !LI_PERSON) {
        const msg = 'Token ou Person URN LinkedIn manquant dans les secrets'
        errors.push(msg)
        results.linkedin = `error: ${msg}`
      } else {
        try {
          const text = [pub.title, pub.content].filter(Boolean).join('\n\n')

          const liBody: any = {
            author: LI_PERSON,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text },
                shareMediaCategory: pub.image_url ? 'IMAGE' : 'NONE',
              },
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
          }

          if (pub.image_url) {
            liBody.specificContent['com.linkedin.ugc.ShareContent'].media = [{
              status: 'READY',
              originalUrl: pub.image_url,
            }]
          }

          const liRes  = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LI_TOKEN}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify(liBody),
          })

          const liData = await liRes.json()
          if (liData.message || liData.status >= 400) {
            throw new Error(liData.message ?? JSON.stringify(liData))
          }
          results.linkedin = liData.id ?? 'ok'

        } catch (e: any) {
          errors.push(`LinkedIn: ${e.message}`)
          results.linkedin = `error: ${e.message}`
        }
      }
    }

    // 5. Statut final
    const newStatus = errors.length > 0 ? 'failed' : 'published'

    await supabase
      .from('publications')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
        results,
      })
      .eq('id', publication_id)

    // Retourner le détail des erreurs pour affichage dans le dashboard
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, errors, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 207 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? 'Erreur inconnue' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
