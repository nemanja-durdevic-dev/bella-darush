import React from 'react'
import './styles.css'
import { Metadata } from 'next/dist/lib/metadata/types/metadata-interface'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['200'],
})

export const metadata: Metadata = {
  title: 'Bella Frisør',
  description:
    'Moderne barbersalong med eksperter i hårklipp og skjeggpleie, hvor du kan booke time online for en stilfull opplevelse.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  )
}
