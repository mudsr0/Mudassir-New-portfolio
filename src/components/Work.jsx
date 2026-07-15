import data from '../data.json'

export default function Work() {
  const projects = data.work

  return (
    <section id="work" className="section">
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">03</span>
          selected work
        </div>
        <h2 className="sec-h">Case studies.</h2>
        <p className="sec-p">A selection of projects across AI, automation, and full-stack development.</p>
      </div>

      <div className="work-grid" data-stagger>
        {projects.map((p) => (
          <div key={p.title} className="work-card">
            <div className="wc-thumb">
              <span className="wc-tag">{p.tag}</span>
              <span className="wc-year">{p.year}</span>
              <div className="wc-icon" aria-hidden="true">{p.icon}</div>
            </div>
            <div className="wc-body">
              <div className="wc-title">{p.title}</div>
              <div className="wc-sub">{p.desc}</div>
              <div className="wc-link">
                {p.stack} <span aria-hidden="true">↗</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
