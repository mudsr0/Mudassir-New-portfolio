import data from '../data.json'

const TestimonialCard = ({ t }) => (
  <div className="testi-card">
    <div className="testi-stars" aria-label="5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="star">★</span>
      ))}
    </div>
    
    <p className="testi-quote">"{t.quote}"</p>
    
    <div className="testi-author">
      {t.avatarUrl ? (
        <img 
          src={t.avatarUrl} 
          alt={t.name} 
          className="testi-avatar-img" 
          loading="lazy"
        />
      ) : (
        <div className="testi-avatar" aria-hidden="true">
          {t.initials}
        </div>
      )}
      <div className="testi-info">
        <div className="testi-name">{t.name}</div>
        <div className="testi-role">{t.role}</div>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  const testimonialsData = data.testimonials;

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
        {testimonialsData.rows.map((row) => (
          <div 
            key={row.id} 
            className={`testi-scroller ${row.direction === 'right' ? 'scroll-right' : 'scroll-left'}`}
            style={{ '--scroll-duration': row.speed }}
          >
            <div className="testi-track">
              {/* Render original items with index-based key */}
              {row.testimonials.map((t, index) => (
                <TestimonialCard key={`${row.id}-card-${index}`} t={t} />
              ))}
              {/* Duplicate items for seamless scroll with unique duplicate keys */}
              {row.testimonials.map((t, index) => (
                <TestimonialCard key={`${row.id}-card-dup-${index}`} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}