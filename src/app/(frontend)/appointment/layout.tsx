import React from 'react'
import { StepProgress } from './components/StepProgress'
import Link from 'next/link'
import { Scissors } from 'lucide-react'

export const metadata = {
  title: 'Bestill time | Service App',
  description: 'Bestill time online enkelt og raskt',
}

export default function AppointmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="w-fit text-black text-3xl flex justify-between gap-2 items-center font-thin"
        >
          <span>bella</span>
          <span>/</span>
          <Scissors className="relative top-1 w-6 h-6 font-light -rotate-45" />
        </Link>
      </div>
      <main className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto w-full rounded-2xl bg-white">
          <StepProgress />
          {children}
        </div>
      </main>
    </div>
  )
}
