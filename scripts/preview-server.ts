/**
 * Local Preview Server for Cinqueterre.travel
 *
 * Builds HTML from JSON content and serves it locally
 * Usage: npx tsx scripts/preview-server.ts
 */

import { createServer, IncomingMessage, ServerResponse } from 'http'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const PORT = 8888
const CONTENT_DIR = join(process.cwd(), 'content')
const PAGES_DIR = join(CONTENT_DIR, 'pages')

// Helper to get localized value
function getLocalized(value: unknown, locale = 'en'): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return String(obj[locale] || obj.en || Object.values(obj)[0] || '')
  }
  return ''
}

// Escape HTML
function esc(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Section renderers
function renderHeroSection(section: Record<string, unknown>): string {
  const title = getLocalized(section.title)
  const subtitle = getLocalized(section.subtitle)
  const eyebrow = getLocalized(section.eyebrow)
  const buttons = (section.buttons || []) as Array<{ text?: unknown; url?: unknown; variant?: string }>
  const image = section.image || section.backgroundImage

  return `
    <section class="hero-section">
      ${image ? `<div class="hero-bg" style="background-image: url('${image}')"></div>` : ''}
      <div class="hero-content">
        ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
        <h1>${esc(title) || 'Hero Title'}</h1>
        ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}
        <div class="buttons">
          ${buttons.map(btn => `
            <a href="${getLocalized(btn.url) || '#'}" class="btn ${btn.variant || 'primary'}">
              ${esc(getLocalized(btn.text)) || 'Button'}
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `
}

function renderStatsSection(section: Record<string, unknown>): string {
  const title = getLocalized(section.title)
  const eyebrow = getLocalized(section.eyebrow)
  const stats = (section.stats || []) as Array<{ value?: unknown; label?: unknown }>

  return `
    <section class="stats-section">
      <div class="container">
        ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
        ${title ? `<h2>${esc(title)}</h2>` : ''}
        <div class="stats-grid">
          ${stats.map(stat => `
            <div class="stat">
              <div class="stat-value">${esc(getLocalized(stat.value))}</div>
              <div class="stat-label">${esc(getLocalized(stat.label))}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `
}

function renderFeatureSection(section: Record<string, unknown>): string {
  const title = getLocalized(section.title)
  const eyebrow = getLocalized(section.eyebrow)
  const features = (section.features || []) as Array<{ icon?: string; title?: unknown; description?: unknown }>

  return `
    <section class="feature-section">
      <div class="container">
        ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
        ${title ? `<h2>${esc(title)}</h2>` : ''}
        <div class="feature-grid">
          ${features.map(f => `
            <div class="feature-card">
              ${f.icon ? `<div class="feature-icon">📍</div>` : ''}
              <h3>${esc(getLocalized(f.title))}</h3>
              <p>${esc(getLocalized(f.description))}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `
}

function renderContentSection(section: Record<string, unknown>): string {
  const title = getLocalized(section.title)
  const eyebrow = getLocalized(section.eyebrow)
  const content = getLocalized(section.content)
  const image = section.image as string | undefined

  return `
    <section class="content-section">
      <div class="container content-grid">
        <div class="content-text">
          ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
          ${title ? `<h2>${esc(title)}</h2>` : ''}
          <div class="prose">
            ${content ? content.split('\n\n').map(p =>
              `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`
            ).join('') : ''}
          </div>
        </div>
        ${image ? `<div class="content-image"><img src="${image}" alt="" /></div>` : ''}
      </div>
    </section>
  `
}

function renderTestimonialSection(section: Record<string, unknown>): string {
  const quote = getLocalized(section.quote)
  const author = getLocalized(section.author)
  const role = getLocalized(section.role)

  return `
    <section class="testimonial-section">
      <div class="container">
        <svg class="quote-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
        <blockquote>${esc(quote) || 'Quote text'}</blockquote>
        <div class="author">${esc(author) || 'Author'}</div>
        ${role ? `<div class="role">${esc(role)}</div>` : ''}
      </div>
    </section>
  `
}

function renderCTASection(section: Record<string, unknown>): string {
  const title = getLocalized(section.title)
  const subtitle = getLocalized(section.subtitle)
  const buttons = (section.buttons || []) as Array<{ text?: unknown; url?: unknown; variant?: string }>

  return `
    <section class="cta-section">
      <div class="container">
        <h2>${esc(title) || 'Call to Action'}</h2>
        ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}
        <div class="buttons">
          ${buttons.map(btn => `
            <a href="${getLocalized(btn.url) || '#'}" class="btn ${btn.variant || 'primary'}">
              ${esc(getLocalized(btn.text)) || 'Button'}
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `
}

function renderFAQSection(section: Record<string, unknown>): string {
  const title = getLocalized(section.title)
  const items = (section.faqs || section.items || []) as Array<{ question?: unknown; answer?: unknown; q?: unknown; a?: unknown }>

  return `
    <section class="faq-section">
      <div class="container">
        ${title ? `<h2>${esc(title)}</h2>` : ''}
        <div class="faq-list">
          ${items.map(item => `
            <details class="faq-item">
              <summary>${esc(getLocalized(item.question || item.q))}</summary>
              <div class="faq-answer">${esc(getLocalized(item.answer || item.a))}</div>
            </details>
          `).join('')}
        </div>
      </div>
    </section>
  `
}

function renderSection(section: Record<string, unknown>): string {
  const type = String(section.type || '').toLowerCase()

  if (type.includes('hero')) return renderHeroSection(section)
  if (type.includes('stats')) return renderStatsSection(section)
  if (type.includes('feature')) return renderFeatureSection(section)
  if (type.includes('content')) return renderContentSection(section)
  if (type.includes('testimonial')) return renderTestimonialSection(section)
  if (type.includes('cta')) return renderCTASection(section)
  if (type.includes('faq')) return renderFAQSection(section)
  if (type.includes('footer')) return '' // Skip footer in body
  if (type.includes('map')) {
    return `<section class="map-section"><div class="container"><p class="placeholder">[Interactive Map]</p></div></section>`
  }

  // Default placeholder
  return `
    <section class="placeholder-section">
      <div class="container">
        <code>${esc(type)}</code>
        <pre>${esc(JSON.stringify(section, null, 2).slice(0, 500))}...</pre>
      </div>
    </section>
  `
}

// CSS styles
const styles = `
:root {
  --primary: #0284c7;
  --primary-dark: #0369a1;
  --text: #0f172a;
  --text-muted: #64748b;
  --bg: #ffffff;
  --bg-alt: #f8fafc;
  --border: #e2e8f0;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
}

h1, h2, h3 { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; }
h1 { font-size: 3rem; line-height: 1.2; }
h2 { font-size: 2rem; margin-bottom: 1rem; }
h3 { font-size: 1.25rem; }

img { max-width: 100%; height: auto; }

.container { max-width: 72rem; margin: 0 auto; padding: 0 1.5rem; }

.eyebrow {
  color: var(--primary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  max-width: 42rem;
  margin: 0 auto;
}

.buttons { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 2rem; }

.btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn.primary { background: var(--primary); color: white; }
.btn.primary:hover { background: var(--primary-dark); }
.btn.secondary { background: white; color: var(--primary); border: 2px solid var(--primary); }
.btn.secondary:hover { background: var(--primary); color: white; }

/* Header */
header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.5rem;
}

header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header .logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
}

header nav { display: flex; gap: 2rem; }
header nav a { color: var(--text-muted); text-decoration: none; }
header nav a:hover { color: var(--primary); }

/* Hero */
.hero-section {
  position: relative;
  padding: 6rem 1.5rem;
  background: linear-gradient(to bottom right, #f0f9ff, #dbeafe);
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.2;
}

.hero-content {
  position: relative;
  max-width: 56rem;
  margin: 0 auto;
}

.hero-section .subtitle { margin-bottom: 2rem; }

/* Stats */
.stats-section { padding: 4rem 1.5rem; background: var(--bg); text-align: center; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-top: 2rem; }
.stat-value { font-size: 2.5rem; font-weight: 700; color: var(--primary); }
.stat-label { color: var(--text-muted); }

/* Features */
.feature-section { padding: 4rem 1.5rem; background: var(--bg-alt); text-align: center; }
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2rem; }
.feature-card { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: left; }
.feature-icon { font-size: 2rem; margin-bottom: 1rem; }
.feature-card h3 { margin-bottom: 0.5rem; }
.feature-card p { color: var(--text-muted); }

/* Content */
.content-section { padding: 4rem 1.5rem; }
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
.content-image img { border-radius: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.prose p { margin-bottom: 1rem; color: var(--text-muted); }
.prose strong { color: var(--text); }

/* Testimonial */
.testimonial-section { padding: 4rem 1.5rem; background: var(--primary); color: white; text-align: center; }
.quote-icon { width: 3rem; height: 3rem; margin-bottom: 1.5rem; opacity: 0.5; }
blockquote { font-size: 1.5rem; font-style: italic; margin-bottom: 2rem; max-width: 48rem; margin-left: auto; margin-right: auto; }
.author { font-weight: 600; }
.role { color: #bae6fd; }

/* CTA */
.cta-section { padding: 4rem 1.5rem; background: linear-gradient(to bottom right, #0284c7, #1d4ed8); color: white; text-align: center; }
.cta-section .subtitle { color: #bae6fd; margin-bottom: 2rem; }
.cta-section .btn.primary { background: #0369a1; }
.cta-section .btn.secondary { background: white; color: var(--primary); border: none; }

/* FAQ */
.faq-section { padding: 4rem 1.5rem; }
.faq-list { max-width: 48rem; margin: 2rem auto 0; }
.faq-item { background: var(--bg-alt); border-radius: 0.5rem; margin-bottom: 0.5rem; }
.faq-item summary { padding: 1rem 1.5rem; cursor: pointer; font-weight: 500; }
.faq-answer { padding: 0 1.5rem 1rem; color: var(--text-muted); }

/* Map */
.map-section { padding: 4rem 1.5rem; background: var(--bg-alt); text-align: center; }
.placeholder { color: var(--text-muted); }

/* Placeholder */
.placeholder-section { padding: 2rem 1.5rem; background: #f1f5f9; border-left: 4px solid var(--primary); }
.placeholder-section code { font-size: 0.875rem; color: var(--text-muted); }
.placeholder-section pre { font-size: 0.75rem; background: white; padding: 1rem; border-radius: 0.5rem; overflow: auto; margin-top: 0.5rem; }

/* Footer */
footer { padding: 3rem 1.5rem; background: #0f172a; color: #94a3b8; text-align: center; }

/* Preview banner */
.preview-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #f59e0b;
  color: #78350f;
  padding: 0.5rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 1000;
}

.preview-banner a { color: inherit; margin-left: 1rem; }

body { padding-top: 2.5rem; }

/* Responsive */
@media (max-width: 768px) {
  h1 { font-size: 2rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .feature-grid { grid-template-columns: 1fr; }
  .content-grid { grid-template-columns: 1fr; }
  header nav { display: none; }
}
`

// Build page HTML
function buildPageHtml(pagePath: string): string {
  const jsonPath = join(PAGES_DIR, `${pagePath}.json`)

  if (!existsSync(jsonPath)) {
    return `<!DOCTYPE html><html><body><h1>Page not found: ${pagePath}</h1></body></html>`
  }

  const pageData = JSON.parse(readFileSync(jsonPath, 'utf8'))
  const body = pageData.body || []
  const title = getLocalized(pageData.seo?.title) || getLocalized(pageData.title) || 'Page'
  const description = getLocalized(pageData.seo?.description) || ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>${styles}</style>
</head>
<body>
  <div class="preview-banner">
    🔍 Local Preview - ${pagePath}
    <a href="/">Home</a>
  </div>

  <header>
    <div class="container">
      <a href="/" class="logo">Cinqueterre.travel</a>
      <nav>
        <a href="/cinque-terre">Cinque Terre</a>
        <a href="/monterosso">Monterosso</a>
        <a href="/vernazza">Vernazza</a>
        <a href="/manarola">Manarola</a>
        <a href="/riomaggiore">Riomaggiore</a>
      </nav>
    </div>
  </header>

  <main>
    ${body.map((section: Record<string, unknown>) => renderSection(section)).join('\n')}
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2025 Cinqueterre.travel - Local Preview</p>
      <p style="margin-top:0.5rem;font-size:0.875rem">Powered by swarm.press</p>
    </div>
  </footer>
</body>
</html>`
}

// Build page list
function buildIndexHtml(): string {
  const pages: string[] = []

  const files = readdirSync(PAGES_DIR)
  for (const file of files) {
    const stat = statSync(join(PAGES_DIR, file))
    if (stat.isFile() && file.endsWith('.json')) {
      pages.push(file.replace('.json', ''))
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Local Preview - Cinqueterre.travel</title>
  <style>
    body { font-family: system-ui; padding: 2rem; max-width: 48rem; margin: 0 auto; }
    h1 { margin-bottom: 2rem; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 0.5rem; }
    a { color: #0284c7; text-decoration: none; padding: 0.5rem 1rem; display: inline-block; background: #f0f9ff; border-radius: 0.25rem; }
    a:hover { background: #dbeafe; }
  </style>
</head>
<body>
  <h1>🔍 Local Preview</h1>
  <h2>Available Pages</h2>
  <ul>
    ${pages.map(p => `<li><a href="/${p}">${p}</a></li>`).join('\n')}
  </ul>
</body>
</html>`
}

// HTTP request handler
function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  let pathname = url.pathname

  // Remove leading slash and default to index
  pathname = pathname.replace(/^\//, '') || 'index'
  pathname = pathname.replace(/\.html$/, '')

  console.log(`[${new Date().toISOString()}] GET /${pathname}`)

  // Serve page
  const html = buildPageHtml(pathname)
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(html)
}

// Start server
const server = createServer(handleRequest)

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔍 Cinqueterre.travel Local Preview Server              ║
║                                                           ║
║   Server running at: http://localhost:${PORT}               ║
║                                                           ║
║   Pages:                                                  ║
║   • http://localhost:${PORT}/index                          ║
║   • http://localhost:${PORT}/cinque-terre                   ║
║   • http://localhost:${PORT}/monterosso                     ║
║   • http://localhost:${PORT}/vernazza                       ║
║   • http://localhost:${PORT}/manarola                       ║
║   • http://localhost:${PORT}/riomaggiore                    ║
║   • http://localhost:${PORT}/corniglia                      ║
║                                                           ║
║   Press Ctrl+C to stop                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)
})
