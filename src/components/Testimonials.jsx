import { memo, useRef } from 'react'
import data from '../data.json'
import usePauseOnHidden from '../hooks/usePauseOnHidden'
import { useTypingAnimation } from '../hooks/useTypingAnimation'

const TestimonialCard = memo(function TestimonialCard({ t }) {
  const stars = Array.from({ length: t.rating || 5 })

  return (
    <div className="testi-card">
      <div className="testi-stars" aria-label={`${stars.length} stars`}>
        {stars.map((star, i) => <span key={i} className="star">★</span>)}
      </div>
      <p className="testi-quote">"{t.text}"</p>
      <div className="testi-author">
        {t.avatar && (
          <img src={t.avatar} alt={t.name} className="testi-avatar-img" loading="lazy" decoding="async" />
        )}
        <div className="testi-info">
          <div className="testi-name">{t.name}</div>
          <div className="testi-role">{t.role}</div>
        </div>
      </div>
    </div>
  )
})

function TestimonialRow({ row }) {
  const cards = row.testimonials
  const scrollerRef = useRef(null)

  usePauseOnHidden(scrollerRef)

  return (
    <div
      ref={scrollerRef}
      className={`testi-scroller ${row.direction === 'right' ? 'scroll-right' : 'scroll-left'}`}
      style={{ '--scroll-duration': row.speed }}
    >
      <div className="testi-track">
        {cards.map((t, index) => <TestimonialCard key={`${row.id}-${index}`} t={t} />)}
        {cards.map((t, index) => <TestimonialCard key={`${row.id}-duplicate-${index}`} t={t} />)}
      </div>
    </div>
  )
}

export default function Testimonials() {
  const { heading, subheading, reviews } = data.testimonials

  const sectionRef = useRef(null)
  const eyebrowRef = useRef(null)

  useTypingAnimation(eyebrowRef, 'testimonials', { trigger: sectionRef })

  const half = Math.ceil(reviews.length / 2)
  const rows = [
    { id: 'row-1', direction: 'left', speed: '45s', testimonials: reviews.slice(0, half) },
    { id: 'row-2', direction: 'right', speed: '60s', testimonials: reviews.slice(half) },
  ]

  return (
    <section id="testimonials" className="section" ref={sectionRef}>
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow" ref={eyebrowRef}>
          testimonials
        </div>
        <h2 className="sec-h">{heading}</h2>
        <p className="sec-p">{subheading}</p>
      </div>
      <div className="testi-rows-container" data-fade>
        {rows.map((row) => <TestimonialRow key={row.id} row={row} />)}
      </div>
    </section>
  )
}