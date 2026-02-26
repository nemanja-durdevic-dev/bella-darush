'use client'

import { Scissors } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-16 items-end py-8">
          {/* Logo/Brand */}
          <Link
            href="/"
            className=" w-fit text-white text-4xl  flex justify-between gap-2 items-center font-thin"
          >
            <span>bella</span>
            <span>/</span>
            <Scissors className="relative top-1   w-7 h-7 font-light -rotate-45" />
          </Link>

          {/* Navigation */}
          <nav className=" w-full hidden md:flex items-center justify-between">
            <div className="flex gap-10 items-center">
              <Link
                href="/"
                className={`text-gray-300 text-lg hover:text-white transition ${
                  pathname === '/' ? 'font-bold text-white' : ''
                }`}
              >
                Hjem
              </Link>
              <Link
                href="#about"
                className={`text-gray-300 text-lg hover:text-white transition ${
                  pathname === '/about' ? 'font-bold text-white' : ''
                }`}
              >
                Om oss
              </Link>
              <Link
                href="#services"
                className={`text-gray-300 text-lg hover:text-white transition ${
                  pathname === '/services' ? 'font-bold text-white' : ''
                }`}
              >
                Tjenester
              </Link>
              <Link
                href="#contact"
                className={`text-gray-300 text-lg hover:text-white transition ${
                  pathname === '/contact' ? 'font-bold text-white' : ''
                }`}
              >
                Kontakt oss
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
