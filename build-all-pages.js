#!/usr/bin/env node
/**
 * Build all pages from JSON content to static HTML
 * Generates full site structure for GitHub Pages deployment
 */

const fs = require('fs')
const path = require('path')

const CONTENT_DIR = path.join(__dirname, 'content')
const PAGES_DIR = path.join(CONTENT_DIR, 'pages')
const DIST_DIR = path.join(__dirname, 'dist')
const SITE_JSON_PATH = path.join(CONTENT_DIR, 'site.json')

// Load site.json as single source of truth
const siteConfig = JSON.parse(fs.readFileSync(SITE_JSON_PATH, 'utf-8'))
const theme = siteConfig.theme || {}

// ============================================================================
// HELPERS
// ============================================================================

function getLocalized(value, locale = 'en') {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    return value[locale] || value.en || Object.values(value)[0] || ''
  }
  return ''
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// ============================================================================
// SECTION RENDERERS
// ============================================================================

// Theme from site.json (Single Point of Truth)
const BT = {
  // Primary brand color (teal from Black Tomato)
  brand: theme.semanticColors?.brand || theme.colors?.accent || '#0d9488',
  brandHover: theme.colors?.primary?.['700'] || '#0f766e',
  // Core colors
  background: theme.semanticColors?.background || '#ffffff',
  backgroundAlt: theme.semanticColors?.backgroundAlt || '#fafaf9',
  surface: theme.semanticColors?.surface || '#ffffff',
  foreground: theme.semanticColors?.foreground || '#0a1628',
  foregroundMuted: theme.semanticColors?.foregroundMuted || '#64748b',
  border: theme.semanticColors?.border || '#e5e7eb',
  // Semantic mappings
  navy: theme.semanticColors?.foreground || '#0a1628',
  cream: theme.semanticColors?.backgroundAlt || '#fafaf9',
  white: '#ffffff',
  gray: theme.semanticColors?.foregroundMuted || '#64748b',
  grayLight: theme.colors?.secondary?.['400'] || '#94a3b8',
  // Typography
  fontSerif: theme.fonts?.display || "'Cormorant Garamond', Georgia, serif",
  fontSans: theme.fonts?.sans || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  // Gradients & overlays
  heroGradient: theme.gradients?.hero || 'linear-gradient(180deg,rgba(10,22,40,0.6) 0%,rgba(10,22,40,0.4) 100%)',
  cardGradient: theme.gradients?.card || 'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(10,22,40,0.7) 100%)',
}

function renderHeroSection(content) {
  const title = getLocalized(content.title)
  const subtitle = getLocalized(content.subtitle)
  const eyebrow = getLocalized(content.eyebrow)
  const buttons = content.buttons || []
  const image = content.image

  return `
  <section class="hero-section" style="position:relative;padding:6rem 1.5rem;background:${BT.navy};overflow:hidden;min-height:60vh;display:flex;align-items:center">
    ${image ? `<div style="position:absolute;inset:0;background-image:url('${image}');background-size:cover;background-position:center;opacity:0.5"></div>` : ''}
    <div style="position:absolute;inset:0;background:${BT.heroGradient}"></div>
    <div style="position:relative;max-width:56rem;margin:0 auto;text-align:center;width:100%">
      ${eyebrow ? `<p style="color:${BT.brand};font-weight:500;margin-bottom:1rem;text-transform:uppercase;letter-spacing:0.1em;font-size:0.875rem">${esc(eyebrow)}</p>` : ''}
      <h1 style="font-size:3rem;font-weight:600;color:${BT.white};margin-bottom:1.5rem;line-height:1.2;font-family:${BT.fontSerif}">${esc(title)}</h1>
      ${subtitle ? `<p style="font-size:1.25rem;color:rgba(255,255,255,0.85);margin-bottom:2rem;max-width:42rem;margin-left:auto;margin-right:auto;line-height:1.75">${esc(subtitle)}</p>` : ''}
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:1rem">
        ${buttons.map(btn => `<a href="${btn.url?.en || btn.url || '#'}" style="display:inline-block;${btn.variant === 'secondary' ? `background:transparent;color:${BT.white};border:2px solid ${BT.white}` : `background:${BT.brand};color:${BT.white}`};padding:0.75rem 2rem;border-radius:0.25rem;text-decoration:none;font-weight:600;transition:all 0.2s">${esc(getLocalized(btn.text))}</a>`).join('')}
      </div>
    </div>
  </section>`
}

