import data from '../data.json'

export default function Services() {
  const services = data.services

  return (
    <section id="services" className="section">
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">02</span>
          services
        </div>
        <h2 className="sec-h">What I build.</h2>
      </div>

      <div className="svc-grid" data-stagger>
        {services.map((s) => (
          <div key={s.num} className="svc-cell">
            <div className="svc-hover-bg" />
            <div className="svc-num">{s.num}</div>
            <div className="svc-icon" aria-hidden="true">{s.icon}</div>
            <div className="svc-title">{s.title}</div>
            <div className="svc-desc">{s.desc}</div>
            <div className="svc-arrow" aria-hidden="true">→</div>
          </div>
        ))}
      </div>
    </section>
  )
}
