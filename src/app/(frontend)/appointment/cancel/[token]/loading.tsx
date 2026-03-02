import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="mx-auto max-w-[600px] space-y-4 text-center">
      <Card className="border-none bg-white text-left text-slate-900 shadow-none rounded-none">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-4 w-60 animate-pulse bg-slate-200" />
            <div className="mx-auto h-4 w-56 animate-pulse bg-slate-200" />
          </div>

          <div className="space-y-3">
            <div className="h-20 animate-pulse border border-slate-200 bg-slate-50" />
            <div className="h-24 animate-pulse border border-slate-200 bg-slate-50" />
          </div>
        </CardContent>
      </Card>

      <div className="h-11 animate-pulse bg-slate-200" />
      <div className="h-10 animate-pulse bg-slate-100" />
    </div>
  )
}
