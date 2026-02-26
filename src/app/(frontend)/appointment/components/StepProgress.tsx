'use client'

import { usePathname } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

const stepConfig: Record<string, { number: number; total: number; hide?: boolean }> = {
  '/appointment/service': { number: 1, total: 3 },
  '/appointment/datetime': { number: 2, total: 3 },
  '/appointment/confirm': { number: 3, total: 3 },
  '/appointment/success': { number: 3, total: 3, hide: true },
}

export function StepProgress() {
  const pathname = usePathname()
  const step = stepConfig[pathname as keyof typeof stepConfig]

  // Don't show progress on success page or unknown routes
  if (!step || step.hide) {
    return null
  }

  const progress = (step.number / step.total) * 100

  return (
    <div className="mb-8 space-y-2">
      <span className="text-sm text-muted-foreground">
        Steg {step.number} av {step.total}
      </span>
      <Progress value={progress} />
    </div>
  )
}
