'use client'

import type { FormEvent } from 'react'
import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Service } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type ServiceSelectionFormProps = {
  services: Service[]
}

export function ServiceSelectionForm({ services }: ServiceSelectionFormProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement | null>(null)
  const [buttonBounds, setButtonBounds] = useState({ left: 0, width: 0 })

  const hasSelection = selectedServiceIds.length > 0

  useEffect(() => {
    function updateButtonBounds() {
      if (!formRef.current) return

      const formRect = formRef.current.getBoundingClientRect()
      setButtonBounds({ left: formRect.left, width: formRect.width })
    }

    updateButtonBounds()
    window.addEventListener('resize', updateButtonBounds)

    return () => {
      window.removeEventListener('resize', updateButtonBounds)
    }
  }, [])

  function toggleService(serviceId: string) {
    setSelectedServiceIds((previous) =>
      previous.includes(serviceId)
        ? previous.filter((id) => id !== serviceId)
        : [...previous, serviceId],
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!hasSelection) {
      event.preventDefault()
    }
  }

  return (
    <form
      ref={formRef}
      action="/appointment/datetime"
      method="get"
      onSubmit={handleSubmit}
      className="space-y-3 pb-36 sm:pb-28"
    >
      {services.map((service) => {
        const serviceId = String(service.id)
        const isChecked = selectedServiceIds.includes(serviceId)

        return (
          <Label
            key={serviceId}
            htmlFor={`service-${serviceId}`}
            className="flex w-full cursor-pointer items-center justify-between border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <input
                id={`service-${serviceId}`}
                type="checkbox"
                name="service"
                value={serviceId}
                checked={isChecked}
                onChange={() => toggleService(serviceId)}
                className="h-4 w-4 border border-slate-300 accent-[#c89e58]"
              />
              <p className="text-sm font-medium text-slate-900">{service.name}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-slate-600">
                {service.duration} min • {service.price} kr
              </span>
            </div>
          </Label>
        )
      })}

      <AnimatePresence initial={false}>
        {hasSelection ? (
          <motion.div
            key="submit-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white/95 pb-[calc(env(safe-area-inset-bottom)+0.875rem)] backdrop-blur-sm"
          >
            <div style={{ marginLeft: buttonBounds.left, width: buttonBounds.width }}>
              <Button
                type="submit"
                className="h-12 w-full border border-[#c89e58] bg-[#c89e58] px-8 text-base text-black transition hover:bg-[#b98e49]"
              >
                Fortsett
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
