import { getAppointmentById } from '../actions'
import { successStepSchema } from '../validation'
import { redirect, notFound } from 'next/navigation'
import { Check } from 'lucide-react'
import Link from 'next/link'
import type { Service, Worker, Customer } from '@/payload-types'
import { formatServiceNames } from '../utils'
import { formatAppointmentDateNorwegian } from '@/lib/appointmentDate'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams

  // Validate searchParams
  const validation = successStepSchema.safeParse(params)
  if (!validation.success) {
    redirect('/appointment/service')
  }

  const { id } = validation.data

  // Fetch appointment with populated relationships
  const appointment = await getAppointmentById(id)

  if (!appointment) {
    notFound()
  }

  // Type assertion for populated fields
  const services = Array.isArray(appointment.service)
    ? (appointment.service as Service[])
    : [appointment.service as Service]
  const worker = appointment.worker as Worker
  const customer = appointment.customer as Customer
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalPrice = services.reduce((sum, service) => sum + service.price, 0)

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e3f1e1] text-[#68e72c]">
        <Check className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Bestilling bekreftet!
      </h1>
      <p className="text-slate-600">Takk, {customer.name}! Din bestilling er bekreftet!</p>
      <p className="text-sm text-slate-600">
        En bekreftelse vil bli sendt til <strong>{customer.email}</strong>
      </p>

      <Card className="border-slate-200 bg-white text-left text-slate-900 shadow-none">
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
              <span className="capitalize">
                {formatAppointmentDateNorwegian(appointment.appointmentDate)}
              </span>{' '}
              <span>kl. {appointment.appointmentTime}</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-600">Pris</span>
            <span className="text-right font-semibold text-[#c89e58]">{totalPrice} kr</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Button
          className="border border-[#c89e58] bg-[#c89e58] text-black transition hover:bg-[#b98e49]"
          asChild
        >
          <Link href="/appointment/service">Bestill ny time</Link>
        </Button>

        {appointment.cancellationToken && (
          <Button
            variant="ghost"
            className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            asChild
          >
            <Link href={`/appointment/cancel/${appointment.cancellationToken}`}>
              Trenger du å avbestille denne avtalen?
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
