import type { BookingSummaryProps } from '../types'
import { formatServiceNames } from '../utils'
import { formatAppointmentDateNorwegian } from '@/lib/appointmentDate'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function BookingSummary({ services, worker, date, time }: BookingSummaryProps) {
  const totalPrice = services.reduce((sum, item) => sum + item.price, 0)
  const serviceNames = formatServiceNames(services.map((item) => item.name))
  const appointmentDateTime = `${formatAppointmentDateNorwegian(date)} kl. ${time}`

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="booking-summary-service" className="text-slate-700">
          Tjeneste
        </Label>
        <Input
          id="booking-summary-service"
          value={serviceNames}
          disabled
          readOnly
          className="border-slate-300 bg-slate-50 text-slate-900 disabled:opacity-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-summary-worker" className="text-slate-700">
          Behandler
        </Label>
        <Input
          id="booking-summary-worker"
          value={worker.name}
          disabled
          readOnly
          className="border-slate-300 bg-slate-50 text-slate-900 disabled:opacity-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-summary-time" className="text-slate-700">
          Tidspunkt
        </Label>
        <Input
          id="booking-summary-time"
          value={appointmentDateTime}
          disabled
          readOnly
          className="capitalize border-slate-300 bg-slate-50 text-slate-900 disabled:opacity-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-summary-price" className="text-slate-700">
          Pris
        </Label>
        <Input
          id="booking-summary-price"
          value={`${totalPrice} kr`}
          disabled
          readOnly
          className="border-slate-300 bg-slate-50 font-semibold text-[#c89e58] disabled:opacity-100"
        />
      </div>
    </div>
  )
}
