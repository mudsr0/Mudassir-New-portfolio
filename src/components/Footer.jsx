const links = [
  { label: 'upwork',   href: 'https://upwork.com' },
  { label: 'linkedin', href: 'https://linkedin.com' },
  { label: 'github',   href: 'https://github.com' },
  { label: 'email',    href: 'mailto:hello@devrolin.com' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <span className="footer-copy">© {year} Faiq · DevRolin</span>
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
