// ============================================================
// Supabase Edge Function : publish-social
// Déployer avec : npx supabase functions deploy publish-social
// ============================================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { publication_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer la publication
    const { data: pub, error } = await supabase
      .from('publications')
      .select('*')
      .eq('id', publication_id)
      .single()

    if (error || !pub) throw new Error('Publication introuvable')

    const results: Record<string, string> = {}
    const errors: string[] = []

    // ── Facebook ──────────────────────────────────────────────
    if (pub.networks.includes('facebook')) {
      try {
        const FB_PAGE_ID    = Deno.env.get('FB_PAGE_ID')!
        const FB_PAGE_TOKEN = Deno.env.get('FB_PAGE_ACCESS_TOKEN')!

        // Composer le message
        const message = [pub.title, pub.content].filter(Boolean).join('\n\n')

        let fbRes
        if (pub.image_url) {
          // Post avec photo
          fbRes = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: pub.image_url, caption: message, access_token: FB_PAGE_TOKEN }),
          })
        } else {
          // Post texte
          fbRes = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, access_token: FB_PAGE_TOKEN }),
          })
        }

        const fbData = await fbRes.json()
        if (fbData.error) throw new Error(fbData.error.message)
        results.facebook = fbData.id || 'ok'
      } catch (e) {
        errors.push(`Facebook: ${e.message}`)
        results.facebook = `error: ${e.message}`
      }
    }

    // ── LinkedIn ──────────────────────────────────────────────
    if (pub.networks.includes('linkedin')) {
      try {
        const LI_TOKEN   = Deno.env.get('LINKEDIN_ACCESS_TOKEN')!
        const LI_PERSON  = Deno.env.get('LINKEDIN_PERSON_URN')! // urn:li:person:XXXXXX

        const text = [pub.title, pub.content].filter(Boolean).join('\n\n')

        // Construire le body UGC post
        const body: any = {
          author: LI_PERSON,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text },
              shareMediaCategory: pub.image_url ? 'IMAGE' : 'NONE',
            }
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }

        // Si image : il faut d'abord l'uploader sur LinkedIn (simplifié ici avec URL)
        if (pub.image_url) {
          body.specificContent['com.linkedin.ugc.ShareContent'].media = [{
            status: 'READY',
            originalUrl: pub.image_url,
          }]
        }

        const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LI_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify(body),
        })

        const liData = await liRes.json()
        if (liData.message) throw new Error(liData.message)
        results.linkedin = liData.id || 'ok'
      } catch (e) {
        errors.push(`LinkedIn: ${e.message}`)
        results.linkedin = `error: ${e.message}`
      }
    }

    // Mettre à jour le statut
    const newStatus = errors.length === pub.networks.length
      ? 'failed'
      : errors.length > 0 ? 'failed' : 'published'

    await supabase
      .from('publications')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
        results,
      })
      .eq('id', publication_id)

    if (errors.length > 0) {
      return new Response(JSON.stringify({ success: false, errors, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 207,
      })
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
