import { useEffect, useState } from 'react'
import data from '../data.json'
import TechOrbitGlobe from './common/TechOrbitGlobe'

export default function TechStack() {
  const tech = data.tech
  const stack = data.techStack

  const [eyebrowNum, eyebrowLabel] = tech.eyebrow.split(' · ')

  const [activeStack, setActiveStack] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStack((prev) => (prev + 1) % data.tech.stackList.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const orbitItems = [
    ...stack.featured.map((name) => ({ name, featured: true })),
    ...stack.rest.map((name) => ({ name, featured: false })),
  ]

  return (
    <section id="tech" className="section-sm">
      <div className="tech-layout">
        <div data-fade>
          <div className="sec-eyebrow">
            <span className="eyebrow-num">{eyebrowNum}</span>
            {eyebrowLabel.toLowerCase()}
          </div>

          <h2 className="sec-h">{tech.heading}</h2>

          <p className="tech-desc">{tech.subheading}</p>

          <div className="tech-stack-fade">
            {tech.stackList.map((item, index) => (
              <div key={index} className={`tech-stack-item ${index === activeStack ? 'is-active' : ''}`}>
                <div className="tech-stack-cat">{item.category}</div>
                <div className="tech-stack-tools">{item.tools}</div>
              </div>
            ))}
          </div>
        </div>

        <div data-fade data-delay="0.15">
          <TechOrbitGlobe items={orbitItems} />
        </div>
      </div>
    </section>
  )
}