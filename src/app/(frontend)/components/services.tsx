import config from '@/payload.config'
import { getPayload } from 'payload'
import type { Service } from '@/payload-types'

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

async function getActiveServices(): Promise<Service[]> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'services',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: 'name',
    limit: 100,
  })

  return docs
}

const Services = async () => {
  const services = await getActiveServices()

  return (
    <section id="services" className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-[95rem] px-6">
        <h2 className="text-lg font-bold tracking-wider text-gray-800">VÅRE TJENESTER</h2>
        {/* <p className="mt-3 max-w-2xl text-3xl font-bold tracking-wide text-black">
          Velg blant våre behandlinger
        </p> */}

        {services.length === 0 ? (
          <p className="mt-8 text-base text-gray-600">Ingen tjenester tilgjengelig akkurat nå.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-14 gap-y-14 md:grid-cols-2">
            {services.map((service) => (
              <article key={service.id}>
                <div className="flex items-end">
                  <h3 className="text-xl font-semibold text-black">{service.name}</h3>
                  <span className="mx-3 mb-1 flex-1 border-b border-dotted border-gray-300" />
                  <p className="text-base text-[#c89e58] font-medium">{service.price} kr</p>
                </div>
                {getServiceDescription(service) ? (
                  <p className="mt-3 text-sm text-gray-700">{getServiceDescription(service)}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Services
