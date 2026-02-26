import { Scissors } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
                <a href="tel:+4791900738" className="block sm:inline-block">
                  <span className="text-white font-semibold text-xl sm:text-2xl">
                    +47
                  </span>{" "}
                  <span className="text-[#c89e58] text-xl sm:text-2xl">
                    919-00-738
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:bellaasalong@gmail.com"
                  className="text-gray-300"
                >
                  bellaasalong@gmail.com
                </a>
              </li>
              <li className="text-gray-300">Kirkeveien 62, 1344 Haslum</li>
            </ul>
          </div>
          {/* Opening Hours */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg mb-4">
              Åpningstider
            </h3>
            <ul className="space-y-2 text-[#757575]">
              <li>Mandag - Fredag: 10:00 - 18:00</li>
              <li>Lørdag: 10:00 - 18:00</li>
              <li>Søndag: 12:00 - 16:00</li>
            </ul>
          </div>
          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg mb-4">
              Hurtiglenker
            </h3>
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
            © {new Date().getFullYear()} Bella Frisørsalong. Alle rettigheter
            reservert.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;