import data from '../data.json'

export default function Footer() {
  const links = data.footer.links
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <span className="footer-copy">© {year} Mudassir · DevRolin</span>
      <nav className="footer-links" aria-label="Social links">
        {links.map((l) => (
          <a key={l.label} href={l.href} className="footer-link"
            target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}
