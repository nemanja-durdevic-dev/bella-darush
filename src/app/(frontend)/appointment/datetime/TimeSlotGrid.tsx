'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAvailableTimeSlotsForDate } from '../actions'
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
const WEEKDAY_LABELS = ['man', 'tir', 'ons', 'tor', 'fre', 'lør', 'søn'] as const
const DAY_FORMATTER = new Intl.DateTimeFormat('nb-NO', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
})
const MONTH_FORMATTER = new Intl.DateTimeFormat('nb-NO', {
  month: 'long',
  year: 'numeric',
})

type DaySlotsData = {
  timeslots: string[]
  slotWorkerMap: Record<string, string>
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getCalendarGridStart(monthDate: Date) {
  const monthStart = getMonthStart(monthDate)
  const mondayIndex = (monthStart.getDay() + 6) % 7
  const gridStart = new Date(monthStart)
  gridStart.setDate(monthStart.getDate() - mondayIndex)
  return gridStart
}

function getCalendarGridEnd(monthDate: Date) {
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  const sundayOffset = (7 - ((monthEnd.getDay() + 6) % 7) - 1 + 7) % 7
  const gridEnd = new Date(monthEnd)
  gridEnd.setDate(monthEnd.getDate() + sundayOffset)
  return gridEnd
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function TimeSlotGrid({
  serviceIds,
  selectedWorkerId,
  workers,
  today,
  totalPrice,
}: TimeSlotGridProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [selectedDate, setSelectedDate] = useState(today)
  const [displayedMonth, setDisplayedMonth] = useState<Date>(() => fromDateKey(today))
  const [slotsByDate, setSlotsByDate] = useState<Record<string, DaySlotsData>>({})
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [shouldFocusSlots, setShouldFocusSlots] = useState(false)
  const timeslotSectionRef = useRef<HTMLDivElement | null>(null)

  const selectedWorker = workers.find((worker) => worker.id === selectedWorkerId)
  const selectedDateData = slotsByDate[selectedDate]
  const selectedTimeslots = selectedDateData?.timeslots ?? []
  const selectedDateLabel = DAY_FORMATTER.format(fromDateKey(selectedDate)).replace(
    /^\p{L}/u,
    (char) => char.toUpperCase(),
  )

  const todayDate = useMemo(() => fromDateKey(today), [today])
  const minMonth = useMemo(
    () => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1),
    [todayDate],
  )
  const canGoPrevMonth = displayedMonth > minMonth

  const servicesKey = useMemo(() => serviceIds.join('|'), [serviceIds])

  const calendarDays = useMemo(() => {
    const start = getCalendarGridStart(displayedMonth)
    const end = getCalendarGridEnd(displayedMonth)
    const days: Date[] = []
    const cursor = new Date(start)

    while (cursor <= end) {
      days.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }

    return days
  }, [displayedMonth])

  useEffect(() => {
    const imageUrls = workers
      .map((worker) => worker.imageUrl)
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl))

    imageUrls.forEach((url) => {
      const preloader = new window.Image()
      preloader.src = url
    })
  }, [workers])

  useEffect(() => {
    setSlotsByDate({})
    setSlotsError(null)
  }, [servicesKey, selectedWorkerId])

  useEffect(() => {
    let isMounted = true

    async function fetchSlotsForSelectedDate() {
      if (!selectedDate) return
      if (slotsByDate[selectedDate]) return

      setIsLoadingSlots(true)
      setSlotsError(null)

      try {
        const data = await getAvailableTimeSlotsForDate(serviceIds, selectedDate, selectedWorkerId)

        if (!isMounted) return

        setSlotsByDate((previous) => ({
          ...previous,
          [selectedDate]: data,
        }))
      } catch (error) {
        if (!isMounted) return

        console.error('Failed to fetch slots:', error)
        setSlotsError('Kunne ikke hente ledige tider. Prøv igjen.')
        setSlotsByDate((previous) => ({
          ...previous,
          [selectedDate]: { timeslots: [], slotWorkerMap: {} },
        }))
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false)
        }
      }
    }

    fetchSlotsForSelectedDate()

    return () => {
      isMounted = false
    }
  }, [selectedDate, selectedWorkerId, serviceIds, slotsByDate])

  useEffect(() => {
    if (!shouldFocusSlots || !selectedDateData || isLoadingSlots) return

    timeslotSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setShouldFocusSlots(false)
  }, [isLoadingSlots, selectedDateData, shouldFocusSlots])

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
    const workerId = selectedWorkerId ?? selectedDateData?.slotWorkerMap?.[time]
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
      <div className="mb-10 flex items-center justify-between bg-white">
        <span className="text-sm text-slate-600">Velg person:</span>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[150px] justify-between border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="flex items-center gap-2">
                {selectedWorker?.imageUrl ? (
                  <Image
                    src={selectedWorker.imageUrl}
                    alt={selectedWorker.name}
                    width={24}
                    height={24}
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
                  className={`h-auto min-h-16 w-full max-w-full justify-start gap-4 whitespace-normal border border-slate-300 bg-white px-4 py-4 text-slate-900 hover:bg-slate-50 hover:text-slate-900 ${worker.description ? 'items-start' : 'items-center'}`}
                  onClick={() => handleWorkerSelect(worker.id)}
                >
                  {worker.imageUrl ? (
                    <Image
                      src={worker.imageUrl}
                      alt={worker.name}
                      width={40}
                      height={40}
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

      <div className="space-y-10 ">
        <div className="bg-white">
          <div className="mb-3 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-9 border-slate-300 bg-white p-0 text-slate-900 hover:bg-slate-50 disabled:opacity-40"
              disabled={!canGoPrevMonth}
              onClick={() => setDisplayedMonth((current) => addMonths(current, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Forrige måned</span>
            </Button>
            <p className="text-sm font-semibold capitalize text-slate-900">
              {MONTH_FORMATTER.format(displayedMonth)}
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-9 border-slate-300 bg-white p-0 text-slate-900 hover:bg-slate-50"
              onClick={() => setDisplayedMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Neste måned</span>
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wide text-slate-500">
            {WEEKDAY_LABELS.map((day) => (
              <span key={day} className="py-2">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dateKey = toDateKey(date)
              const inCurrentMonth = sameMonth(date, displayedMonth)
              const isPast = dateKey < today
              const isSelected = selectedDate === dateKey
              const isDisabled = !inCurrentMonth || isPast
              const isToday = dateKey === today
              const isLoadingSelectedDate = isSelected && isLoadingSlots && !selectedDateData

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    setSelectedDate(dateKey)
                    setShouldFocusSlots(true)
                  }}
                  className={`h-11 border text-sm transition-colors ${
                    isSelected
                      ? 'border-[#c89e58] bg-[#c89e58]/20 text-slate-900'
                      : isDisabled
                        ? 'border-slate-200 bg-slate-50 text-slate-300'
                        : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{date.getDate()}</span>
                  {isLoadingSelectedDate ? (
                    <span className="mx-auto mt-1 block h-3 w-3 rounded-full border-2 border-[#c89e58]/30 border-t-[#c89e58] animate-spin" />
                  ) : isToday ? (
                    <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-[#c89e58]" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div ref={timeslotSectionRef} className="space-y-2">
          <div className="sticky top-0 z-10 bg-white py-1">
            <h3 className="text-sm font-semibold text-slate-900">{selectedDateLabel}</h3>
          </div>

          {isLoadingSlots && !selectedDateData ? (
            <Card className="text-slate-900 shadow-none">
              <CardContent className="py-6 text-center text-slate-600">
                <p className='animate-pulse'>Henter ledige tider...</p>
              </CardContent>
            </Card>
          ) : selectedTimeslots.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {selectedTimeslots.map((time) => (
                <Button
                  key={`${selectedDate}-${time}`}
                  type="button"
                  variant="outline"
                  className="h-auto justify-between border-slate-300 bg-white py-3 text-slate-900 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => handleTimeSelect(selectedDate, time)}
                >
                  <span className="font-medium">{time}</span>
                  <span className="text-sm text-[#c89e58]">{`${totalPrice} kr`}</span>
                </Button>
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 bg-white text-slate-900 shadow-none">
              <CardContent className="py-6 text-center text-slate-600">
                <p>{slotsError ?? 'Ingen ledige tider denne dagen.'}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
