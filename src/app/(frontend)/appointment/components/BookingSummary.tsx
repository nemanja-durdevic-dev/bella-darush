import type { BookingSummaryProps } from '../types'
import { formatServiceNames } from '../utils'
import { formatAppointmentDateNorwegian } from '@/lib/appointmentDate'
import { Card, CardContent } from '@/components/ui/card'

export function BookingSummary({ services, worker, date, time }: BookingSummaryProps) {
  const totalPrice = services.reduce((sum, item) => sum + item.price, 0)
  const serviceNames = formatServiceNames(services.map((item) => item.name))

  return (
    <Card className="mb-6 border-slate-200 bg-white text-slate-900 shadow-none">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between border-b border-slate-200 py-3">
          <span className="text-sm text-slate-600">Tjeneste</span>
          <span className="text-right font-medium">{serviceNames}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 py-3">
          <span className="text-sm text-slate-600">Behandler</span>
          <span className="text-right font-medium">{worker.name}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 py-3">
          <span className="text-sm text-slate-600">Tidspunkt</span>
          <span className="text-right font-medium">
            <span className="capitalize">{formatAppointmentDateNorwegian(date)}</span>{' '}
            <span>kl. {time}</span>
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-slate-600">Pris</span>
          <span className="text-right font-semibold text-[#c89e58]">{totalPrice} kr</span>
        </div>
      </CardContent>
    </Card>
  )
}
