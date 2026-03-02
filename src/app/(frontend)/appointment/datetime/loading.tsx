import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '../components/BackButton'

export default function Loading() {
  return (
    <div className="space-y-2">
      <div className="space-y-4">
        <BackButton disabled href="/appointment/service" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg tid</h1>
        <div className="mb-4 flex items-center justify-between gap-3  border border-slate-200 bg-white px-4 py-5">
          <span className="text-sm text-slate-600">Velg person:</span>
          <div className="h-4 w-24 animate-pulse bg-slate-200" />
        </div>
      </div>

      <Card className="border-none bg-white text-slate-900 shadow-none rounded-none">
        <CardContent className="space-y-5 py-6 px-0">
          <div className="h-5 w-40 animate-pulse bg-slate-200" />

          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                className="flex items-center justify-between border border-slate-200 px-4 py-3"
                key={index}
              >
                <div className="space-y-2">
                  <div className="h-2 w-36 animate-pulse bg-slate-200" />
                  <div className="h-2 w-24 animate-pulse bg-slate-200" />
                </div>

                <div className="h-2 w-24 animate-pulse bg-slate-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
