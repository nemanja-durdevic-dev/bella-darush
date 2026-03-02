import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '../components/BackButton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <BackButton disabled href={`/appointment`} />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Bekreft bestilling</h1>
      <p className="text-sm text-slate-600">
        Fyll inn dine opplysninger for å fullføre bestillingen
      </p>
      <Card className="border-none bg-white text-slate-900 shadow-none rounded-none">
        <CardContent className="space-y-4 py-6 px-0">
          <div className="h-10 animate-pulse bg-slate-100" />
          <div className="h-10 animate-pulse bg-slate-100" />
          <div className="h-10 animate-pulse bg-slate-100" />
          <div className="h-10 animate-pulse bg-slate-100" />
          <div className="h-10 animate-pulse bg-slate-100" />
          <div className="h-10 animate-pulse bg-slate-100" />
          <div className="h-10 animate-pulse bg-slate-100" />
          <div className="h-10 animate-pulse bg-slate-100" />
        </CardContent>
      </Card>
    </div>
  )
}
