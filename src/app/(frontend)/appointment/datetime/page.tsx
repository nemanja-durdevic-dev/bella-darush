import {
  getServicesByIds,
  getWorkersForServices,
  getAvailableTimeSlotsForNext9Days,
} from '../actions'
import { datetimeStepSchema } from '../validation'
import { redirect } from 'next/navigation'
import { BackButton } from '../components/BackButton'
import { TimeSlotGrid } from './TimeSlotGrid'
import { Card, CardContent } from '@/components/ui/card'

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

  // Get current time for filtering past slots
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const today = now.toISOString().split('T')[0]

  const workerWeekSlots = await Promise.all(
    workers.map(async (worker) => ({
      workerId: worker.id,
      weekSlots: await getAvailableTimeSlotsForNext9Days(worker.id, serviceIds, today, currentTime),
    })),
  )

  const slotWorkerMap: Record<string, string> = {}

  const weekSlots = selectedWorkerId
    ? (workerWeekSlots.find((entry) => entry.workerId === selectedWorkerId)?.weekSlots ?? [])
    : (() => {
        const slotsByDay = new Map<string, Set<string>>()

        for (const entry of workerWeekSlots) {
          for (const daySlot of entry.weekSlots) {
            if (!slotsByDay.has(daySlot.day)) {
              slotsByDay.set(daySlot.day, new Set())
            }

            const daySet = slotsByDay.get(daySlot.day)!
            for (const time of daySlot.timeslots) {
              daySet.add(time)
              const key = `${daySlot.day}|${time}`
              if (!slotWorkerMap[key]) {
                slotWorkerMap[key] = entry.workerId
              }
            }
          }
        }

        return Array.from(slotsByDay.entries()).map(([day, timeslots]) => ({
          day,
          timeslots: Array.from(timeslots).sort(),
        }))
      })()

  const totalPrice = services.reduce((sum, service) => sum + (service.price ?? 0), 0)

  return (
    <div className="space-y-4">
      <BackButton href={`/appointment/service`} />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg tid</h1>
      <TimeSlotGrid
        serviceIds={serviceIds}
        selectedWorkerId={selectedWorkerId}
        workers={workers.map((worker) => ({
          id: worker.id,
          name: worker.name,
          imageUrl:
            worker.profileImage && typeof worker.profileImage !== 'string'
              ? (worker.profileImage.url ?? undefined)
              : undefined,
        }))}
        weekSlots={weekSlots}
        slotWorkerMap={slotWorkerMap}
        totalPrice={totalPrice}
      />
    </div>
  )
}
