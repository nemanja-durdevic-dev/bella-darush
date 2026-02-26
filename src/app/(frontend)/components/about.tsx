import React from 'react'
import Image from 'next/image'

const About = () => {
  return (
    <div id="about">
      <div className="w-full max-w-[95rem] mx-auto flex flex-col md:flex-row pt-16 md:pt-24">
        <div className="w-full flex justify-center items-center h-full px-6">
          <Image
            src="/salon-img.jpg"
            alt="about"
            width={500}
            height={500}
            className="w-full max-w-[400px] md:max-w-[500px] h-auto rounded shadow"
          />
        </div>
        <div className="w-full py-10 md:py-20 px-6 md:px-10 space-y-6 md:space-y-8">
          <h2 className="text-lg text-gray-800 font-bold tracking-wider text-left pt-5">OM OSS</h2>
          <p className="text-left tracking-wide font-bold text-3xl md:text-4xl">
            VI TILPASSER TJENESTENE TIL DINE BEHOV!
          </p>

          <p className="text-left text-base md:text-lg font-thin tracking-wider text-black">
            Vi er dedikerte til å skape den perfekte frisøropplevelsen for deg. Vårt team av erfarne
            frisører kombinerer tradisjonelle teknikker med moderne trender for å gi deg den stilen
            du ønsker. Vi fokuserer på kvalitet og personlig service i hvert eneste klipp.
          </p>
          <p className="text-left font-medium tracking-widerfont-bold">
            Vi tilbyr fleksible løsninger tilpasset dine behov, med praktiske timebestillinger og
            profesjonell service.
          </p>
          <div className="relative">
            <Image
              src="/about-shape.png.webp"
              className="relative bottom-8 md:bottom-16"
              alt="about"
              width={1000}
              height={1000}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
