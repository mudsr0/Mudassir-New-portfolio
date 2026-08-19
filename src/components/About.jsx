import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import data from '../data.json'
import { smoothScrollTo } from '../utils/smoothScroll'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef(null), statsTopRef = useRef(null), heroStatRef = useRef(null), headingRef = useRef(null), imgRef = useRef(null), canvasRef = useRef(null)
  const { stats, descriptionHtml, headingLines, brand, role, ctaLine, ctaLabel, ctaHref } = data.about
  const smallStats = stats.slice(0, -1), heroStat = stats[stats.length - 1]

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll('.word')
        gsap.fromTo(words, { opacity: 0, y: 24, filter: 'blur(6px)' }, {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', stagger: 0.05,
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%', once: true }
        })
      }
      if (imgRef.current) {
        gsap.fromTo(imgRef.current, { opacity: 0, scale: 1.06 }, {
          opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: imgRef.current, start: 'top 88%', once: true }
        })
      }
      if (statsTopRef.current) {
        const items = statsTopRef.current.querySelectorAll('.stat-item')
        gsap.fromTo(items, { opacity: 0, y: 20, scale: 0.96 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: statsTopRef.current, start: 'top 85%', once: true }
        })
      }
      if (heroStatRef.current) {
        gsap.fromTo(heroStatRef.current, { opacity: 0, y: 16 }, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.3,
          scrollTrigger: { trigger: imgRef.current, start: 'top 85%', once: true }
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current, container = imgRef.current
    if (!canvas || !container) return
    const context = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!context) return

    let width = 0, height = 0, animationId = null, isVisible = false, isRunning = false, resizeTimer = null
    let isMobile = window.innerWidth < 640
    let linkDistance = isMobile ? 75 : 130, linkDistanceSq = linkDistance * linkDistance
    const mouse = { x: -9999, y: -9999, radius: 160, radiusSq: 160 * 160 }
    let particles = [], backgroundGradient = null

    const createBackgroundGradient = () => {
      backgroundGradient = context.createLinearGradient(0, 0, width, height)
      backgroundGradient.addColorStop(0.00, '#101622e6')
      backgroundGradient.addColorStop(0.20, '#111827e6')
      backgroundGradient.addColorStop(0.45, '#222222')
      backgroundGradient.addColorStop(0.70, '#272727')
      backgroundGradient.addColorStop(1.00, '#292929')
    }

    const createParticles = () => {
      const count = isMobile ? Math.max(20, Math.floor((width * height) / 7000)) : Math.max(45, Math.floor((width * height) / 4200))
      particles = new Array(count)
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2, speed = 0.2 + Math.random() * 0.35
        const x = Math.random() * width, y = Math.random() * height
        particles[i] = { x, y, homeX: x, homeY: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 0.8 + Math.random() * 1.4 }
      }
    }

    const resize = () => {
      const svg = container.querySelector('.about-hero-svg')
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      isMobile = window.innerWidth < 640
      linkDistance = isMobile ? 75 : 130
      linkDistanceSq = linkDistance * linkDistance
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      createBackgroundGradient()
      createParticles()
    }

    const scheduleResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 100) }
    const handleMove = (e) => { if (!isVisible) return; const rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top }
    const handleLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    const stopAnimation = () => { if (!isRunning) return; isRunning = false; if (animationId !== null) { cancelAnimationFrame(animationId); animationId = null } }
    const startAnimation = () => { if (!isVisible || isRunning) return; isRunning = true; animationId = requestAnimationFrame(draw) }

    const draw = () => {
      if (!isVisible) { stopAnimation(); return }
      const t = performance.now() * 0.001
      context.clearRect(0, 0, width, height)
      if (backgroundGradient) { context.fillStyle = backgroundGradient; context.fillRect(0, 0, width, height) }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.homeX += p.vx; p.homeY += p.vy
        if (p.homeX < 0) p.homeX = width; else if (p.homeX > width) p.homeX = 0
        if (p.homeY < 0) p.homeY = height; else if (p.homeY > height) p.homeY = 0
        const dx = p.homeX - mouse.x, dy = p.homeY - mouse.y, distSq = dx * dx + dy * dy
        let targetX = p.homeX, targetY = p.homeY
        if (distSq < mouse.radiusSq) {
          const dist = Math.sqrt(distSq)
          if (dist > 0.001) {
            const force = (mouse.radius - dist) / mouse.radius, angle = Math.atan2(dy, dx)
            targetX += Math.cos(angle) * force * 40; targetY += Math.sin(angle) * force * 40
          }
        }
        p.x += (targetX - p.x) * 0.12; p.y += (targetY - p.y) * 0.12
      }

      context.lineWidth = 0.7
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x, dy = p.y - q.y, distSq = dx * dx + dy * dy
          if (distSq < linkDistanceSq) {
            const dist = Math.sqrt(distSq), alpha = 0.22 * (1 - dist / linkDistance)
            context.beginPath()
            context.strokeStyle = `rgba(150,190,255,${alpha})`
            context.moveTo(p.x, p.y); context.lineTo(q.x, q.y); context.stroke()
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        context.beginPath()
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        context.fillStyle = 'rgba(255,255,255,.95)'
        context.fill()
        const glowRadius = p.r * 6
        const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius)
        glow.addColorStop(0, 'rgba(120,170,255,.28)')
        glow.addColorStop(0.55, 'rgba(60,120,200,.10)')
        glow.addColorStop(1, 'rgba(60,120,200,0)')
        context.beginPath()
        context.arc(p.x, p.y, glowRadius, 0, Math.PI * 2)
        context.fillStyle = glow
        context.fill()
      }
      animationId = requestAnimationFrame(draw)
    }

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible) startAnimation(); else stopAnimation()
    }, { threshold: 0, rootMargin: '100px' })

    resize()
    visibilityObserver.observe(container)
    canvas.addEventListener('mousemove', handleMove, { passive: true })
    canvas.addEventListener('mouseleave', handleLeave, { passive: true })
    const resizeObserver = new ResizeObserver(scheduleResize)
    resizeObserver.observe(container)
    window.addEventListener('resize', scheduleResize, { passive: true })

    return () => {
      stopAnimation()
      clearTimeout(resizeTimer)
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('resize', scheduleResize)
    }
  }, [])

  return (
    <section id="about" className="section about-v2" ref={sectionRef}>
      <div className="about-topbar">
        <div className="sec-eyebrow" data-fade>
          <span className="eyebrow-num">02</span>
          WHY CLIENTS HIRE ME
        </div>
      </div>
      <div className="about-stats-top" ref={statsTopRef}>
        {smallStats.map((s) => (
          <div key={s.label} className="stat-item">
            <span className="stat-item-num">{s.num}</span>
            <span className="stat-item-lbl">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="about-hero-img" ref={imgRef}>
        <svg className="about-hero-svg" viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <clipPath id="about-clip-inverted" clipPathUnits="objectBoundingBox">
              <path d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z" />
            </clipPath>
          </defs>
          <rect width="100%" height="100%" clipPath="url(#about-clip-inverted)" fill="#1A1A1A" />
        </svg>
        <canvas ref={canvasRef} className="about-hero-particles" />
        <div className="about-hero-stat" ref={heroStatRef}>
          <span className="stat-item-num">{heroStat.num}</span>
          <span className="stat-item-lbl">{heroStat.label}</span>
        </div>
      </div>
      <div className="about-main">
        <div className="about-main-left">
          <h2 className="sec-h about-h" ref={headingRef}>
            {headingLines.map((line, li) => (
              <span className="line" key={li}>
                {line.split(' ').map((w, wi) => (
                  <span className="word" key={`${li}-${wi}`}>{w}&nbsp;</span>
                ))}
                {li < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <div className="about-desc" data-fade data-delay="0.15" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </div>
        <div className="about-main-right" data-fade data-delay="0.2">
          <div className="about-brand">{brand}</div>
          <div className="about-role">{role}</div>
          <p className="about-cta-line">{ctaLine}</p>
          <a
            href={ctaHref}
            className="about-cta-btn"
            onClick={(e) => {
              e.preventDefault()
              smoothScrollTo(ctaHref)
            }}
          >
            {ctaLabel}
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}