import data from '../data.json'

export default function Testimonials() {
  const testimonials = data.testimonials

  return (
    <section id="testimonials" className="section">
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">05</span>
          testimonials
        </div>
        <h2 className="sec-h">Client words.</h2>
      </div>

      <div className="testi-grid" data-stagger>
        {testimonials.map((t) => (
          <div key={t.name} className="testi-card">
            <div className="testi-stars" aria-label="5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="star">★</span>
              ))}
            </div>
            <p className="testi-quote">"{t.quote}"</p>
            <div className="testi-author">
              <div className="testi-avatar" aria-hidden="true">{t.initials}</div>
              <div>
                <div className="testi-name">{t.name}</div>
                <div className="testi-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
