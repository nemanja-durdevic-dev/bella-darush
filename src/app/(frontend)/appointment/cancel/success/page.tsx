import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function CancellationSuccessPage() {
  return (
    <div className="mx-auto max-w-[600px] space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Avtale avbestilt</h1>
      <p className="text-muted-foreground">
        Din avtale har blitt avbestilt. Du vil motta en bekreftelse på e-post.
      </p>

      <Card>
        <CardContent className="py-8">
          <p className="m-0 text-muted-foreground">Vi håper å se deg igjen snart!</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/appointment">Book ny avtale</Link>
        </Button>

        <Button variant="ghost" asChild>
          <Link href="/appointment">Tilbake til forsiden</Link>
        </Button>
      </div>
    </div>
  )
}
