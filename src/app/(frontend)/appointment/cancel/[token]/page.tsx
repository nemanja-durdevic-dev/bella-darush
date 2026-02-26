import { getAppointmentByToken } from '../../actions'
import { notFound } from 'next/navigation'
import type { Service, Worker, Customer } from '@/payload-types'
import { CancelAppointmentButton } from './CancelAppointmentButton'
import { AlertTriangle, Calendar, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { formatServiceNames } from '../../utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatAppointmentDateNorwegian,
  getNowInAppointmentTimezone,
  toAppointmentDateKey,
} from '@/lib/appointmentDate'

function formatPrice(price: number): string {
  return `${price} kr`
}

export default async function CancelAppointmentPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Fetch appointment by token
  const result = await getAppointmentByToken(token)

  if (!result.success || !result.appointment) {
    notFound()
  }

  const appointment = result.appointment

  // Type assertions for populated fields
  const services = Array.isArray(appointment.service)
    ? (appointment.service as Service[])
    : [appointment.service as Service]
  const worker = appointment.worker as Worker
  const customer = appointment.customer as Customer
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)
  const totalPrice = services.reduce((sum, service) => sum + service.price, 0)

  // Check if already cancelled
  if (appointment.status === 'cancelled') {
    return (
      <div className="mx-auto max-w-[600px] space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/80 text-red-200">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Avtale allerede avbestilt
        </h1>
        <p className="text-slate-600">Denne avtalen har allerede blitt avbestilt.</p>

        <CancelAppointmentButton token={token} customerName={customer.name} />

        <Button
          variant="ghost"
          className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          asChild
        >
          <Link href="/appointment">Book ny avtale</Link>
        </Button>
      </div>
    )
  }

  // Check if appointment has passed
  const appointmentDateKey = toAppointmentDateKey(appointment.appointmentDate)
  const nowInTimezone = getNowInAppointmentTimezone()

  const appointmentHasPassed =
    appointmentDateKey < nowInTimezone.date ||
    (appointmentDateKey === nowInTimezone.date && appointment.appointmentTime < nowInTimezone.time)

  if (appointmentHasPassed) {
    return (
      <div className="mx-auto max-w-[600px] space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/80 text-red-200">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Avtale har allerede funnet sted
        </h1>
        <p className="text-slate-600">
          Denne avtalen kan ikke avbestilles da den allerede har funnet sted.
        </p>

        <Button
          variant="ghost"
          className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          asChild
        >
          <Link href="/appointment">Book ny avtale</Link>
        </Button>
      </div>
    )
  }

  // Show cancellation confirmation page
  return (
    <div className="mx-auto max-w-[600px] space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#c89e58] text-black">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Avbestill din avtale</h1>

      <Card className="border-slate-200 bg-white text-left text-slate-900 shadow-none">
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-6">
            <div className="text-center">
              <Calendar className="mx-auto mb-2 h-5 w-5 text-slate-600" />
              <div className="text-sm font-medium text-slate-600">
                {serviceNames} • {totalDuration} minutter • {formatPrice(totalPrice)}
              </div>
            </div>

            <div className="text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-slate-600" />
              <div className="text-sm font-semibold text-slate-900">
                {formatAppointmentDateNorwegian(appointment.appointmentDate)} •{' '}
                {appointment.appointmentTime}
              </div>
            </div>

            <div className="text-center">
              <User className="mx-auto mb-2 h-5 w-5 text-slate-600" />
              <div className="text-sm text-slate-600">{worker.name}</div>
            </div>
          </div>

          {appointment.notes && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-1 text-xs font-medium text-slate-600">DINE NOTATER</div>
              <p className="m-0 text-sm text-slate-700">{appointment.notes}</p>
            </div>
          )}

          <div className="rounded-lg border border-[#c89e58]/50 bg-[#c89e58]/20 p-4 text-center">
            <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-[#e5be7d]" />
            <div className="text-sm leading-relaxed text-[#f3dfbd]">
              <strong>Viktig:</strong> Hvis du avbestiller denne avtalen, vil du motta en
              bekreftelse på e-post. Vennligst gi beskjed minst 24 timer i forveien hvis mulig.
            </div>
          </div>
        </CardContent>
      </Card>

      <CancelAppointmentButton token={token} customerName={customer.name} />

      <Button
        variant="ghost"
        className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        asChild
      >
        <Link href="/appointment">Tilbake til forsiden</Link>
      </Button>
    </div>
  )
}
