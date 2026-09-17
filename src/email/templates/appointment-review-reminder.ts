/**
 * Appointment Review Reminder Email Template
 * Sent to customers after their appointment to request a Google review.
 */

import type { Appointment, Customer, Service, Worker } from '../../payload-types'
import { emailStyles, formatDate, formatServiceNames, htmlEmailWrapper } from '../utils'

const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJpdIkYjETQUYR001GTnx1NiI'

export interface ReviewReminderEmailData {
  appointment: Appointment
  customer: Customer
  services: Service[]
  worker: Worker
}

export function generateReviewReminderHTML(data: ReviewReminderEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))

  const content = `
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.title}">Takk for besøket!</h1>
      <p style="${emailStyles.subtitle}">Din tilbakemelding betyr mye for oss</p>
    </div>

    <div style="${emailStyles.success}">
      <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 18px;">
        Hei ${customer.name}!
      </p>
      <p style="margin: 10px 0 0 0; color: #475569;">
        Takk for at du besøkte Bella Frisør i dag. Hvis du var fornøyd med besøket,
        setter vi stor pris på om du vil legge igjen en anmeldelse på Google.
      </p>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">Din avtale</h2>

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
        Legg igjen en Google-anmeldelse
      </h2>
      <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">
        Det tar bare et øyeblikk, og hjelper andre kunder med å finne oss.
      </p>
      <a href="${GOOGLE_REVIEW_URL}" style="${emailStyles.button}">
        Skriv en anmeldelse
      </a>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
        Dette er en automatisk generert e-post
      </p>
    </div>
  `

  return htmlEmailWrapper(content, 'Takk for besøket hos Bella Frisør')
}

export function generateReviewReminderText(data: ReviewReminderEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))

  return `
TAKK FOR BESØKET!
=================

Hei ${customer.name}!

Takk for at du besøkte Bella Frisør i dag. Hvis du var fornøyd med besøket,
setter vi stor pris på om du vil legge igjen en anmeldelse på Google.


DIN AVTALE
----------
Tjeneste:   ${serviceNames}
Dato:       ${formatDate(appointment.appointmentDate)}
Behandler:  ${worker.name}


SKRIV EN ANMELDELSE
-------------------
Legg igjen en Google-anmeldelse her:

${GOOGLE_REVIEW_URL}

---
Dette er en automatisk generert e-post
  `.trim()
}

export function generateReviewReminderSubject(): string {
  return 'Takk for besøket hos Bella Frisør'
}
