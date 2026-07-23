import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import data from '../data.json'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1644088379091-d574269d422f?w=1600&auto=format&fit=crop&q=80'

const platformIcons = {
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.19-3.37-1.19-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.75-1.05 2.75-1.05.55 1.43.2 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .28.18.61.69.5A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="9.5" x2="7.5" y2="17" />
      <circle cx="7.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <line x1="12" y1="17" x2="12" y2="12.2" />
      <path d="M12 13.5c0-1.4 1-2.3 2.3-2.3 1.4 0 2.2.9 2.2 2.4V17" />
    </svg>
  ),
  upwork: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9v3.2a3 3 0 0 0 6 0V9" />
      <path d="M12 12.2c0 2 1.4 3.6 3.2 3.6 1.7 0 2.8-1.2 2.8-2.8 0-1.5-1-2.6-2.4-2.9-1.1-.2-1.9-1-2-2.4" />
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
}

export default function About() {
  const sectionRef = useRef(null)
  const statsTopRef = useRef(null)
  const heroStatRef = useRef(null)
  const headingRef = useRef(null)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  const {
    stats, descriptionHtml, image,
    headingLines, brand, role, ctaLine, ctaLabel, ctaHref,
  } = data.about
  const socialLinks = data.footer.links

  const smallStats = stats.slice(0, -1)
  const heroStat = stats[stats.length - 1]

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll('.word')
        gsap.fromTo(words,
          { opacity: 0, y: 24, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.6, ease: 'power3.out', stagger: 0.05,
            scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
          }
        )
      }

      if (imgRef.current) {
        gsap.fromTo(imgRef.current,
          { opacity: 0, scale: 1.06 },
          {
            opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: imgRef.current, start: 'top 88%' },
          }
        )
      }

      if (statsTopRef.current) {
        const items = statsTopRef.current.querySelectorAll('.stat-item')
        gsap.fromTo(items,
          { opacity: 0, y: 20, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: statsTopRef.current, start: 'top 85%' },
          }
        )
      }

      if (heroStatRef.current) {
        gsap.fromTo(heroStatRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.3,
            scrollTrigger: { trigger: imgRef.current, start: 'top 85%' },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // particle network — clipped to the exact same shape as the hero image
  useEffect(() => {
    const canvas = canvasRef.current
    const container = imgRef.current

    if (!canvas || !container) return

    const context = canvas.getContext("2d")

    let width = 0
    let height = 0
    let animationId

    const mouse = {
      x: -9999,
      y: -9999,
      radius: 160,
    }

    let particles = []

    const createParticles = () => {
      const isMobile = window.innerWidth < 640

      const count = isMobile
        ? Math.max(20, Math.floor((width * height) / 7000))
        : Math.max(45, Math.floor((width * height) / 4200))

      particles = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.2 + Math.random() * 0.35

        const x = Math.random() * width
        const y = Math.random() * height

        return {
          x,
          y,

          homeX: x,
          homeY: y,

          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,

          r: 0.8 + Math.random() * 1.4,
        }
      })
    }

    const resize = () => {
      // Use the SVG size instead of the container
      const svg = container.querySelector(".about-hero-svg")

      const rect = svg.getBoundingClientRect()

      width = Math.round(rect.width)
      height = Math.round(rect.height)

      const dpr = window.devicePixelRatio || 1

      canvas.width = width * dpr
      canvas.height = height * dpr

      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      // remove inline width/height
      canvas.style.width = ""
      canvas.style.height = ""

      createParticles()
    }

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect()

      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    canvas.addEventListener("mousemove", handleMove)
    canvas.addEventListener("mouseleave", handleLeave)

    const draw = () => {
      context.clearRect(0, 0, width, height)

      // ----------------------------
      // BACKGROUND (UNCHANGED)
      // ----------------------------

      const bg = context.createLinearGradient(0, 0, width, height)

      bg.addColorStop(0, "#0b0f18")
      bg.addColorStop(0.35, "#16142d")
      bg.addColorStop(0.7, "#22164a")
      bg.addColorStop(1, "#140d2c")

      context.fillStyle = bg
      context.fillRect(0, 0, width, height)

      const isMobile = window.innerWidth < 640
      const linkDistance = isMobile ? 75 : 130

      // ----------------------------
      // UPDATE PARTICLES
      // ----------------------------

      particles.forEach((p) => {
        p.homeX += p.vx
        p.homeY += p.vy

        if (p.homeX < 0) p.homeX = width
        if (p.homeX > width) p.homeX = 0

        if (p.homeY < 0) p.homeY = height
        if (p.homeY > height) p.homeY = 0

        const dx = p.homeX - mouse.x
        const dy = p.homeY - mouse.y

        const dist = Math.sqrt(dx * dx + dy * dy)

        let targetX = p.homeX
        let targetY = p.homeY

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius
          const angle = Math.atan2(dy, dx)

          targetX += Math.cos(angle) * force * 40
          targetY += Math.sin(angle) * force * 40
        }

        p.x += (targetX - p.x) * 0.12
        p.y += (targetY - p.y) * 0.12
      })

      // ----------------------------
      // LINES
      // ----------------------------

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]

          const dx = p.x - q.x
          const dy = p.y - q.y

          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < linkDistance) {
            context.beginPath()

            context.strokeStyle = `rgba(80,150,255,${0.18 * (1 - dist / linkDistance)
              })`

            context.lineWidth = 0.7

            context.moveTo(p.x, p.y)
            context.lineTo(q.x, q.y)

            context.stroke()
          }
        }
      }

      // ----------------------------
      // PARTICLES
      // ----------------------------

      particles.forEach((p) => {
        context.beginPath()

        context.arc(p.x, p.y, p.r, 0, Math.PI * 2)

        context.fillStyle = "rgba(230,240,255,.95)"

        context.fill()

        const glow = context.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.r * 6
        )

        glow.addColorStop(0, "rgba(90,170,255,.20)")
        glow.addColorStop(1, "rgba(90,170,255,0)")

        context.beginPath()

        context.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)

        context.fillStyle = glow

        context.fill()
      })

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(container)

    return () => {
      cancelAnimationFrame(animationId)

      observer.disconnect()

      canvas.removeEventListener("mousemove", handleMove)
      canvas.removeEventListener("mouseleave", handleLeave)
    }
  }, [])

  return (
    <section id="about" className="section about-v2" ref={sectionRef}>
      <div className="about-topbar">
        <div className="sec-eyebrow" data-fade>
          <span className="eyebrow-num">01</span>
          about
        </div>
        <div className="about-socials" data-fade data-delay="0.1">
          {socialLinks.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
              {platformIcons[s.label]}
            </a>
          ))}
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
        <svg
          className="about-hero-svg"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="about-clip-inverted" clipPathUnits="objectBoundingBox">
              <path d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z" />
            </clipPath>
          </defs>

          <rect
            width="100%"
            height="100%"
            clipPath="url(#about-clip-inverted)"
            fill="#151515"
          />
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
          <div
            className="about-desc"
            data-fade
            data-delay="0.15"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>

        <div className="about-main-right" data-fade data-delay="0.2">
          <div className="about-brand">{brand}</div>
          <div className="about-role">{role}</div>
          <p className="about-cta-line">{ctaLine}</p>
          <a href={ctaHref} className="about-cta-btn">
            {ctaLabel} <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}