import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto h-16 w-16 animate-pulse bg-slate-200" />
      <div className="mx-auto h-9 w-64 animate-pulse bg-slate-200" />
      <div className="mx-auto h-5 w-72 animate-pulse bg-slate-200" />

      <Card className="border-slate-200 bg-white text-left text-slate-900 shadow-none rounded-none">
        <CardContent className="space-y-3 pt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="flex items-center justify-between border-b border-slate-200 py-3"
              key={index}
            >
              <div className="h-4 w-24 animate-pulse bg-slate-200" />
              <div className="h-4 w-36 animate-pulse bg-slate-200" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="h-11 animate-pulse bg-slate-200" />
        <div className="h-10 animate-pulse bg-slate-100" />
      </div>
    </div>
  )
}
