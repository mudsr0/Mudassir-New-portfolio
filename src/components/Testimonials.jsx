const testimonials = [
  {
    initials: 'JA',
    name: 'Justin Ash',
    role: 'Robbins Pest Control, USA',
    quote:
      'Faiq delivered our entire email automation and domain setup in days. Professional, fast, and the system works flawlessly. Will definitely work with him again.',
  },
  {
    initials: 'MP',
    name: 'Michael Pritsky',
    role: 'Vocalis / MYNTZ INC',
    quote:
      'Most developers promise results. Faiq actually delivers. The EHR integration he built handles everything automatically — it saved us countless hours every week.',
  },
  {
    initials: 'BT',
    name: 'Brad Tucker',
    role: 'Senior Pros Home Care, USA',
    quote:
      'Faiq migrated our entire phone system to OpenPhone smoothly. Zero downtime, zero complications. The whole setup was handled with great attention to detail.',
  },
  {
    initials: 'MG',
    name: 'Mike Godleski',
    role: 'Prepare2Swim',
    quote:
      'Working with Faiq and the DevRolin team has been excellent. They understand what we need quickly and execute without back-and-forth. Genuinely impressive work.',
  },
]

export default function Testimonials() {
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
