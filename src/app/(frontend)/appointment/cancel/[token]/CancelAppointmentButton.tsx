'use client'

import { useTransition } from 'react'
import { cancelAppointmentByToken } from '../../actions'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CancelAppointmentButtonProps {
  token: string
  customerName: string
}

export function CancelAppointmentButton({ token, customerName }: CancelAppointmentButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCancel = () => {
    if (!confirm(`Er du sikker på at du vil avbestille denne Avtalen, ${customerName}?`)) {
      return
    }

    startTransition(async () => {
      const result = await cancelAppointmentByToken(token)

      if (result.success) {
        // Redirect to success page
        router.push('/appointment/cancel/success')
      } else {
        // Handle specific errors
        if (result.error === 'already_cancelled' || result.error === 'appointment_passed') {
          // Refresh to show updated view
          router.refresh()
        } else {
          // For other errors, alert user
          alert(
            typeof result.error === 'string'
              ? result.error
              : 'Kunne ikke avbestille avtalen. Vennligst prøv igjen eller kontakt oss.',
          )
        }
      }
    })
  }

  return (
    <Button
      onClick={handleCancel}
      disabled={isPending}
      variant="destructive"
      className="w-full border border-red-500/60 bg-red-700 text-white hover:bg-red-800"
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Avbestiller...</span>
        </>
      ) : (
        <>
          <X className="h-5 w-5" />
          <span>Avbestill avtale</span>
        </>
      )}
    </Button>
  )
}
