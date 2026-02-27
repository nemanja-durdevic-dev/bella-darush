import { Scissors } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14.2 3h2.8c.2 1.5 1 2.8 2.2 3.6.8.5 1.8.8 2.8.9V10a8.3 8.3 0 0 1-5.2-1.8v7.4a5.7 5.7 0 1 1-5.7-5.7c.4 0 .8 0 1.2.1v2.9c-.4-.2-.8-.2-1.2-.2a2.8 2.8 0 1 0 2.8 2.8V3z" />
    </svg>
  )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-instagram-icon lucide-instagram"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#101010] relative pt-16">
      <div className="px-4 pt-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <div className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <Link
                href="/"
                className=" w-fit text-white text-4xl  flex justify-between gap-2 items-center -translate-y-4 font-thin"
              >
                <span>bella</span>
                <span>/</span>
                <Scissors className="relative top-1   w-7 h-7 font-light -rotate-45" />
              </Link>
            </div>
            <ul className="space-y-2 text-[#757575] mt-4 sm:mt-0">
              <li>
                <Link href="tel:+4791900738" className="block sm:inline-block">
                  <span className="text-white font-semibold text-xl sm:text-2xl">+47</span>{' '}
                  <span className="text-[#c89e58] text-xl sm:text-2xl">919-00-738</span>
                </Link>
              </li>
              <li>
                <Link href="mailto:bellaasalong@gmail.com" className="text-gray-300">
                  bellaasalong@gmail.com
                </Link>
              </li>
              <li className="text-gray-300">Kirkeveien 62, 1344 Haslum</li>
            </ul>
          </div>
          {/* Opening Hours */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg mb-4">Åpningstider</h3>
            <ul className="space-y-2 text-[#757575]">
              <li>Mandag - Fredag: 10:00 - 18:00</li>
              <li>Lørdag: 10:00 - 18:00</li>
              <li>Søndag: 12:00 - 16:00</li>
            </ul>
          </div>
          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg mb-4">Hurtiglenker</h3>
            <ul className="space-y-2 text-[#757575]">
              {/* <li>
                <Link
                  href="/"
                  className="hover:text-white transform transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Hjem
                </Link>
              </li> */}
              <li>
                <Link
                  href="#services"
                  className="hover:text-white transform transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Tjenester
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="hover:text-white transform transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Om Oss
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transform transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Personvern & Datasikkerhet
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <h3 className="text-white font-semibold text-lg mb-3">Følg oss</h3>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-gray-300">
                <Link
                  href="https://www.instagram.com/bella_frisorsalong/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-white transition"
                >
                  <InstagramIcon className="h-6 w-6" />
                </Link>
                {/* <Link
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="hover:text-white transition"
                >
                  <FacebookIcon className="h-6 w-6" />
                </Link> */}
                <Link
                  href="https://www.tiktok.com/@bella.frisorsalong"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="hover:text-white transition"
                >
                  <TikTokIcon className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link
              href="https://www.google.com/search?sca_esv=df783cd413716f53&rlz=1C5CHFA_enNO1141NO1141&sxsrf=AE3TifNjcB0JEHzHpJWk8eludDYxhmO7Ug:1760541844239&q=bella+fris%C3%B8r&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E8gYEm0xoXEKal6uZS06_HejATD4OxBYEwFoWMvjIB-ho8FJEMZw9l6HQgAgJHfG9yUVkZ0%3D&uds=AOm0WdEIj9g-vUBM9sRrloPAoQ3Gw3KOLql2o4H3UpY--kodfMeVD_xyMCOEpLkD6Jg6fBg3Du0U_vkLLErepNkoW03dcHVu2sH8UXjAuVY2wpw1hxhi1UU&sa=X&ved=2ahUKEwjmyfO5waaQAxUDKBAIHUXHLhEQ3PALegQINBAF&biw=1339&bih=743&dpr=2"
              target="_blank"
            >
              <Image
                src="/google-logo.webp"
                alt="logo"
                width={150}
                height={150}
                className="mx-auto sm:mx-0"
              />
              <div className="flex gap-2 items-center">
                <span className="text-gray-300">Reviews</span>
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className="text-yellow-500">
                    ★
                  </span>
                ))}
                <span className="underline text-gray-300">5,0</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 text-white text-center py-4">
          <p className="text-sm sm:text-base">
            © {new Date().getFullYear()} Bella Frisørsalong. Alle rettigheter reservert.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
