import { getServices } from '../actions'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default async function ServiceSelectionPage() {
  const services = await getServices()

  async function selectService(formData: FormData) {
    'use server'
    const serviceIds = formData.getAll('service').map(String).filter(Boolean)

    if (serviceIds.length === 0) {
      redirect('/appointment/service')
    }

    const query = new URLSearchParams()
    for (const serviceId of serviceIds) {
      query.append('service', serviceId)
    }

    redirect(`/appointment/datetime?${query.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg en tjeneste</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hvilken tjeneste ønsker du?</p>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Ingen tjenester tilgjengelige for øyeblikket</p>
          </CardContent>
        </Card>
      ) : (
        <form action={selectService} className="group space-y-3">
          {services.map((service) => (
            <Label
              key={service.id}
              htmlFor={`service-${service.id}`}
              className="flex cursor-pointer items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <input
                  id={`service-${service.id}`}
                  type="checkbox"
                  name="service"
                  value={service.id}
                  className="h-4 w-4 rounded border-input"
                />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{service.name}</p>
                  <span className="text-sm text-muted-foreground">
                    {service.duration} min • {service.price} kr
                  </span>
                </div>
              </div>
            </Label>
          ))}

          <Button
            type="submit"
            className="mt-2 hidden w-full group-has-[input[name='service']:checked]:inline-flex sm:w-auto"
          >
            Fortsett
          </Button>
        </form>
      )}
    </div>
  )
}
