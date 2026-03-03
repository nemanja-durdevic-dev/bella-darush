/**
 * Appointment Reminder Email Template
 * Sent to customers 24 hours before their appointment
 */

import type { Appointment, Customer, Service, Worker } from '../../payload-types'
import {
  emailStyles,
  formatDate,
  formatDuration,
  formatServiceNames,
  formatTime,
  htmlEmailWrapper,
} from '../utils'

export interface ReminderEmailData {
  appointment: Appointment
  customer: Customer
  services: Service[]
  worker: Worker
}

/**
 * Generate HTML version of reminder email
 */
export function generateReminderHTML(data: ReminderEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const cancellationUrl = `${baseUrl}/appointment/cancel/${appointment.cancellationToken}`

  const content = `
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.title}">Påminnelse: Din avtale i morgen! ⏰</h1>
      <p style="${emailStyles.subtitle}">Vi ser frem til å se deg</p>
    </div>

    <div style="${emailStyles.success}">
      <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 18px;">
        Hei ${customer.name}!
      </p>
      <p style="margin: 10px 0 0 0; color: #475569;">
        Dette er en påminnelse om din kommende avtale i morgen.
      </p>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">📅 Din avtale</h2>
      
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
        <span style="${emailStyles.value}"><strong style="font-size: 20px; color: #c89e58;">${formatTime(appointment.appointmentTime)}</strong></span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Varighet:</span>
        <span style="${emailStyles.value}">${formatDuration(totalDuration)}</span>
      </div>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">👤 Din behandler</h2>
      
      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Navn:</span>
        <span style="${emailStyles.value}"><strong>${worker.name}</strong></span>
      </div>
    </div>

    <div style="${emailStyles.warning}">
      <p style="margin: 0 0 10px 0; color: #0f172a; font-weight: 600;">
        💡 Husk!
      </p>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Vennligst møt opp 5 minutter før avtalt tid. Hvis du trenger å avbestille, må det gjøres minst 3 timer før avtalen starter.
      </p>
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
        Trenger du å avbestille?
      </h2>
      <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">
        Du kan avbestille avtalen din med lenken nedenfor. Avbestilling må skje minst 3 timer før avtalen starter.
      </p>
      <a href="${cancellationUrl}" style="${emailStyles.button}">
        Avbestill avtale
      </a>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
        Dette er en automatisk generert e-post
      </p>
    </div>
  `

  return htmlEmailWrapper(
    content,
    `Påminnelse: Din avtale i morgen kl. ${formatTime(appointment.appointmentTime)}`,
  )
}

/**
 * Generate plain text version of reminder email
 */
export function generateReminderText(data: ReminderEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const cancellationUrl = `${baseUrl}/appointment/cancel/${appointment.cancellationToken}`

  return `
PÅMINNELSE: DIN AVTALE I MORGEN
================================

Hei ${customer.name}!

Dette er en påminnelse om din kommende avtale i morgen.


DIN AVTALE
----------
Tjeneste:   ${serviceNames}
Dato:       ${formatDate(appointment.appointmentDate)}
Tid:        ${formatTime(appointment.appointmentTime)}
Varighet:   ${formatDuration(totalDuration)}


DIN BEHANDLER
-------------
Navn:       ${worker.name}


HUSK!
-----
Vennligst møt opp 5 minutter før avtalt tid. Hvis du trenger å avbestille
må det gjøres minst 3 timer før avtalen starter.

${appointment.notes ? `\nDINE NOTATER\n------------\n${appointment.notes}\n` : ''}

AVBESTILLINGSLENKE
------------------
Du kan avbestille avtalen din her:

${cancellationUrl}

Avbestilling må skje minst 3 timer før avtalen starter.

---
Dette er en automatisk generert e-post
  `.trim()
}

/**
 * Generate email subject line
 */
export function generateReminderSubject(data: ReminderEmailData): string {
  const { appointment, services } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  return `Påminnelse: ${serviceNames} i morgen kl. ${formatTime(appointment.appointmentTime)}`
}
