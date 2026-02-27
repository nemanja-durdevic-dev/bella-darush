'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { TimeSlotGridProps } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const ANY_WORKER_LABEL = 'Hvem som helst'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function TimeSlotGrid({
  serviceIds,
  selectedWorkerId,
  workers,
  weekSlots,
  slotWorkerMap,
  totalPrice,
}: TimeSlotGridProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const daysWithSlots = useMemo(
    () => weekSlots.filter((daySlot) => daySlot.timeslots.length > 0),
    [weekSlots],
  )
  const selectedWorker = workers.find((worker) => worker.id === selectedWorkerId)

  const getDatetimeQuery = (workerId?: string) => {
    const query = new URLSearchParams()
    for (const serviceId of serviceIds) {
      query.append('service', serviceId)
    }

    if (workerId) {
      query.set('worker', workerId)
    }

    return query
  }

  const handleWorkerSelect = (workerId?: string) => {
    const query = getDatetimeQuery(workerId)
    router.push(`/appointment/datetime?${query.toString()}`)
    setIsDialogOpen(false)
  }

  const handleTimeSelect = (date: string, time: string) => {
    const workerId = selectedWorkerId ?? slotWorkerMap[`${date}|${time}`]
    if (!workerId) {
      return
    }

    const query = getDatetimeQuery(workerId)
    query.set('date', date)
    query.set('time', time)
    router.push(`/appointment/confirm?${query.toString()}`)
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3  border border-slate-200 bg-white px-4 py-3">
        <span className="text-sm text-slate-600">Velg person:</span>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[150px] justify-between border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="flex items-center gap-2">
                {selectedWorker?.imageUrl ? (
                  <img
                    src={selectedWorker.imageUrl}
                    alt={selectedWorker.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : selectedWorker ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                    {getInitials(selectedWorker.name)}
                  </span>
                ) : null}
                <span>{selectedWorker?.name ?? ANY_WORKER_LABEL}</span>
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="top-6 translate-y-0 border-slate-200 bg-white text-slate-900 sm:top-10">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Velg person</DialogTitle>
              <DialogDescription className="text-slate-600">
                Velg en spesifikk behandler eller hvem som helst.
              </DialogDescription>
            </DialogHeader>
            <div className="grid min-w-0 gap-2">
              <Button
                type="button"
                variant={!selectedWorkerId ? 'default' : 'outline'}
                className="w-full bg-black text-white hover:bg-black/90 hover:text-white"
                onClick={() => handleWorkerSelect()}
              >
                {ANY_WORKER_LABEL}
              </Button>
              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs uppercase tracking-wide text-slate-500">eller</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              {workers.map((worker) => (
                <Button
                  key={worker.id}
                  type="button"
                  variant={selectedWorkerId === worker.id ? 'default' : 'outline'}
                  className={`h-auto min-h-16 w-full max-w-full items-start justify-start gap-4 whitespace-normal border px-4 py-4 border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-900`}
                  onClick={() => handleWorkerSelect(worker.id)}
                >
                  {worker.imageUrl ? (
                    <img
                      src={worker.imageUrl}
                      alt={worker.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                      {getInitials(worker.name)}
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col items-start text-left">
                    <span className="text-base font-medium">{worker.name}</span>
                    {worker.description ? (
                      <span className="text-xs leading-5 opacity-80">{worker.description}</span>
                    ) : null}
                  </span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {daysWithSlots.length > 0 ? (
        <div className="space-y-4">
          {daysWithSlots.map((day) => {
            const dayLabel = new Intl.DateTimeFormat('nb-NO', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
            }).format(new Date(day.day))

            return (
              <div key={day.day} className="space-y-2">
                <div className="sticky top-0 z-10 bg-white py-1">
                  <h3 className="text-sm font-semibold capitalize text-slate-900">{dayLabel}</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {day.timeslots.map((time) => (
                    <Button
                      key={`${day.day}-${time}`}
                      type="button"
                      variant="outline"
                      className="h-auto justify-between border-slate-300 bg-white py-3 text-slate-900 hover:bg-slate-50 hover:text-slate-900"
                      onClick={() => handleTimeSelect(day.day, time)}
                    >
                      <span className="font-medium">{time}</span>
                      <span className="text-sm text-[#c89e58]">{`${totalPrice} kr`}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="border-slate-200 bg-white text-slate-900 shadow-none">
          <CardContent className="py-8 text-center text-slate-600">
            <p>Ingen ledige tider tilgjengelig for valgte tjenester</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
