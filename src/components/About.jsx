import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const stats = [
  { num: '30+', label: 'Projects shipped' },
  { num: '12+', label: 'Countries served' },
  { num: '3',   label: 'Companies built' },
  { num: '5yr', label: 'Experience' },
]

export default function About() {
  const statsRef = useRef(null)

  useEffect(() => {
    if (!statsRef.current) return
    const cards = statsRef.current.querySelectorAll('.stat-card')
    gsap.fromTo(cards,
      { opacity: 0, y: 30, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: statsRef.current, start: 'top 82%' },
      }
    )
  }, [])

  return (
    <section id="about" className="section">
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">01</span>
          about
        </div>
        <h2 className="sec-h">
          Building the future,<br />one system at a time.
        </h2>
        <p className="sec-p">
          COO at DevRolin and co-founder of Eylina. I architect agentic AI systems,
          automate complex workflows, and build premium digital products for
          clients across the US, UK, UAE, and beyond.
        </p>
      </div>

      <div className="about-grid">
        <div data-fade data-delay="0.1">
          <p className="about-text">
            Everything I ship is <strong>custom-built</strong> — no templates, no
            drag-and-drop shortcuts. I work at the intersection of AI, automation,
            and premium web development. If something doesn't exist yet, I build it.<br /><br />
            My focus is on <strong>agentic systems</strong> that operate autonomously,
            handling complex tasks without human intervention. From legal intake AI
            to multilingual voice platforms, I build software that scales.<br /><br />
            DevRolin serves global clients with a remote-first team of engineers
            and designers. Eylina is our AI-native product — redefining how law
            firms handle client intake.
          </p>
        </div>

        <div className="about-stats" ref={statsRef}>
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-num">{s.num}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
