import { BackButton } from '../components/BackButton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <BackButton disabled href="/appointment/datetime" />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Bekreft bestilling</h1>
      <p className="text-sm text-slate-600">
        Fyll inn dine opplysninger for å fullføre bestillingen
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-20 animate-pulse bg-slate-200" />
            <div className="h-10 animate-pulse border border-slate-300 bg-slate-50" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse bg-slate-200" />
            <div className="h-10 animate-pulse border border-slate-300 bg-white" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse bg-slate-200" />
            <div className="h-10 animate-pulse border border-slate-300 bg-white" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse bg-slate-200" />
          <div className="h-10 animate-pulse border border-slate-300 bg-white" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse bg-slate-200" />
          <div className="h-[100px] animate-pulse border border-slate-300 bg-white" />
        </div>

        <div className="h-12 w-full animate-pulse border border-[#c89e58] bg-[#c89e58]/60" />
      </div>
    </div>
  )
}
