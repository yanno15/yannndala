/**
 * useSEO — Hook pour injecter les balises meta SEO dynamiquement
 * Usage : useSEO({ title, description, image, url, type })
 */
export function useSEO({
  title = 'Yann NDALA — Développeur Full Stack & Marketing Digital',
  description = 'Yann NDALA, développeur Full Stack React/Node.js et expert Marketing Digital basé à Brazzaville, Congo. Disponible en freelance.',
  image = 'https://yannndala.vercel.app/og-image.jpg',
  url = 'https://yannndala.vercel.app/',
  type = 'website',
} = {}) {
  const siteName = 'Yann NDALA Portfolio'

  const setMeta = (selector, attr, value) => {
    let el = document.querySelector(selector)
    if (!el) {
      el = document.createElement('meta')
      const [attrName, attrVal] = attr.split('=').map((s) => s.replace(/['"]/g, ''))
      el.setAttribute(attrName, attrVal)
      document.head.appendChild(el)
    }
    el.setAttribute('content', value)
  }

  // Title
  document.title = title

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', url)

  // Primary meta
  setMeta('meta[name="description"]', 'name="description"', description)

  // Open Graph
  setMeta('meta[property="og:title"]',       'property="og:title"',       title)
  setMeta('meta[property="og:description"]', 'property="og:description"', description)
  setMeta('meta[property="og:image"]',       'property="og:image"',       image)
  setMeta('meta[property="og:url"]',         'property="og:url"',         url)
  setMeta('meta[property="og:type"]',        'property="og:type"',        type)
  setMeta('meta[property="og:site_name"]',   'property="og:site_name"',   siteName)

  // Twitter
  setMeta('meta[name="twitter:title"]',       'name="twitter:title"',       title)
  setMeta('meta[name="twitter:description"]', 'name="twitter:description"', description)
  setMeta('meta[name="twitter:image"]',       'name="twitter:image"',       image)
}
