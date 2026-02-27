import { getServiceGroupsForBooking, getNextAvailableSlotsForServices } from '../actions'
import { Card, CardContent } from '@/components/ui/card'
import { ServiceSelectionForm } from './ServiceSelectionForm'
import type { Service, ServiceGroup } from '@/payload-types'
import { getNowInAppointmentTimezone } from '@/lib/appointmentDate'

type GroupedServices = {
  id: string
  name: string
  description?: string | null
  services: Service[]
}

function formatNextAvailableLabel(day: string, time: string, today: string): string {
  if (day === today) {
    return `I dag kl. ${time}`
  }

  const date = new Date(`${day}T12:00:00`)
  const dayLabel = new Intl.DateTimeFormat('nb-NO', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date)

  return `${dayLabel} kl. ${time}`
}

function mapGroupsForDisplay(groups: ServiceGroup[]): GroupedServices[] {
  return groups
    .map((group) => {
      const seenServiceIds = new Set<string>()
      const services = (group.services ?? [])
        .map((row) => row.service)
        .filter((service): service is Service => {
          if (!service || typeof service !== 'object') return false
          if (service.isActive === false) return false

          const serviceId = String(service.id)
          if (seenServiceIds.has(serviceId)) return false

          seenServiceIds.add(serviceId)
          return true
        })

      return {
        id: String(group.id),
        name: group.name,
        description: group.description,
        services,
      }
    })
    .filter((group) => group.services.length > 0)
}

export default async function ServiceSelectionPage() {
  const groups = await getServiceGroupsForBooking()
  const groupedServices = mapGroupsForDisplay(groups)

  const serviceIds = Array.from(
    new Set(
      groupedServices.flatMap((group) => group.services.map((service) => String(service.id))),
    ),
  )

  const nextAvailableByServiceId = await getNextAvailableSlotsForServices(serviceIds)
  const today = getNowInAppointmentTimezone().date

  const nextAvailableLabelByServiceId = Object.fromEntries(
    Object.entries(nextAvailableByServiceId).map(([serviceId, slot]) => [
      serviceId,
      slot ? formatNextAvailableLabel(slot.day, slot.time, today) : null,
    ]),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg en tjeneste</h1>
        <p className="mt-2 text-sm text-slate-600">Hvilken tjeneste ønsker du?</p>
      </div>

      {groupedServices.length === 0 ? (
        <Card className="border-slate-200 bg-white text-slate-900 shadow-none">
          <CardContent className="py-8 text-center text-slate-600">
            <p>Ingen tjenester tilgjengelige for øyeblikket</p>
          </CardContent>
        </Card>
      ) : (
        <ServiceSelectionForm
          groupedServices={groupedServices}
          nextAvailableLabelByServiceId={nextAvailableLabelByServiceId}
        />
      )}
    </div>
  )
}
