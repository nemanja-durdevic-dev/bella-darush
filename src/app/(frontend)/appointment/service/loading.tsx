import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg en tjeneste</h1>
        <p className="mt-2 text-sm text-slate-600">Hvilken tjeneste ønsker du?</p>
      </div>

      <div className="space-y-3 pb-36 sm:pb-28">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <section key={groupIndex} className="space-y-2">
            <div className="sticky top-0 z-20 flex w-full items-center justify-between border border-slate-200 bg-white px-4 py-3">
              <div className="h-3 w-28 animate-pulse bg-slate-200" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-64 animate-pulse bg-slate-200" />

              {Array.from({ length: groupIndex === 0 ? 4 : 3 }).map((_, itemIndex) => (
                <Card
                  key={itemIndex}
                  className="border border-slate-200 bg-white text-slate-900 shadow-none rounded-none"
                >
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse border border-slate-300 bg-slate-100" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="h-4 w-40 animate-pulse bg-slate-200" />
                          <div className="h-4 w-24 shrink-0 animate-pulse bg-slate-200" />
                        </div>
                        <div className="h-3 w-full max-w-md animate-pulse bg-slate-100" />
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-4">
                      <div className="ml-auto h-8 w-40 animate-pulse bg-slate-100" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
