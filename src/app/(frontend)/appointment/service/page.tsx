import { getServiceGroupsForBooking } from '../actions'
import { Card, CardContent } from '@/components/ui/card'
import { ServiceSelectionForm } from './ServiceSelectionForm'
import type { Service, ServiceGroup } from '@/payload-types'

type GroupedServices = {
  id: string
  name: string
  description?: string | null
  services: Service[]
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
        <ServiceSelectionForm groupedServices={groupedServices} />
      )}
    </div>
  )
}
