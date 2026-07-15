import data from '../data.json'

export default function TechStack() {
  const tech = data.techStack

  return (
    <section id="tech" className="section">
      <div className="tech-layout">
        <div data-fade>
          <div className="sec-eyebrow">
            <span className="eyebrow-num">04</span>
            tech stack
          </div>
          <h2 className="sec-h">My arsenal.</h2>
          <p className="tech-desc">
            Code-first always. I choose the right tool for each problem — from
            Three.js for immersive 3D to n8n for automation pipelines. No
            shortcuts, no limitations from drag-and-drop platforms.
          </p>
        </div>

        <div data-fade data-delay="0.15">
          <div className="tech-pills">
            {tech.featured.map((t) => (
              <span key={t} className="tech-pill featured">{t}</span>
            ))}
            {tech.rest.map((t) => (
              <span key={t} className="tech-pill">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
