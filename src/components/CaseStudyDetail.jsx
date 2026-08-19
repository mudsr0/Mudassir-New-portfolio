import { useLayoutEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import caseStudies from '../caseStudies.json'
import { smoothScrollTo } from '../utils/smoothScroll'

gsap.registerPlugin(ScrollTrigger)

function RichText({ html, className }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

function SectionHeading({ eyebrow, heading, sub, style }) {
  return (
    <>
      <div className="section-eyebrow">{eyebrow}</div>
      <div className="section-heading">{heading}</div>
      {sub && <div className="section-sub" style={style}>{sub}</div>}
    </>
  )
}

export default function CaseStudyDetail() {
  const { id } = useParams()
  const data = caseStudies[id]
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const fadeEls = gsap.utils.toArray('[data-fade]')
      if (!fadeEls.length) return

      // Set the initial hidden state immediately & synchronously so the page is
      // never "dull"/invisible while GSAP initializes its ScrollTriggers.
      gsap.set(fadeEls, { opacity: 0, y: 30 })

      fadeEls.forEach((el) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        })
      })

      // Recalculate trigger positions once the layout is settled. The first
      // refresh runs while the preloader still locks body overflow, so also
      // refresh after the next paint and once web fonts (which shift layout)
      // are ready.
      ScrollTrigger.refresh()
      const rafId = requestAnimationFrame(() => ScrollTrigger.refresh())
      let fontsReady = null
      if (document.fonts && document.fonts.ready) {
        fontsReady = document.fonts.ready.then(() => ScrollTrigger.refresh())
      }

      // Safety net: if a trigger was miscalculated (stale positions), force-
      // reveal any element that is actually in the viewport but still hidden.
      const revealVisible = () => {
        fadeEls.forEach((el) => {
          const rect = el.getBoundingClientRect()
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            if (Number(gsap.getProperty(el, 'opacity')) < 1) {
              gsap.to(el, {
                opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
                overwrite: true,
              })
            }
          }
        })
      }
      window.addEventListener('scroll', revealVisible, { passive: true })
      revealVisible()

      return () => {
        cancelAnimationFrame(rafId)
        if (fontsReady && typeof fontsReady.cancel === 'function') fontsReady.cancel()
        window.removeEventListener('scroll', revealVisible)
      }
    }, root)

    return () => {
      ctx.revert()
    }
  }, [id])

  if (!data) {
    return (
      <div className="case-study wrap" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
        <h1>Case study not found</h1>
        <p style={{ margin: '12px 0 24px', color: '#A8A8A8' }}>We couldn't find the case study you're looking for.</p>
        <Link to="/" className="watch-demo-btn">Back to home</Link>
      </div>
    )
  }

  const { builder, hero, problem, video, built, outcome, testimonial, process, cta } = data

  return (
    <div className="case-study" ref={rootRef}>
      <div className="wrap">

        {/* ── 1. Builder intro ── */}
        <section className="builder-section">
          <div className="builder-card" data-fade>
            <div className="builder-avatar">{builder.initials}</div>
            <div className="builder-meta">
              <div className="builder-from">Sent personally by</div>
              <div className="builder-name">{builder.name}</div>
              <div className="builder-expertise">{builder.expertise}</div>
              <p className="builder-note">
                <RichText html={builder.note} />
              </p>
              <a
                href="#video-demo"
                className="watch-demo-btn"
                onClick={(e) => {
                  e.preventDefault()
                  smoothScrollTo('#video-demo')
                }}
              >
                Watch the live demo
                <span className="arrow-wrap">
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* ── 2. Hero ── */}
        <section className="hero-section" data-fade>
          <div className="project-tag">
            <div className="project-tag-dot"></div>
            {hero.tag}
          </div>
          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: hero.title }}></h1>
          <p className="hero-body">{hero.body}</p>
          {Array.isArray(hero.pills) && hero.pills.length > 0 && (
            <div className="result-pills">
              {hero.pills.map((pill) => (
                <span key={pill} className="pill"><span className="pill-dot"></span>{pill}</span>
              ))}
            </div>
          )}
        </section>

        {/* ── 3. The problem ── */}
        <section className="problem-section" data-fade>
          <SectionHeading eyebrow={problem.eyebrow} heading={problem.heading} sub={problem.sub} />
          {Array.isArray(problem.pains) && problem.pains.length > 0 && (
            <div className="pain-list-minimal">
              {problem.pains.map((pain, index) => (
                <div key={`pain-${index}`} className="pain-item-minimal">
                  <span className="pain-dot"></span>
                  <span className="pain-text-minimal">{pain}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 4. Video anchor section ── */}
        <section className="video-section" id="video-demo" data-fade>
          <SectionHeading eyebrow={video.eyebrow} heading={video.heading} sub={video.sub} />
          {typeof video.embedUrl === 'string' && video.embedUrl.length > 0 && (
            <div className="browser-frame">
              <div className="browser-bar">
                <div className="browser-dots">
                  <div className="dot-r"></div><div className="dot-y"></div><div className="dot-g"></div>
                </div>
                <div className="browser-url">
                  <span className="lock-icon">🔒</span>
                  {video.label || 'Live System Demo'}
                </div>
              </div>
              <div className="browser-video">
                <iframe
                  src={video.embedUrl}
                  allow="autoplay; fullscreen"
                  allowfullscreen
                  title={`${builder.name} ${hero.tag} demo`}
                ></iframe>
              </div>
              <div className="browser-footer">
                <div className="bfooter-label">
                  <div className="rec-dot"></div>
                  {video.label}
                </div>
                {typeof video.openUrl === 'string' && video.openUrl.length > 0 && (
                  <a href={video.openUrl} target="_blank" rel="noopener" className="open-link">
                    Open fullscreen ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── 5. What was built ── */}
        <section className="built-section" data-fade>
          <SectionHeading eyebrow={built.eyebrow} heading={built.heading} sub={built.sub} />
          {Array.isArray(built.items) && built.items.length > 0 && (
            <div className="built-grid">
              {built.items.map((item) => (
                <div key={item.num} className="built-card">
                  <div className="built-num">{item.num}</div>
                  <div className="built-title">{item.title}</div>
                  <div className="built-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 6. Outcome numbers ── */}
        <section className="outcome-section" data-fade>
          <SectionHeading eyebrow={outcome.eyebrow} heading={outcome.heading} sub={outcome.sub} style={{ marginBottom: '20px' }} />
          {Array.isArray(outcome.items) && outcome.items.length > 0 && (
            <div className="outcome-grid">
              {outcome.items.map((item) => (
                <div key={item.num} className="outcome-card">
                  <div className="outcome-num">{item.num}</div>
                  <div className="outcome-label">{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 7. Testimonial ── */}
        {testimonial && (
          <section className="testimonial-section" data-fade>
            <SectionHeading eyebrow={testimonial.eyebrow} heading={testimonial.heading} sub={testimonial.sub} style={{ marginBottom: '20px' }} />
            <div className="tcard">
              <div className="tcard-quote-mark">&ldquo;</div>
              <div className="tcard-stars">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="tcard-text"><RichText html={testimonial.quote} /></p>
              <div className="tcard-author">
                <div className="tcard-avatar">{testimonial.initials}</div>
                <div>
                  <div className="tcard-name">{testimonial.author}</div>
                  <div className="tcard-role">{testimonial.role}</div>
                </div>
                <div className="tp-badge">Verified Client</div>
              </div>
            </div>
          </section>
        )}

        {/* ── 8. How I work ── */}
        <section className="process-section" data-fade>
          <SectionHeading eyebrow={process.eyebrow} heading={process.heading} sub={process.sub} style={{ marginBottom: '28px' }} />
          {Array.isArray(process.steps) && process.steps.length > 0 && (
            <div className="process-steps">
              {process.steps.map((step) => (
                <div key={step.num} className="process-step">
                  <div className="pstep-num">{step.num}</div>
                  <div className="pstep-content">
                    <div className="pstep-title">{step.title}</div>
                    <div className="pstep-desc">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 9. Final CTA ── */}
        <section className="cta-section" data-fade>
          <div className="cta-card">
            <div className="cta-inner">
              <div className="cta-pre">Available for new projects</div>
              <h2 className="cta-heading"><RichText html={cta.heading} /></h2>
              <p className="cta-sub"><RichText html={cta.sub} /></p>
              <div className="cta-btns">
                <a href={cta.upworkUrl} target="_blank" rel="noopener" className="btn-upwork">
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/></svg>
                  Message me on Upwork
                </a>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cta.email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-email"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  Send an email instead
                </a>
              </div>
              <div className="cta-reassurance">
                <div className="reassure-item">Milestone-based payments</div>
                <div className="reassure-item">First call is free</div>
                <div className="reassure-item">You own all deliverables</div>
                <div className="reassure-item">30-day post-launch support</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
