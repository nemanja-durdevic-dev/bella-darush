import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="mx-auto max-w-[600px] space-y-4 text-center">
      <div className="mx-auto h-16 w-16 animate-pulse bg-slate-200" />
      <div className="mx-auto h-9 w-56 animate-pulse bg-slate-200" />
      <div className="mx-auto h-5 w-72 animate-pulse bg-slate-200" />

      <Card className="border-slate-200 bg-white text-slate-900 shadow-none rounded-none">
        <CardContent className="py-8">
          <div className="mx-auto h-5 w-56 animate-pulse bg-slate-200" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="h-11 animate-pulse bg-slate-200" />
        <div className="h-10 animate-pulse bg-slate-100" />
      </div>
    </div>
  )
}
