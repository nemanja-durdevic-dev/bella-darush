import {
  getServicesByIds,
  getWorkersForServices,
} from '../actions'
import { datetimeStepSchema } from '../validation'
import { redirect } from 'next/navigation'
import { BackButton } from '../components/BackButton'
import { TimeSlotGrid } from './TimeSlotGrid'
import { Card, CardContent } from '@/components/ui/card'
import { getNowInAppointmentTimezone } from '@/lib/appointmentDate'

export default async function DateTimeSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[]; worker?: string }>
}) {
  const params = await searchParams

  // Validate searchParams
  const validation = datetimeStepSchema.safeParse(params)
  if (!validation.success) {
    redirect('/appointment/service')
  }

  const { service: serviceIds, worker: workerId } = validation.data

  const services = await getServicesByIds(serviceIds)

  if (!services.length) {
    redirect('/appointment/service')
  }

  const workers = await getWorkersForServices(serviceIds)
  if (!workers.length) {
    return (
      <div className="space-y-4">
        <BackButton href="/appointment/service" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg tid</h1>
        <Card className="border-slate-200 bg-white text-slate-900 shadow-none">
          <CardContent className="py-8 text-center text-slate-600">
            <p>Ingen behandlere er tilgjengelige for de valgte tjenestene akkurat nå.</p>
            <p className="mt-2 text-sm">Prøv å velge en annen tjeneste.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedWorkerId =
    workerId && workers.some((worker) => worker.id === workerId) ? workerId : undefined

  // Use booking timezone to prevent server-timezone drift in production
  const nowInTimezone = getNowInAppointmentTimezone()
  const today = nowInTimezone.date

  const totalPrice = services.reduce((sum, service) => sum + (service.price ?? 0), 0)

  return (
    <div className="space-y-4">
      <BackButton href={`/appointment/service`} />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg dato og tid</h1>
      <TimeSlotGrid
        serviceIds={serviceIds}
        selectedWorkerId={selectedWorkerId}
        workers={workers.map((worker) => ({
          id: worker.id,
          name: worker.name,
          description: worker.description,
          imageUrl:
            worker.profileImage && typeof worker.profileImage !== 'string'
              ? (worker.profileImage.url ?? undefined)
              : undefined,
        }))}
        today={today}
        totalPrice={totalPrice}
      />
    </div>
  )
}
