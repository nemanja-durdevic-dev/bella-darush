/**
 * Business Notification Email Template
 * Sent to business/worker when a new appointment is booked
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

export interface NotificationEmailData {
  appointment: Appointment
  customer: Customer
  services: Service[]
  worker: Worker
}

/**
 * Generate HTML version of business notification email
 */
export function generateNotificationHTML(data: NotificationEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)
  const totalPrice = services.reduce((sum, service) => sum + service.price, 0)

  const adminUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const appointmentUrl = `${adminUrl}/admin/collections/appointments/${appointment.id}`

  const content = `
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.title}">Ny Bestilling 📅</h1>
      <p style="${emailStyles.subtitle}">En ny avtale har blitt registrert</p>
    </div>

    <div style="${emailStyles.success}">
      <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 18px;">
        Ny kunde: ${customer.name}
      </p>
      <p style="margin: 10px 0 0 0; color: #065f46;">
        ${formatDate(appointment.appointmentDate)} kl. ${formatTime(appointment.appointmentTime)}
      </p>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">👤 Kundeinformasjon</h2>
      
      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Navn:</span>
        <span style="${emailStyles.value}"><strong>${customer.name}</strong></span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">E-post:</span>
        <span style="${emailStyles.value}">
          <a href="mailto:${customer.email}" style="color: #4F46E5; text-decoration: none;">
            ${customer.email}
          </a>
        </span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Telefon:</span>
        <span style="${emailStyles.value}">
          <a href="tel:${customer.phone}" style="color: #4F46E5; text-decoration: none;">
            ${customer.phone}
          </a>
        </span>
      </div>
    </div>

    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">📋 Avtaledetaljer</h2>
      
      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Tjeneste:</span>
        <span style="${emailStyles.value}"><strong>${serviceNames}</strong></span>
      </div>

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Behandler:</span>
        <span style="${emailStyles.value}"><strong>${worker.name}</strong></span>
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

      <div style="${emailStyles.infoRow}">
        <span style="${emailStyles.label}">Status:</span>
        <span style="${emailStyles.value}">
          <span style="background-color: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">
            Bekreftet
          </span>
        </span>
      </div>
    </div>

    ${
      appointment.notes
        ? `
    <div style="${emailStyles.section}">
      <h2 style="${emailStyles.sectionTitle}">📝 Kundens notater</h2>
      <p style="margin: 0; color: #4b5563; background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
        ${appointment.notes}
      </p>
    </div>
    `
        : ''
    }

    <div style="text-align: center; margin: 30px 0;">
      <a href="${appointmentUrl}" style="${emailStyles.button}">
        Se avtale i admin-panel →
      </a>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0 0 10px 0;">
        Booking ID: <strong>${appointment.id}</strong>
      </p>
      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
        Dette er en automatisk generert e-post
      </p>
    </div>
  `

  return htmlEmailWrapper(
    content,
    `Ny bestilling: ${customer.name} - ${formatDate(appointment.appointmentDate)} kl. ${formatTime(appointment.appointmentTime)}`,
  )
}

/**
 * Generate plain text version of business notification email
 */
export function generateNotificationText(data: NotificationEmailData): string {
  const { appointment, customer, services, worker } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)
  const totalPrice = services.reduce((sum, service) => sum + service.price, 0)

  const adminUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const appointmentUrl = `${adminUrl}/admin/collections/appointments/${appointment.id}`

  return `
NY BESTILLING
=============

En ny avtale har blitt registrert i systemet.

Ny kunde: ${customer.name}
${formatDate(appointment.appointmentDate)} kl. ${formatTime(appointment.appointmentTime)}


KUNDEINFORMASJON
----------------
Navn:       ${customer.name}
E-post:     ${customer.email}
Telefon:    ${customer.phone}


AVTALEDETALJER
--------------
Tjeneste:   ${serviceNames}
Behandler:  ${worker.name}
Dato:       ${formatDate(appointment.appointmentDate)}
Tid:        ${formatTime(appointment.appointmentTime)}
Varighet:   ${formatDuration(totalDuration)}
Pris:       ${formatPrice(totalPrice)}
Status:     Bekreftet

${appointment.notes ? `\nKUNDENS NOTATER\n---------------\n${appointment.notes}\n` : ''}

SE AVTALE I ADMIN-PANEL
-----------------------
${appointmentUrl}


Booking ID: ${appointment.id}

---
Dette er en automatisk generert e-post
  `.trim()
}

/**
 * Generate email subject line
 */
export function generateNotificationSubject(data: NotificationEmailData): string {
  const { appointment, customer, services } = data
  const serviceNames = formatServiceNames(services.map((service) => service.name))
  return `Ny bestilling: ${customer.name} - ${serviceNames} - ${formatDate(appointment.appointmentDate)}`
}
