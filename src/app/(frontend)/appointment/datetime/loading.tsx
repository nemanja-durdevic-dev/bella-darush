import { BackButton } from '../components/BackButton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <BackButton disabled href="/appointment/service" />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Velg dato og tid</h1>

      <div className="mb-6 flex items-center justify-between gap-3 bg-white">
        <span className="text-sm text-slate-600">Velg person:</span>
        <div className="h-10 w-40 animate-pulse bg-slate-200" />
      </div>

      <div className="space-y-6">
        <div className="bg-white">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-9 w-9 animate-pulse bg-slate-200" />
            <div className="h-5 w-32 animate-pulse bg-slate-200" />
            <div className="h-9 w-9 animate-pulse bg-slate-200" />
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-6 animate-pulse bg-slate-100" />
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse bg-slate-100" />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-5 w-36 animate-pulse bg-slate-200" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="flex h-12 items-center justify-between border border-slate-200 px-4"
                key={index}
              >
                <div className="h-3 w-16 animate-pulse bg-slate-200" />
                <div className="h-3 w-14 animate-pulse bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
