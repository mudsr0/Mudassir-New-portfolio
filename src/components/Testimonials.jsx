import { memo, useRef } from 'react'
import data from '../data.json'
import usePauseOnHidden from '../hooks/usePauseOnHidden'

const STARS = ['★', '★', '★', '★', '★']

const TestimonialCard = memo(function TestimonialCard({ t }) {
  return (
    <div className="testi-card">
      <div className="testi-stars" aria-label="5 stars">
        {STARS.map((star, i) => <span key={i} className="star">{star}</span>)}
      </div>
      <p className="testi-quote">"{t.quote}"</p>
      <div className="testi-author">
        {t.avatarUrl ? (
          <img src={t.avatarUrl} alt={t.name} className="testi-avatar-img" loading="lazy" decoding="async" />
        ) : (
          <div className="testi-avatar" aria-hidden="true">{t.initials}</div>
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
  const rows = data.testimonials.rows

  return (
    <section id="testimonials" className="section">
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">05</span>
          testimonials
        </div>
        <h2 className="sec-h">Client words.</h2>
      </div>
      <div className="testi-rows-container" data-fade>
        {rows.map((row) => <TestimonialRow key={row.id} row={row} />)}
      </div>
    </section>
  )
}