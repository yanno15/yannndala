import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Upload image vers LinkedIn (obligatoire pour les posts avec image) ──
async function uploadImageToLinkedIn(imageUrl: string, liToken: string, liPerson: string): Promise<string> {
  // ÉTAPE 1 : Enregistrer l'upload
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${liToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: liPerson,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  })

  const registerData = await registerRes.json()
  if (!registerRes.ok) throw new Error(`LinkedIn registerUpload: ${JSON.stringify(registerData)}`)

  const uploadUrl = registerData?.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl
  const assetUrn  = registerData?.value?.asset

  if (!uploadUrl || !assetUrn) throw new Error('LinkedIn: uploadUrl ou assetUrn manquant')

  // ÉTAPE 2 : Télécharger l'image depuis Supabase
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`Impossible de télécharger l'image: ${imageUrl}`)
  const imgBuffer = await imgRes.arrayBuffer()

  // ÉTAPE 3 : Uploader le binaire vers LinkedIn
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${liToken}` },
    body: imgBuffer,
  })
  if (!uploadRes.ok) throw new Error(`LinkedIn upload binaire échoué: ${uploadRes.status}`)

  return assetUrn
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
                     ?? Deno.env.get('SUPABASE_SECRET_KEYS')
                     ?? ''

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'SUPABASE_URL ou clé service manquante' }),
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

    // 2. Clés API
    const { data: settingsRows } = await supabase.from('settings').select('key, value')
    const s: Record<string, string> = {}
    for (const row of (settingsRows ?? [])) s[row.key] = row.value

    const FB_PAGE_ID    = Deno.env.get('FB_PAGE_ID')            ?? s['fb_page_id']            ?? ''
    const FB_PAGE_TOKEN = Deno.env.get('FB_PAGE_ACCESS_TOKEN')  ?? s['fb_page_access_token']  ?? ''
    const LI_TOKEN      = Deno.env.get('LINKEDIN_ACCESS_TOKEN') ?? s['linkedin_access_token'] ?? ''
    const LI_PERSON     = Deno.env.get('LINKEDIN_PERSON_URN')   ?? s['linkedin_person_urn']   ?? ''

    const results: Record<string, string> = {}
    const errors: string[] = []

    // ── 3. FACEBOOK ───────────────────────────────────────────────────────
    if (pub.networks.includes('facebook')) {
      if (!FB_PAGE_ID || !FB_PAGE_TOKEN) {
        const msg = 'Page ID ou Token Facebook manquant'
        errors.push(msg); results.facebook = `error: ${msg}`
      } else {
        try {
          const message = [pub.title, pub.content].filter(Boolean).join('\n\n')

          // ✅ FIX FACEBOOK : utiliser /feed avec link_url pour les images
          // (évite l'erreur "Cannot call API on behalf of user")
          let fbRes: Response

          if (pub.image_url) {
            // Poster via /photos avec l'URL de l'image
            fbRes = await fetch(
              `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: pub.image_url,
                  caption: message,
                  access_token: FB_PAGE_TOKEN,
                  published: true,
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
          if (fbData.error) throw new Error(`FB ${fbData.error.code}: ${fbData.error.message}`)
          results.facebook = fbData.id ?? 'ok'

        } catch (e: any) {
          errors.push(`Facebook: ${e.message}`)
          results.facebook = `error: ${e.message}`
        }
      }
    }

    // ── 4. LINKEDIN ───────────────────────────────────────────────────────
    if (pub.networks.includes('linkedin')) {
      if (!LI_TOKEN || !LI_PERSON) {
        const msg = 'Token ou Person URN LinkedIn manquant'
        errors.push(msg); results.linkedin = `error: ${msg}`
      } else {
        try {
          const text = [pub.title, pub.content].filter(Boolean).join('\n\n')

          const shareContent: any = {
            shareCommentary: { text },
            shareMediaCategory: pub.image_url ? 'IMAGE' : 'NONE',
          }

          // ✅ FIX LINKEDIN : upload l'image via l'API pour obtenir un URN
          if (pub.image_url) {
            const assetUrn = await uploadImageToLinkedIn(pub.image_url, LI_TOKEN, LI_PERSON)
            shareContent.media = [{
              status: 'READY',
              media: assetUrn,  // ← URN obligatoire, pas une URL directe
            }]
          }

          const liBody = {
            author: LI_PERSON,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': shareContent,
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
          }

          const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LI_TOKEN}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify(liBody),
          })

          const liData = await liRes.json()
          if (!liRes.ok) throw new Error(liData.message ?? JSON.stringify(liData))
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