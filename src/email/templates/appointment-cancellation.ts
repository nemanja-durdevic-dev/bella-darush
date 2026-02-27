/**
 * Appointment Cancellation Email Template
 * Sent to customers when their appointment is cancelled
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

export interface CancellationEmailData {
  appointment: Appointment
  customer: Customer
  services: Service[]
  worker: Worker
}

/**
 * Generate HTML version of cancellation email
 */
export function generateCancellationHTML(data: CancellationEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)

  const content = `
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.title}">Avtale Avbestilt</h1>
      <p style="${emailStyles.subtitle}">Din avtale har blitt kansellert</p>
    </div>

    <div style="${emailStyles.warning}">
      <p style="margin: 0; color: #0f172a; font-weight: 600;">
        Hei ${customer.name}
      </p>
      <p style="margin: 10px 0 0 0; color: #475569;">
        Din avtale har blitt avbestilt. Vi håper å se deg igjen snart!
      </p>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">📋 Avbestilt avtale</h2>
      
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
        <span style="${emailStyles.label}">Behandler:</span>
        <span style="${emailStyles.value}">${worker.name}</span>
      </div>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">💡 Ønsker du å bestille på nytt?</h2>
      <p style="margin: 0 0 10px 0; color: #475569;">
        Vi er her for deg når du er klar! Kontakt oss for å bestille en ny tid.
      </p>
      <p style="margin: 5px 0; color: #475569;">Ta kontakt med oss for hjelp.</p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0 0 10px 0; color: #6b7280;">
        Hvis du har spørsmål om denne avbestillingen, vennligst kontakt oss.
      </p>
      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
        Dette er en automatisk generert e-post
      </p>
    </div>
  `

  return htmlEmailWrapper(
    content,
    `Din avtale for ${formatDate(appointment.appointmentDate)} kl. ${formatTime(appointment.appointmentTime)} har blitt avbestilt`,
  )
}

/**
 * Generate plain text version of cancellation email
 */
export function generateCancellationText(data: CancellationEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)

  return `
AVTALE AVBESTILT
================

Hei ${customer.name}

Din avtale har blitt avbestilt. Vi håper å se deg igjen snart!


AVBESTILT AVTALE
----------------
Tjeneste:   ${serviceNames}
Dato:       ${formatDate(appointment.appointmentDate)}
Tid:        ${formatTime(appointment.appointmentTime)}
Varighet:   ${formatDuration(totalDuration)}
Behandler:  ${worker.name}


ØNSKER DU Å BESTILLE PÅ NYTT?
------------------------------
Vi er her for deg når du er klar! Kontakt oss for å bestille en ny tid.

Ta kontakt med oss for hjelp.


Hvis du har spørsmål om denne avbestillingen, vennligst kontakt oss.

---
Dette er en automatisk generert e-post
  `.trim()
}

/**
 * Generate email subject line
 */
export function generateCancellationSubject(data: CancellationEmailData): string {
  const { appointment, services } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  return `Avtale avbestilt: ${serviceNames} - ${formatDate(appointment.appointmentDate)}`
}
