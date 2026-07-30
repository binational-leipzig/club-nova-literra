import './style.css'

/* ---------------------------------------------------------
   Language toggle (DE / UKR)
--------------------------------------------------------- */
const LANG_KEY = 'cnl-lang'
const root = document.documentElement
const langToggle = document.getElementById('lang-toggle')
const thumb = langToggle?.querySelector('[data-thumb]')

function applyLang(lang) {
  root.setAttribute('data-active-lang', lang)
  root.setAttribute('lang', lang === 'uk' ? 'uk' : 'de')
  if (thumb) {
    thumb.style.transform = lang === 'uk' ? 'translateX(100%)' : 'translateX(0)'
  }
  langToggle?.setAttribute('aria-pressed', lang === 'uk' ? 'true' : 'false')
  localStorage.setItem(LANG_KEY, lang)
}

const savedLang = localStorage.getItem(LANG_KEY) || 'de'
applyLang(savedLang)

langToggle?.addEventListener('click', () => {
  const current = root.getAttribute('data-active-lang')
  applyLang(current === 'de' ? 'uk' : 'de')
})

/* ---------------------------------------------------------
   Sticky header: solid background once scrolled past hero
--------------------------------------------------------- */
const header = document.getElementById('site-header')
const logoImg = header?.querySelector('[data-logo]')

function updateHeader() {
  const scrolled = window.scrollY > 40
  header?.setAttribute('data-scrolled', scrolled ? 'true' : 'false')
  if (logoImg) {
    const target = scrolled
      ? logoImg.dataset.logoDark
      : logoImg.dataset.logoLight
    if (logoImg.getAttribute('src') !== target) {
      logoImg.setAttribute('src', target)
    }
  }
}

updateHeader()
window.addEventListener('scroll', updateHeader, { passive: true })

/* ---------------------------------------------------------
   Mobile menu
--------------------------------------------------------- */
const menuBtn = document.getElementById('mobile-menu-btn')
const mobileMenu = document.getElementById('mobile-menu')

menuBtn?.addEventListener('click', () => {
  const isOpen = !mobileMenu?.classList.contains('hidden')
  mobileMenu?.classList.toggle('hidden')
  menuBtn.setAttribute('aria-expanded', String(!isOpen))
})

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden')
    menuBtn?.setAttribute('aria-expanded', 'false')
  })
})

/* ---------------------------------------------------------
   Static contact form (template only, no backend yet)
--------------------------------------------------------- */
document.querySelector('[data-static-form]')?.addEventListener('submit', (e) => {
  e.preventDefault()
  const btn = e.target.querySelector('button[type="submit"]')
  if (btn) {
    const original = btn.innerHTML
    btn.innerHTML =
      root.getAttribute('data-active-lang') === 'uk'
        ? 'Дякуємо!'
        : 'Danke!'
    setTimeout(() => {
      btn.innerHTML = original
    }, 2200)
  }
  e.target.reset()
})

/* ---------------------------------------------------------
   Generative topographic contour-line background
   Used behind the hero / dark sections instead of a static image
--------------------------------------------------------- */
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildTopoSvg({ density = 12, seed = 7, width = 1200, height = 800 } = {}) {
  const rand = seededRandom(seed)
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice')
  svg.setAttribute('aria-hidden', 'true')

  const step = width / (density - 2)
  const baseAmp = height * 0.14
  const driftSeed = rand() * 40 - 20

  for (let i = 0; i < density; i++) {
    const x0 = -step * 1.5 + i * step + driftSeed
    const amp = baseAmp * (0.6 + rand() * 0.8)
    const phase = rand() * 60 - 30
    const skew = 60 + rand() * 40

    const points = []
    const segments = 6
    for (let s = 0; s <= segments; s++) {
      const y = (height / segments) * s
      const wave = Math.sin(s / 1.6 + i * 0.35) * amp + Math.sin(s * 0.7 + phase) * (amp * 0.4)
      points.push([x0 + (y / height) * skew + wave, y])
    }

    let d = `M ${points[0][0].toFixed(1)},${(-40).toFixed(1)}`
    for (let p = 0; p < points.length - 1; p++) {
      const [cx1, cy1] = points[p]
      const [cx2, cy2] = points[p + 1]
      const midY = (cy1 + cy2) / 2
      d += ` C ${cx1.toFixed(1)},${midY.toFixed(1)} ${cx2.toFixed(1)},${midY.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)}`
    }

    const path = document.createElementNS(svgNS, 'path')
    path.setAttribute('d', d)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', 'currentColor')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('vector-effect', 'non-scaling-stroke')
    svg.appendChild(path)
  }

  return svg
}

document.querySelectorAll('[data-topo]').forEach((el, index) => {
  const density = Number(el.dataset.topoDensity) || 12
  const svg = buildTopoSvg({ density, seed: 11 + index * 17 })
  el.appendChild(svg)
})
