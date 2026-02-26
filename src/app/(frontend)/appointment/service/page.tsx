import { getServices } from '../actions'
import { Card, CardContent } from '@/components/ui/card'
import { ServiceSelectionForm } from './ServiceSelectionForm'

export default async function ServiceSelectionPage() {
  const services = await getServices()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg en tjeneste</h1>
        <p className="mt-2 text-sm text-slate-600">Hvilken tjeneste ønsker du?</p>
      </div>

      {services.length === 0 ? (
        <Card className="border-slate-200 bg-white text-slate-900 shadow-none">
          <CardContent className="py-8 text-center text-slate-600">
            <p>Ingen tjenester tilgjengelige for øyeblikket</p>
          </CardContent>
        </Card>
      ) : (
        <ServiceSelectionForm services={services} />
      )}
    </div>
  )
}