function renderStatsSection(content) {
  const title = getLocalized(content.title)
  const stats = content.stats || []

  return `
  <section class="stats-section" style="padding:4rem 1.5rem;background:${BT.cream}">
    <div style="max-width:72rem;margin:0 auto">
      ${title ? `<h2 style="font-size:2rem;font-weight:600;color:${BT.navy};margin-bottom:3rem;text-align:center;font-family:${BT.fontSerif}">${esc(title)}</h2>` : ''}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2rem">
        ${stats.map(stat => `
          <div style="text-align:center">
            <div style="font-size:2.5rem;font-weight:600;color:${BT.brand};margin-bottom:0.5rem;font-family:${BT.fontSerif}">${esc(stat.number || stat.value || '')}</div>
            <div style="color:${BT.navy};font-weight:500">${esc(stat.label || '')}</div>
            ${stat.description ? `<div style="color:${BT.gray};font-size:0.875rem;margin-top:0.25rem">${esc(stat.description)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>`
}

function renderFeatureSection(content) {
  const title = getLocalized(content.title)
  const subtitle = getLocalized(content.subtitle)
  const features = content.features || []

  return `
  <section class="feature-section" style="padding:4rem 1.5rem;background:${BT.background}">
    <div style="max-width:72rem;margin:0 auto">
      ${title ? `<h2 style="font-size:2rem;font-weight:600;color:${BT.navy};margin-bottom:1rem;text-align:center;font-family:${BT.fontSerif}">${esc(title)}</h2>` : ''}
      ${subtitle ? `<p style="color:${BT.gray};text-align:center;margin-bottom:3rem;max-width:42rem;margin-left:auto;margin-right:auto">${esc(subtitle)}</p>` : ''}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem">
        ${features.map(f => `
          <div style="background:${BT.cream};padding:1.5rem;border-radius:0.5rem;border:1px solid ${BT.border}">
            ${f.icon ? `<div style="font-size:2rem;margin-bottom:1rem;color:${BT.brand}">${f.icon}</div>` : ''}
            <h3 style="font-size:1.125rem;font-weight:600;color:${BT.navy};margin-bottom:0.5rem">${esc(getLocalized(f.title))}</h3>
            <p style="color:${BT.gray};font-size:0.9375rem;line-height:1.6">${esc(getLocalized(f.description))}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`
}

// Helper to render structured content items (paragraphs, subheadings, callouts, lists)
function renderContentItems(items) {
  if (!items) return ''
  if (typeof items === 'string') {
    return items.split('\n\n').map(p =>
      `<p style="margin-bottom:1rem">${p.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${BT.navy}">$1</strong>`)}</p>`
    ).join('')
  }
  if (!Array.isArray(items)) return ''

  return items.map(item => {
    if (typeof item === 'string') {
      return `<p style="margin-bottom:1rem">${item.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${BT.navy}">$1</strong>`)}</p>`
    }

    const type = item.type || 'paragraph'
    const text = getLocalized(item.text) || ''

    switch (type) {
      case 'subheading':
        return `<h3 style="font-size:1.25rem;font-weight:600;color:${BT.navy};margin:1.5rem 0 0.75rem">${esc(text)}</h3>`
      case 'callout':
        return `<div style="background:${BT.cream};border-left:4px solid ${BT.brand};padding:1rem 1.25rem;margin:1rem 0;border-radius:0 0.25rem 0.25rem 0"><p style="color:${BT.navy};font-style:italic">${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p></div>`
      case 'list':
        const listItems = item.items || []
        return `<ul style="margin:1rem 0;padding-left:1.5rem;list-style:disc">${listItems.map(li =>
          `<li style="margin-bottom:0.5rem;color:${BT.gray}">${String(li).replace(/\*\*(.*?)\*\*/g, `<strong style="color:${BT.navy}">$1</strong>`)}</li>`
        ).join('')}</ul>`
      case 'paragraph':
      default:
        return `<p style="margin-bottom:1rem">${text.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${BT.navy}">$1</strong>`)}</p>`
    }
  }).join('')
}

