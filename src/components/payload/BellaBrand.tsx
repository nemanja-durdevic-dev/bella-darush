import { Scissors } from 'lucide-react'
import Link from 'next/link'

export function BellaLogo() {
  return (
    <Link
      href="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '3rem',
        fontWeight: 300,
        lineHeight: 1,
        color: 'var(--theme-text)',
        textDecoration: 'none',
      }}
    >
      <span>bella</span>
      <span>/</span>
      <Scissors size={36} strokeWidth={1.5} style={{ transform: 'rotate(-45deg)', marginTop: '0.2rem' }} />
    </Link>
  )
}

export function BellaIcon() {
  return (
    <img
      src="/icon.ico"
      alt="Bella icon"
      width={28}
      height={28}
      style={{ display: 'block', borderRadius: '4px' }}
    />
  )
}
