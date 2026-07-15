import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../data.json'

export default function About() {
  const statsRef = useRef(null)
  const { stats, descriptionHtml } = data.about

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
          <p className="about-text" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
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
