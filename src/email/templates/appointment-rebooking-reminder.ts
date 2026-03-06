/**
 * Appointment Rebooking Reminder Email Template
 * Sent to customers 30 days after their appointment
 */

import type { Appointment, Customer, Service, Worker } from '../../payload-types'
import { emailStyles, formatDate, formatServiceNames, htmlEmailWrapper } from '../utils'

export interface RebookingReminderEmailData {
  appointment: Appointment
  customer: Customer
  services: Service[]
  worker: Worker
}

/**
 * Generate HTML version of rebooking reminder email
 */
export function generateRebookingReminderHTML(data: RebookingReminderEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const bookingUrl = `${baseUrl}/appointment`

  const content = `
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.title}">Tid for en ny avtale? ✨</h1>
      <p style="${emailStyles.subtitle}">Det har gått 30 dager siden sist besøk</p>
    </div>

    <div style="${emailStyles.success}">
      <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 18px;">
        Hei ${customer.name}!
      </p>
      <p style="margin: 10px 0 0 0; color: #475569;">
        Vi håper du var fornøyd med besøket ditt hos oss. Kanskje det er tid for en ny time?
      </p>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">📌 Sist avtale</h2>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Tjeneste:</span>
        <span style="${emailStyles.value}"><strong>${serviceNames}</strong></span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Dato:</span>
        <span style="${emailStyles.value}"><strong>${formatDate(appointment.appointmentDate)}</strong></span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Behandler:</span>
        <span style="${emailStyles.value}"><strong>${worker.name}</strong></span>
      </div>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 30px 0; text-align: center;">
      <h2 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px; font-weight: 600;">
        Book neste avtale
      </h2>
      <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">
        Sikre deg ønsket tidspunkt ved å booke neste time allerede nå.
      </p>
      <a href="${bookingUrl}" style="${emailStyles.button}">
        Book ny avtale
      </a>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
        Dette er en automatisk generert e-post
      </p>
    </div>
  `

  return htmlEmailWrapper(content, 'Tid for en ny avtale hos Bella Darush')
}

/**
 * Generate plain text version of rebooking reminder email
 */
export function generateRebookingReminderText(data: RebookingReminderEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const bookingUrl = `${baseUrl}/appointment`

  return `
TID FOR EN NY AVTALE?
====================

Hei ${customer.name}!

Det har gått 30 dager siden sist besøk hos oss, og vi håper du var fornøyd.
Kanskje det er tid for en ny time?


SIST AVTALE
-----------
Tjeneste:   ${serviceNames}
Dato:       ${formatDate(appointment.appointmentDate)}
Behandler:  ${worker.name}


BOOK NESTE AVTALE
-----------------
Book ny time her:

${bookingUrl}

---
Dette er en automatisk generert e-post
  `.trim()
}

/**
 * Generate email subject line
 */
export function generateRebookingReminderSubject(data: RebookingReminderEmailData): string {
  const { services } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  return `Tid for ny avtale? ${serviceNames}`
}
