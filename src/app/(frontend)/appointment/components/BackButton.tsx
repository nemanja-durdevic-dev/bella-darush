'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'

interface BackButtonProps extends Omit<ButtonProps, 'asChild'> {
  href: string
  disabled?: boolean
}

export function BackButton({ href, disabled, ...props }: BackButtonProps) {
  const content = (
    <>
      <ChevronLeft className="h-4 w-4" />
      Tilbake
    </>
  )

  if (disabled) {
    return (
      <Button
        variant="ghost"
        className="mb-3 h-auto px-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
        disabled
        {...props}
      >
        {content}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      className="mb-3 h-auto px-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
      asChild
      {...props}
    >
      <Link href={href}>{content}</Link>
    </Button>
  )
}
