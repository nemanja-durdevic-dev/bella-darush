'use client'

import type { FormEvent } from 'react'
import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { Service } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type RichTextNode = {
  text?: string
  children?: unknown
}

function extractTextFromRichTextNode(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const typedNode = node as RichTextNode
  const ownText = typeof typedNode.text === 'string' ? typedNode.text : ''
  const childrenText = Array.isArray(typedNode.children)
    ? typedNode.children.map(extractTextFromRichTextNode).join(' ')
    : ''

  return [ownText, childrenText].filter(Boolean).join(' ').trim()
}

function getServiceDescriptionText(service: Service): string {
  if (!service.description?.root) return ''

  return extractTextFromRichTextNode(service.description.root).replace(/\s+/g, ' ').trim()
}

type ServiceSelectionFormProps = {
  groupedServices: Array<{
    id: string
    name: string
    description?: string | null
    services: Service[]
  }>
  nextAvailableLabelByServiceId?: Record<string, string | null>
}

export function ServiceSelectionForm({
  groupedServices,
  nextAvailableLabelByServiceId = {},
}: ServiceSelectionFormProps) {
  const router = useRouter()
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [selectedServiceGroupById, setSelectedServiceGroupById] = useState<Record<string, string>>(
    {},
  )
  const [stickyHeaderByGroupId, setStickyHeaderByGroupId] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement | null>(null)
  const headerRefs = useRef<Record<string, HTMLDivElement | null>>({})
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

  useEffect(() => {
    function updateStickyHeaders() {
      const nextStickyState: Record<string, boolean> = {}

      for (const group of groupedServices) {
        const header = headerRefs.current[group.id]
        if (!header) {
          nextStickyState[group.id] = false
          continue
        }

        const rect = header.getBoundingClientRect()
        nextStickyState[group.id] = rect.top <= 0 && rect.bottom > 0
      }

      setStickyHeaderByGroupId(nextStickyState)
    }

    updateStickyHeaders()
    window.addEventListener('scroll', updateStickyHeaders, { passive: true })
    window.addEventListener('resize', updateStickyHeaders)

    return () => {
      window.removeEventListener('scroll', updateStickyHeaders)
      window.removeEventListener('resize', updateStickyHeaders)
    }
  }, [groupedServices])

  function toggleService(serviceId: string, groupId: string) {
    const isAlreadySelected = selectedServiceIds.includes(serviceId)

    if (isAlreadySelected) {
      setSelectedServiceIds((previous) => previous.filter((id) => id !== serviceId))
      setSelectedServiceGroupById((previous) => {
        const next = { ...previous }
        delete next[serviceId]
        return next
      })
      return
    }

    setSelectedServiceIds((previous) => [...previous, serviceId])
    setSelectedServiceGroupById((previous) => ({
      ...previous,
      [serviceId]: groupId,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasSelection) {
      return
    }

    const query = new URLSearchParams()
    selectedServiceIds.forEach((serviceId) => {
      query.append('service', serviceId)
    })

    router.push(`/appointment/datetime?${query.toString()}`)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 pb-36 sm:pb-28">
      {groupedServices.map((group) => {
        const isSticky = stickyHeaderByGroupId[group.id]

        return (
          <section key={group.id} className="space-y-2">
            <div
              ref={(element) => {
                headerRefs.current[group.id] = element
              }}
              className={`sticky top-0 z-20 flex w-full items-center justify-between border bg-white px-4 py-3 ${
                isSticky ? 'border-black' : 'border-slate-200'
              }`}
            >
              <h2
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isSticky ? 'text-black' : 'text-slate-500'
                }`}
              >
                {group.name}
              </h2>
            </div>

            <div className="space-y-2">
              {group.description ? (
                <p className="text-sm text-slate-600">{group.description}</p>
              ) : null}

              {group.services.map((service) => {
                const serviceId = String(service.id)
                const inputId = `service-${group.id}-${serviceId}`
                const selectedGroupId = selectedServiceGroupById[serviceId]
                const isSelectedAnywhere = selectedServiceIds.includes(serviceId)
                const isChecked = selectedGroupId === group.id
                const isHiddenInThisGroup = isSelectedAnywhere && selectedGroupId !== group.id

                if (isHiddenInThisGroup) {
                  return null
                }

                const fullDescription = getServiceDescriptionText(service)
                const nextAvailableLabel = nextAvailableLabelByServiceId[serviceId]

                return (
                  <Label
                    key={serviceId}
                    htmlFor={inputId}
                    className={`block w-full cursor-pointer border border-slate-200 p-4 transition-colors  ${
                      isChecked ? 'bg-[#c89e58]/20 border-[#c89e58]' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleService(serviceId, group.id)}
                        className="h-4 w-4 border border-slate-300 accent-[#c89e58]"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-slate-900">{service.name}</p>
                          <span className="shrink-0 text-sm text-slate-600">
                            {service.duration} min • {service.price} kr
                          </span>
                        </div>
                      </div>
                    </div>
                    {fullDescription ? (
                      <p className={`text-xs text-slate-500 ${isChecked ? '' : 'truncate'}`}>
                        {fullDescription}
                      </p>
                    ) : null}

                    {nextAvailableLabel ? (
                      <p className="text-xs text-slate-500 text-right border-t border-dashed border-black pt-4 mt-4">
                        Neste time:{' '}
                        <span className="p-2 bg-slate-100 text-slate-700">
                          {nextAvailableLabel}
                        </span>
                      </p>
                    ) : null}
                  </Label>
                )
              })}
            </div>
          </section>
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
