import config from '@/payload.config'
import { getPayload } from 'payload'
import type { Service, ServiceGroup } from '@/payload-types'

function extractTextFromNodes(nodes: unknown): string {
  if (!Array.isArray(nodes)) return ''

  const values: string[] = []

  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue

    const text = (node as { text?: unknown }).text
    if (typeof text === 'string' && text.trim()) {
      values.push(text.trim())
    }

    const children = (node as { children?: unknown }).children
    const nestedText = extractTextFromNodes(children)
    if (nestedText) {
      values.push(nestedText)
    }
  }

  return values.join(' ').replace(/\s+/g, ' ').trim()
}

function getServiceDescription(service: Service): string {
  return extractTextFromNodes(service.description?.root?.children)
}

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

async function getActiveServiceGroups(): Promise<GroupedServices[]> {
  try {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'service-groups',
      where: {
        isActive: {
          equals: true,
        },
      },
      sort: 'sortOrder',
      depth: 1,
      limit: 100,
    })

    return mapGroupsForDisplay(docs)
  } catch (error) {
    console.error('Failed to fetch active service groups:', error)
    return []
  }
}

const Services = async () => {
  const groupedServices = await getActiveServiceGroups()

  return (
    <section id="services" className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-[95rem] px-6">
        <h2 className="text-lg font-bold tracking-wider text-gray-800">VÅRE TJENESTER</h2>
        {/* <p className="mt-3 max-w-2xl text-3xl font-bold tracking-wide text-black">
          Velg blant våre behandlinger
        </p> */}

        {groupedServices.length === 0 ? (
          <p className="mt-8 text-base text-gray-600">Ingen tjenester tilgjengelig akkurat nå.</p>
        ) : (
          <div className="mt-10 space-y-14">
            {groupedServices.map((group) => (
              <div key={group.id}>
                <h3 className="text-2xl font-semibold tracking-wide text-black underline">{group.name}</h3>
                {group.description ? (
                  <p className="mt-2 max-w-3xl text-sm text-gray-700">{group.description}</p>
                ) : null}

                <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-2">
                  {group.services.map((service) => {
                    const description = getServiceDescription(service)
                    return (
                      <article key={service.id}>
                        <div className="flex items-end">
                          <h4 className="text-xl font-semibold text-black">{service.name}</h4>
                          <span className="mx-3 mb-1 flex-1 border-b border-dotted border-gray-300" />
                          <p className="text-base text-[#c89e58] font-medium">{service.price} kr</p>
                        </div>
                        {description ? (
                          <p className="mt-3 text-sm text-gray-700">{description}</p>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Services
