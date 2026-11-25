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
   Aktuelles: video cards. The poster overlay starts playback
   and hands over to the native controls; only one video
   plays at a time.
--------------------------------------------------------- */
const videoFrames = document.querySelectorAll('[data-video]')

videoFrames.forEach((frame) => {
  const video = frame.querySelector('video')
  const cover = frame.querySelector('[data-video-cover]')
  if (!video || !cover) return

  cover.addEventListener('click', () => {
    frame.setAttribute('data-started', 'true')
    video.controls = true
    video.play()
    video.focus()
  })

  video.addEventListener('play', () => {
    videoFrames.forEach((other) => {
      const otherVideo = other.querySelector('video')
      if (otherVideo && otherVideo !== video) otherVideo.pause()
    })
  })
})

/* ---------------------------------------------------------
   Aktuelles: event status. Items with data-event-date
   (YYYY-MM-DD) get data-event-status="today" | "past" |
   "upcoming", compared against the visitor's local date;
   CSS shows the matching badge.
--------------------------------------------------------- */
const now = new Date()
const todayKey = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')

document.querySelectorAll('[data-event-date]').forEach((item) => {
  const date = item.getAttribute('data-event-date')
  const status = date === todayKey ? 'today' : date < todayKey ? 'past' : 'upcoming'
  item.setAttribute('data-event-status', status)
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
