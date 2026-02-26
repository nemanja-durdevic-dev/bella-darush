import { getServicesByIds, getWorkerById } from '../actions'
import { confirmStepSchema } from '../validation'
import { redirect, notFound } from 'next/navigation'
import { BackButton } from '../components/BackButton'
import { BookingSummary } from '../components/BookingSummary'
import { CustomerForm } from './CustomerForm'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    service?: string | string[]
    worker?: string
    date?: string
    time?: string
  }>
}) {
  const params = await searchParams

  // Validate searchParams
  const validation = confirmStepSchema.safeParse(params)
  if (!validation.success) {
    redirect('/appointment/service')
  }

  const { service: serviceIds, worker: workerId, date, time } = validation.data

  const serviceQuery = new URLSearchParams()
  for (const serviceId of serviceIds) {
    serviceQuery.append('service', serviceId)
  }

  // Fetch data in parallel
  const [services, worker] = await Promise.all([
    getServicesByIds(serviceIds),
    getWorkerById(workerId),
  ])

  if (!services.length || !worker) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <BackButton href={`/appointment/datetime?${serviceQuery.toString()}&worker=${workerId}`} />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Bekreft bestilling</h1>
      <p className="text-sm text-muted-foreground">
        Fyll inn dine opplysninger for å fullføre bestillingen
      </p>

      <BookingSummary services={services} worker={worker} date={date} time={time} />

      <CustomerForm serviceIds={serviceIds} workerId={workerId} date={date} time={time} />
    </div>
  )
}
