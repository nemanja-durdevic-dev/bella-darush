'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  href: string
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      className="mb-3 h-auto px-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
      asChild
    >
      <Link href={href}>
        <ChevronLeft className="h-4 w-4" />
        Tilbake
      </Link>
    </Button>
  )
}
