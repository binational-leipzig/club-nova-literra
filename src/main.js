import './style.css'
import logoWhiteUrl from './assets/logo-white.svg'
import logoColorUrl from './assets/logo-color.svg'

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
    const target = scrolled ? logoColorUrl : logoWhiteUrl
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
   Contact form: no backend, so it opens the visitor's own
   email app via a mailto: link, prefilled with their input
--------------------------------------------------------- */
const CONTACT_EMAIL = 'nikolenko@verband-binationaler.de'

document.querySelector('[data-static-form]')?.addEventListener('submit', (e) => {
  e.preventDefault()
  const form = e.target
  const name = form.querySelector('#name')?.value.trim() || ''
  const email = form.querySelector('#email')?.value.trim() || ''
  const message = form.querySelector('#message')?.value.trim() || ''

  const isUk = root.getAttribute('data-active-lang') === 'uk'
  const subject = isUk
    ? `Повідомлення від ${name || 'відвідувача сайту'}`
    : `Nachricht von ${name || 'Website-Besucher*in'}`
  const body = (
    isUk
      ? [`Ім'я: ${name}`, `Електронна пошта: ${email}`, '', message]
      : [`Name: ${name}`, `E-Mail: ${email}`, '', message]
  ).join('\n')

  const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = mailtoUrl
})
