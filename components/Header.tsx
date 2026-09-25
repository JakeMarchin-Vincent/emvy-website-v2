'use client'

import { CAL_CONSULT_URL } from '@/lib/cal-links'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const desktopNav = (
    <>
      <Link className="nav-link" href="/services">Services</Link>

      <Link className="nav-link" href="/use-cases">
        Use Cases
      </Link>

      <Link className="nav-link" href="/about">
        About
      </Link>
      <Link className="nav-link" href="/contact">
        Contact
      </Link>
</>
  )

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="EMVY — AI systems home">
        <img src="/brand/logo-transparent.png" alt="EMVY" className="brand-img" />
      </Link>

      <nav className="nav">
        <div className="desktop-only">{desktopNav}</div>
      </nav>

      <div className="header-actions">
        <Link href="/contact#local-consult" className="button light small" onClick={() => setMobileOpen(false)}>
          Local consult
        </Link>
        <a
          href={CAL_CONSULT_URL}
          className="button primary small"
          target="_blank"
          rel="noopener noreferrer"
        >
          Online consult
        </a>
      </div>
      <button className="menu-button" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen ? (
        <div className="mobile-menu">
          <Link href="/services" onClick={() => setMobileOpen(false)}>Services</Link>
          <Link href="/use-cases" onClick={() => setMobileOpen(false)}>Use Cases</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
        </div>
      ) : null}
    </header>
  )
}
