'use client'

import { useActionState } from 'react'
import { createAppointment } from '../actions'
import { ErrorMessage } from '../components/ErrorMessage'
import type { CustomerFormProps, AppointmentActionResult } from '../types'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const initialState: AppointmentActionResult = {
  success: false,
}

export function CustomerForm({ serviceIds, workerId, date, time }: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState(createAppointment, initialState)
  const router = useRouter()

  // Redirect to success page when appointment is created
  useEffect(() => {
    if (state.success && state.data?.appointmentId) {
      router.push(`/appointment/success?id=${state.data.appointmentId}`)
    }
  }, [state.success, state.data?.appointmentId, router])

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden fields for appointment details */}
      {serviceIds.map((id) => (
        <input key={id} type="hidden" name="service" value={id} />
      ))}
      <input type="hidden" name="worker" value={workerId} />
      <input type="hidden" name="appointmentDate" value={date} />
      <input type="hidden" name="appointmentTime" value={time} />

      {/* Show error if submission failed */}
      {state.error && <ErrorMessage error={state.error} />}

      {/* Customer information fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-slate-700">
            Fullt navn
          </Label>
          <Input
            type="text"
            id="customerName"
            name="customerName"
            required
            placeholder="Ola Nordmann"
            className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone" className="text-slate-700">
            Telefon
          </Label>
          <Input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            required
            placeholder="+47 123 45 678"
            className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerEmail" className="text-slate-700">
          E-post
        </Label>
        <Input
          type="email"
          id="customerEmail"
          name="customerEmail"
          required
          placeholder="ola@eksempel.no"
          className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-slate-700">
          Merknad <span className="text-slate-500">(valgfritt)</span>
        </Label>
        <Textarea
          id="notes"
          name="notes"
          className="min-h-[100px] border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          placeholder="Eventuelle ønsker eller informasjon..."
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        className="w-full border border-[#c89e58] bg-[#c89e58] text-black transition hover:bg-[#b98e49] sm:w-auto"
        disabled={isPending}
      >
        {isPending ? 'Bestiller...' : 'Bekreft bestilling'}
      </Button>
    </form>
  )
}
