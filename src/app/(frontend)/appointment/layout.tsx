import React from 'react'
import { StepProgress } from './components/StepProgress'
import Link from 'next/link'
import { House } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Bestill time | Service App',
  description: 'Bestill time online enkelt og raskt',
}

export default function AppointmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pt-5 sm:px-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label="Til forsiden">
            <House className="h-5 w-5" />
          </Link>
        </Button>
      </div>
      <main className="mx-auto w-full max-w-3xl px-4 pb-14 pt-4 sm:px-6 sm:pt-6">
        <div className="mx-auto w-full max-w-xl">
          <StepProgress />
          {children}
        </div>
      </main>
    </div>
  )
}
