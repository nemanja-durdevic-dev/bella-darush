'use client'

import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'

const Landing = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/landing-page-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Black overlay */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Content goes here */}
      <div className="relative z-10 flex items-center h-full">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-white space-y-6 md:space-y-10 max-w-3xl mt-20 md:mt-20 lg:mt-56">
            <div className="space-y-4">
              <motion.h1
                className="text-4xl md:text-5xl font-thin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Bella - Stil og Elegans
              </motion.h1>
              <motion.p
                className="text-base sm:text-lg md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Vi tilpasser hårklipp til dine behov og ønsker. Våre erfarne stylister kombinerer
                kreativitet med presisjon for å skape den perfekte looken som fremhever din
                naturlige skjønnhet. Fra klassiske klipp til moderne trender - vi leverer kvalitet
                og service i en avslappende atmosfære.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/appointment/service"
                className="text-white bg-[#c89e58] transition px-6 sm:px-10 py-3 sm:py-4 hover:bg-white hover:text-black text-center"
              >
                Book Time
              </Link>

              <Link
                href={'#services'}
                className="text-white border border-white transition px-6 sm:px-10 py-3 sm:py-4 hover:bg-white hover:text-black text-center"
              >
                Våre Tjenester
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
