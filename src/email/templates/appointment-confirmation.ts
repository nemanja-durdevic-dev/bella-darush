/**
 * Appointment Confirmation Email Template
 * Sent to customers when they book an appointment
 */

import type { Appointment, Customer, Service, Worker } from '../../payload-types'
import {
  emailStyles,
  formatDate,
  formatDuration,
  formatPrice,
  formatServiceNames,
  formatTime,
  htmlEmailWrapper,
} from '../utils'

export interface ConfirmationEmailData {
  appointment: Appointment
  customer: Customer
  services: Service[]
  worker: Worker
}

/**
 * Generate HTML version of confirmation email
 */
export function generateConfirmationHTML(data: ConfirmationEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)
  const totalPrice = services.reduce((sum, service) => sum + service.price, 0)

  // Generate cancellation URL
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const cancellationUrl = `${baseUrl}/appointment/cancel/${appointment.cancellationToken}`

  const content = `
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.title}">Bestilling Bekreftet! ✓</h1>
      <p style="${emailStyles.subtitle}">Din avtale er registrert</p>
    </div>

    <div style="${emailStyles.success}">
      <p style="margin: 0; color: #0f172a; font-weight: 600;">
        Hei ${customer.name}!
      </p>
      <p style="margin: 10px 0 0 0; color: #475569;">
        Takk for din bestilling. Vi gleder oss til å se deg!
      </p>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">📋 Avtaledetaljer</h2>
      
      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Tjeneste:</span>
        <span style="${emailStyles.value}"><strong>${serviceNames}</strong></span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Dato:</span>
        <span style="${emailStyles.value}"><strong>${formatDate(appointment.appointmentDate)}</strong></span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Tid:</span>
        <span style="${emailStyles.value}"><strong>${formatTime(appointment.appointmentTime)}</strong></span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Varighet:</span>
        <span style="${emailStyles.value}">${formatDuration(totalDuration)}</span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Pris:</span>
        <span style="${emailStyles.value}"><strong>${formatPrice(totalPrice)}</strong></span>
      </div>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">👤 Din behandler</h2>
      
      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Navn:</span>
        <span style="${emailStyles.value}"><strong>${worker.name}</strong></span>
      </div>
    </div>

    ${
      appointment.notes
        ? `
    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">📝 Dine notater</h2>
      <p style="margin: 0; color: #475569;">${appointment.notes}</p>
    </div>
    `
        : ''
    }

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 30px 0; text-align: center;">
      <h2 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px; font-weight: 600;">
        Trenger du å avbestille eller endre tiden?
      </h2>
      <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">
        Du kan enkelt avbestille avtalen din ved å klikke på knappen nedenfor.
      </p>
      <a href="${cancellationUrl}" style="${emailStyles.button}">
        Avbestill avtale
      </a>
      <p style="margin: 15px 0 0 0; color: #64748b; font-size: 12px;">
        Vennligst gi beskjed minst 24 timer i forveien hvis mulig.
      </p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0 0 10px 0;">
        Har du spørsmål? Ta kontakt med oss.
      </p>
      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
        Dette er en automatisk generert e-post
      </p>
    </div>
  `

  return htmlEmailWrapper(
    content,
    `Din avtale er bekreftet for ${formatDate(appointment.appointmentDate)} kl. ${formatTime(appointment.appointmentTime)}`,
  )
}

/**
 * Generate plain text version of confirmation email
 */
export function generateConfirmationText(data: ConfirmationEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)
  const totalPrice = services.reduce((sum, service) => sum + service.price, 0)

  // Generate cancellation URL
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const cancellationUrl = `${baseUrl}/appointment/cancel/${appointment.cancellationToken}`

  return `
BESTILLING BEKREFTET
=====================

Hei ${customer.name}!

Takk for din bestilling. Vi gleder oss til å se deg!


AVTALEDETALJER
--------------
Tjeneste:   ${serviceNames}
Dato:       ${formatDate(appointment.appointmentDate)}
Tid:        ${formatTime(appointment.appointmentTime)}
Varighet:   ${formatDuration(totalDuration)}
Pris:       ${formatPrice(totalPrice)}


DIN BEHANDLER
-------------
Navn:       ${worker.name}

${appointment.notes ? `\nDINE NOTATER\n------------\n${appointment.notes}\n` : ''}

TRENGER DU Å AVBESTILLE ELLER ENDRE TIDEN?
-------------------------------------------
Du kan enkelt avbestille avtalen din ved å klikke på lenken nedenfor:

${cancellationUrl}

Vennligst gi beskjed minst 24 timer i forveien hvis mulig.


Har du spørsmål? Ta kontakt med oss.

---
Dette er en automatisk generert e-post 
  `.trim()
}

/**
 * Generate email subject line
 */
export function generateConfirmationSubject(data: ConfirmationEmailData): string {
  const { appointment, services } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  return `Bestilling bekreftet: ${serviceNames} - ${formatDate(appointment.appointmentDate)}`
}