function renderContentSection(content) {
  const title = getLocalized(content.title) || getLocalized(content.headline)
  const subtitle = getLocalized(content.subtitle) || getLocalized(content.eyebrow)
  const body = renderContentItems(content.content)
  const image = content.image

  return `
  <section class="content-section" style="padding:4rem 1.5rem;background:${BT.cream}">
    <div style="max-width:72rem;margin:0 auto;display:grid;grid-template-columns:${image ? '1fr 1fr' : '1fr'};gap:3rem;align-items:center">
      <div>
        ${title ? `<h2 style="font-size:2rem;font-weight:600;color:${BT.navy};margin-bottom:1rem;font-family:${BT.fontSerif}">${esc(title)}</h2>` : ''}
        ${subtitle ? `<p style="color:${BT.brand};margin-bottom:1rem">${esc(subtitle)}</p>` : ''}
        <div style="color:${BT.gray};line-height:1.75">${body}</div>
      </div>
      ${image ? `<div><img src="${image}" alt="" style="border-radius:0.5rem;width:100%;aspect-ratio:4/3;object-fit:cover;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)" /></div>` : ''}
    </div>
  </section>`
}

function renderFaqSection(content) {
  const title = getLocalized(content.title)
  const faqs = content.faqs || content.items || []

  return `
  <section class="faq-section" style="padding:4rem 1.5rem;background:${BT.background}">
    <div style="max-width:48rem;margin:0 auto">
      ${title ? `<h2 style="font-size:2rem;font-weight:600;color:${BT.navy};margin-bottom:3rem;text-align:center;font-family:${BT.fontSerif}">${esc(title)}</h2>` : ''}
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        ${faqs.map(faq => `
          <div style="background:${BT.cream};padding:1.5rem;border-radius:0.5rem;border:1px solid ${BT.border}">
            <h3 style="font-size:1rem;font-weight:600;color:${BT.navy};margin-bottom:0.75rem">${esc(getLocalized(faq.question))}</h3>
            <p style="color:${BT.gray};line-height:1.6">${esc(getLocalized(faq.answer))}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`
}

function renderCtaSection(content) {
  const title = getLocalized(content.title)
  const subtitle = getLocalized(content.subtitle)
  const eyebrow = getLocalized(content.eyebrow)
  const buttons = content.buttons || []

  return `
  <section class="cta-section" style="padding:4rem 1.5rem;background:linear-gradient(135deg,${BT.brand} 0%,${BT.brandHover} 100%);color:${BT.white}">
    <div style="max-width:48rem;margin:0 auto;text-align:center">
      ${eyebrow ? `<p style="font-weight:500;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.1em;font-size:0.875rem;opacity:0.9">${esc(eyebrow)}</p>` : ''}
      <h2 style="font-size:2rem;font-weight:600;margin-bottom:1rem;font-family:${BT.fontSerif}">${esc(title)}</h2>
      ${subtitle ? `<p style="font-size:1.125rem;margin-bottom:2rem;opacity:0.9">${esc(subtitle)}</p>` : ''}
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:1rem">
        ${buttons.map(btn => `<a href="${btn.url?.en || btn.url || '#'}" style="display:inline-block;${btn.variant === 'secondary' ? `background:transparent;border:2px solid ${BT.white}` : `background:${BT.white};color:${BT.brand}`};padding:0.75rem 2rem;border-radius:0.25rem;text-decoration:none;font-weight:600">${esc(getLocalized(btn.text))}</a>`).join('')}
      </div>
    </div>
  </section>`
}

function renderCollectionEmbed(content) {
  const heading = content.heading
  const items = content.items || []
  const display = content.display || {}

  if (items.length === 0) {
    return `
    <section class="collection-section" style="padding:4rem 1.5rem;background:${BT.cream}">
      <div style="max-width:72rem;margin:0 auto;text-align:center">
        <p style="color:${BT.gray}">Collection items will be displayed here.</p>
      </div>
    </section>`
  }

  return `
  <section class="collection-section" style="padding:4rem 1.5rem;background:${BT.cream}">
    <div style="max-width:72rem;margin:0 auto">
      ${heading ? `<h2 style="font-size:2rem;font-weight:600;color:${BT.navy};margin-bottom:3rem;text-align:center;font-family:${BT.fontSerif}">${esc(heading)}</h2>` : ''}
      <div style="display:grid;grid-template-columns:repeat(${display.columns || 3},1fr);gap:1.5rem">
        ${items.slice(0, 12).map(item => `
          <a href="${item.url || '#'}" style="display:block;background:${BT.background};border-radius:0.5rem;overflow:hidden;border:1px solid ${BT.border};text-decoration:none;transition:border-color 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
            ${item.image ? `<div style="aspect-ratio:16/9;background-image:url('${item.image}');background-size:cover;background-position:center"></div>` : `<div style="aspect-ratio:16/9;background:${BT.cream}"></div>`}
            <div style="padding:1rem">
              <h3 style="font-size:1rem;font-weight:600;color:${BT.navy};margin-bottom:0.5rem">${esc(item.title)}</h3>
              ${item.summary ? `<p style="color:${BT.gray};font-size:0.875rem;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(item.summary)}</p>` : ''}
              ${item.village ? `<p style="color:${BT.brand};font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;margin-top:0.5rem">${esc(item.village)}</p>` : ''}
            </div>
          </a>
        `).join('')}
      </div>
      ${content.showViewAll ? `<div style="text-align:center;margin-top:2rem"><a href="${content.viewAllUrl || '#'}" style="color:${BT.brand};text-decoration:none;font-weight:500">View All →</a></div>` : ''}
    </div>
  </section>`
}

function renderSection(section) {
  const type = section.type || ''

  if (type.includes('hero')) return renderHeroSection(section)
  if (type.includes('stats')) return renderStatsSection(section)
  if (type.includes('feature')) return renderFeatureSection(section)
  if (type.includes('content')) return renderContentSection(section)
  if (type.includes('faq')) return renderFaqSection(section)
  if (type.includes('cta')) return renderCtaSection(section)
  if (type.includes('collection-embed')) return renderCollectionEmbed(section)

  // Default placeholder
  return `
  <section style="padding:2rem 1.5rem;background:${BT.cream};border-left:4px solid ${BT.brand}">
    <div style="max-width:72rem;margin:0 auto">
      <div style="font-size:0.875rem;font-family:monospace;color:${BT.gray}">[${type}]</div>
    </div>
  </section>`
}

// ============================================================================
// PAGE TEMPLATE
// ============================================================================

// Village subpage categories
const VILLAGE_SUBPAGES = [
  { slug: 'overview', label: 'Overview' },
  { slug: 'restaurants', label: 'Restaurants' },
  { slug: 'hotels', label: 'Hotels' },
  { slug: 'hiking', label: 'Hiking' },
  { slug: 'beaches', label: 'Beaches' },
  { slug: 'sights', label: 'Sights' },
  { slug: 'events', label: 'Events' },
  { slug: 'getting-here', label: 'Getting Here' },
  { slug: 'weather', label: 'Weather' },
  { slug: 'faq', label: 'FAQ' },
]

const VILLAGES = ['monterosso', 'vernazza', 'corniglia', 'manarola', 'riomaggiore']

function getVillageFromPath(pagePath) {
  const parts = pagePath.split('/')
  if (VILLAGES.includes(parts[0])) {
    return parts[0]
  }
  return null
}

function generateSubNav(pagePath) {
  const village = getVillageFromPath(pagePath)
  if (!village) return ''

  const villageName = village.charAt(0).toUpperCase() + village.slice(1)
  const currentSubpage = pagePath.split('/')[1] || ''

  return `
  <nav style="background:${BT.cream};border-bottom:1px solid ${BT.border};overflow-x:auto">
    <div style="max-width:72rem;margin:0 auto;padding:0 1.5rem;display:flex;gap:0.5rem;white-space:nowrap">
      <a href="/${village}" style="padding:0.75rem 1rem;color:${!currentSubpage ? BT.brand : BT.gray};text-decoration:none;font-size:0.875rem;border-bottom:2px solid ${!currentSubpage ? BT.brand : 'transparent'}">${villageName}</a>
      ${VILLAGE_SUBPAGES.map(sub => `<a href="/${village}/${sub.slug}" style="padding:0.75rem 1rem;color:${currentSubpage === sub.slug ? BT.brand : BT.gray};text-decoration:none;font-size:0.875rem;border-bottom:2px solid ${currentSubpage === sub.slug ? BT.brand : 'transparent'}">${sub.label}</a>`).join('')}
    </div>
  </nav>`
}

function generatePageHtml(pageData, pagePath) {
  const body = pageData.body || []
  const seoTitle = getLocalized(pageData.seo?.title) || getLocalized(pageData.title) || 'Cinqueterre.travel'
  const seoDesc = getLocalized(pageData.seo?.description) || ''
  const subNav = generateSubNav(pagePath)
  const village = getVillageFromPath(pagePath)

  // Extract font families for Google Fonts loading
  const displayFont = (theme.fonts?.display || 'Cormorant Garamond').split(',')[0].trim().replace(/'/g, '')
  const sansFont = (theme.fonts?.sans || 'Inter').split(',')[0].trim().replace(/'/g, '')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(seoTitle)}</title>
  <meta name="description" content="${esc(seoDesc)}">
  <link rel="canonical" href="https://cinqueterre.travel/${pagePath}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(displayFont)}:wght@400;500;600;700&family=${encodeURIComponent(sansFont)}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${BT.fontSans}; line-height: 1.6; color: ${BT.foreground}; background: ${BT.background}; }
    img { max-width: 100%; height: auto; }
    a { transition: all 0.2s; }
    a:hover { opacity: 0.85; }
    .subnav::-webkit-scrollbar { height: 4px; }
    .subnav::-webkit-scrollbar-track { background: ${BT.cream}; }
    .subnav::-webkit-scrollbar-thumb { background: ${BT.border}; border-radius: 2px; }
    @media (max-width: 768px) {
      [style*="grid-template-columns:repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
      [style*="grid-template-columns:repeat(3"] { grid-template-columns: repeat(1, 1fr) !important; }
      [style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; }
      h1 { font-size: 2rem !important; }
      h2 { font-size: 1.5rem !important; }
      .main-nav { display: none !important; }
      .mobile-menu { display: block !important; }
    }
  </style>
</head>
<body>
  <header style="padding:1rem 1.5rem;background:${BT.white};border-bottom:1px solid ${BT.border};position:sticky;top:0;z-index:50">
    <div style="max-width:72rem;margin:0 auto;display:flex;justify-content:space-between;align-items:center">
      <a href="/" style="font-size:1.25rem;font-weight:600;color:${BT.navy};text-decoration:none;font-family:${BT.fontSerif}">Cinqueterre.travel</a>
      <nav class="main-nav" style="display:flex;gap:1.5rem;align-items:center">
        <a href="/cinque-terre" style="color:${BT.gray};text-decoration:none;font-size:0.9375rem">Cinque Terre</a>
        <a href="/monterosso" style="color:${village === 'monterosso' ? BT.brand : BT.gray};text-decoration:none;font-size:0.9375rem">Monterosso</a>
        <a href="/vernazza" style="color:${village === 'vernazza' ? BT.brand : BT.gray};text-decoration:none;font-size:0.9375rem">Vernazza</a>
        <a href="/corniglia" style="color:${village === 'corniglia' ? BT.brand : BT.gray};text-decoration:none;font-size:0.9375rem">Corniglia</a>
        <a href="/manarola" style="color:${village === 'manarola' ? BT.brand : BT.gray};text-decoration:none;font-size:0.9375rem">Manarola</a>
        <a href="/riomaggiore" style="color:${village === 'riomaggiore' ? BT.brand : BT.gray};text-decoration:none;font-size:0.9375rem">Riomaggiore</a>
        <span style="color:${BT.border}">|</span>
        <a href="/cinque-terre/hiking" style="color:${BT.gray};text-decoration:none;font-size:0.9375rem">Hiking</a>
        <a href="/cinque-terre/restaurants" style="color:${BT.gray};text-decoration:none;font-size:0.9375rem">Restaurants</a>
      </nav>
    </div>
  </header>
  ${subNav}

  <main>
    ${body.map(renderSection).join('\n')}
  </main>

  <footer style="padding:4rem 1.5rem 2rem;background:${BT.navy};border-top:1px solid ${BT.border}">
    <div style="max-width:72rem;margin:0 auto">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;margin-bottom:3rem">
        <div>
          <h4 style="color:${BT.white};font-weight:600;margin-bottom:1rem;font-size:0.875rem">Villages</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            <a href="/monterosso" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Monterosso</a>
            <a href="/vernazza" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Vernazza</a>
            <a href="/corniglia" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Corniglia</a>
            <a href="/manarola" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Manarola</a>
            <a href="/riomaggiore" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Riomaggiore</a>
          </div>
        </div>
        <div>
          <h4 style="color:${BT.white};font-weight:600;margin-bottom:1rem;font-size:0.875rem">Plan Your Trip</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            <a href="/cinque-terre/hotels" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Hotels</a>
            <a href="/cinque-terre/restaurants" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Restaurants</a>
            <a href="/cinque-terre/getting-here" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Getting Here</a>
            <a href="/cinque-terre/weather" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Weather</a>
            <a href="/transport" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Transport</a>
          </div>
        </div>
        <div>
          <h4 style="color:${BT.white};font-weight:600;margin-bottom:1rem;font-size:0.875rem">Explore</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            <a href="/cinque-terre/hiking" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Hiking Trails</a>
            <a href="/cinque-terre/beaches" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Beaches</a>
            <a href="/cinque-terre/boat-tours" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Boat Tours</a>
            <a href="/cinque-terre/events" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Events</a>
            <a href="/cinque-terre/sights" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Sights</a>
          </div>
        </div>
        <div>
          <h4 style="color:${BT.white};font-weight:600;margin-bottom:1rem;font-size:0.875rem">About</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            <a href="/cinque-terre" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">About Cinque Terre</a>
            <a href="/cinque-terre/overview" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Overview</a>
            <a href="/cinque-terre/faq" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">FAQ</a>
            <a href="/cinque-terre/maps" style="color:${BT.grayLight};text-decoration:none;font-size:0.875rem">Maps</a>
          </div>
        </div>
      </div>
      <div style="text-align:center;padding-top:2rem;border-top:1px solid rgba(255,255,255,0.1)">
        <p style="color:${BT.white};font-weight:500;margin-bottom:0.25rem;font-family:${BT.fontSerif}">Cinqueterre.travel</p>
        <p style="color:${BT.grayLight};font-size:0.875rem">Your Complete Guide to Italy's Coastal Paradise</p>
        <p style="margin-top:1rem;font-size:0.75rem;color:rgba(255,255,255,0.4)">© 2025 Cinqueterre.travel · Built with swarm.press</p>
      </div>
    </div>
  </footer>
</body>
</html>`
}

// ============================================================================
// BUILD PROCESS
// ============================================================================

function discoverPages(dir, base = '') {
  const pages = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    const relativePath = base ? `${base}/${item.name}` : item.name

    if (item.isDirectory()) {
      pages.push(...discoverPages(fullPath, relativePath))
    } else if (item.name.endsWith('.json')) {
      const slug = item.name.replace('.json', '')
      const pagePath = base ? `${base}/${slug}` : slug
      pages.push({ jsonPath: fullPath, pagePath })
    }
  }

  return pages
}

function build() {
  console.log('═'.repeat(60))
  console.log('  Building cinqueterre.travel')
  console.log('═'.repeat(60))

  // Clean and create dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true })
  }
  fs.mkdirSync(DIST_DIR, { recursive: true })

  // Discover all pages
  console.log('\n📄 Discovering pages...')
  const pages = discoverPages(PAGES_DIR)
  console.log(`   Found ${pages.length} pages`)

  // Build each page
  console.log('\n🔨 Building pages...')
  let built = 0

  for (const page of pages) {
    try {
      const pageData = JSON.parse(fs.readFileSync(page.jsonPath, 'utf-8'))

      // Determine output path
      let outputPath
      if (page.pagePath === 'index') {
        outputPath = path.join(DIST_DIR, 'index.html')
      } else {
        const outputDir = path.join(DIST_DIR, page.pagePath)
        ensureDir(outputDir)
        outputPath = path.join(outputDir, 'index.html')
      }

      // Generate HTML
      const html = generatePageHtml(pageData, page.pagePath)
      fs.writeFileSync(outputPath, html)
      built++
    } catch (error) {
      console.log(`   ❌ Error building ${page.pagePath}: ${error.message}`)
    }
  }

  console.log(`   ✓ Built ${built} pages`)

  // Copy CNAME if exists
  const cnamePath = path.join(__dirname, 'CNAME')
  if (fs.existsSync(cnamePath)) {
    fs.copyFileSync(cnamePath, path.join(DIST_DIR, 'CNAME'))
    console.log('   ✓ Copied CNAME')
  }

  console.log('\n═'.repeat(60))
  console.log('  Build Complete!')
  console.log('═'.repeat(60))
  console.log(`\n   Output: ${DIST_DIR}`)
  console.log(`   Pages: ${built}`)
}

// Run build
build()
