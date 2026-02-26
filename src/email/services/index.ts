/**
 * Email Service
 * Handles all email sending operations for appointments
 */

import type { Payload } from 'payload'
import type { Appointment, Customer, Service, Worker } from '../../payload-types'
import {
  generateConfirmationHTML,
  generateConfirmationSubject,
  generateConfirmationText,
} from '../templates/appointment-confirmation'
import {
  generateNotificationHTML,
  generateNotificationSubject,
  generateNotificationText,
} from '../templates/appointment-notification'
import {
  generateCancellationHTML,
  generateCancellationSubject,
  generateCancellationText,
} from '../templates/appointment-cancellation'
import {
  generateReminderHTML,
  generateReminderSubject,
  generateReminderText,
} from '../templates/appointment-reminder'

/**
 * Email sending result
 */
export interface EmailResult {
  success: boolean
  error?: string
}

/**
 * Send appointment confirmation email to customer
 */
export async function sendAppointmentConfirmation(
  payload: Payload,
  appointment: Appointment,
  customer: Customer,
  services: Service[],
  worker: Worker,
): Promise<EmailResult> {
  try {
    const emailData = { appointment, customer, services, worker }

    await payload.sendEmail({
      to: customer.email,
      subject: generateConfirmationSubject(emailData),
      html: generateConfirmationHTML(emailData),
      text: generateConfirmationText(emailData),
    })

    console.log(`✅ Confirmation email sent to ${customer.email} for appointment ${appointment.id}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Failed to send confirmation email to ${customer.email}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send business notification email about new appointment
 */
export async function sendBusinessNotification(
  payload: Payload,
  appointment: Appointment,
  customer: Customer,
  services: Service[],
  worker: Worker,
): Promise<EmailResult> {
  try {
    const emailData = { appointment, customer, services, worker }
    const businessEmail = process.env.BUSINESS_NOTIFICATION_EMAIL

    if (!businessEmail) {
      console.warn('⚠️  BUSINESS_NOTIFICATION_EMAIL not configured, skipping business notification')
      return { success: false, error: 'Business email not configured' }
    }

    await payload.sendEmail({
      to: businessEmail,
      subject: generateNotificationSubject(emailData),
      html: generateNotificationHTML(emailData),
      text: generateNotificationText(emailData),
    })

    console.log(
      `✅ Business notification sent to ${businessEmail} for appointment ${appointment.id}`,
    )
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Failed to send business notification:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send cancellation email to customer
 */
export async function sendCancellationEmail(
  payload: Payload,
  appointment: Appointment,
  customer: Customer,
  services: Service[],
  worker: Worker,
): Promise<EmailResult> {
  try {
    const emailData = { appointment, customer, services, worker }

    await payload.sendEmail({
      to: customer.email,
      subject: generateCancellationSubject(emailData),
      html: generateCancellationHTML(emailData),
      text: generateCancellationText(emailData),
    })

    console.log(`✅ Cancellation email sent to ${customer.email} for appointment ${appointment.id}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Failed to send cancellation email to ${customer.email}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send reminder email to customer (24 hours before appointment)
 */
export async function sendAppointmentReminder(
  payload: Payload,
  appointment: Appointment,
  customer: Customer,
  services: Service[],
  worker: Worker,
): Promise<EmailResult> {
  try {
    const emailData = { appointment, customer, services, worker }

    await payload.sendEmail({
      to: customer.email,
      subject: generateReminderSubject(emailData),
      html: generateReminderHTML(emailData),
      text: generateReminderText(emailData),
    })

    console.log(`✅ Reminder email sent to ${customer.email} for appointment ${appointment.id}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Failed to send reminder email to ${customer.email}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Helper function to validate email data has all required relationships populated
 */
export function validateEmailData(customer: unknown, services: unknown, worker: unknown): boolean {
  if (typeof customer !== 'object' || customer === null || !('email' in customer)) {
    console.error('❌ Invalid customer data for email')
    return false
  }

  if (
    !Array.isArray(services) ||
    services.length === 0 ||
    services.some(
      (service) => typeof service !== 'object' || service === null || !('name' in service),
    )
  ) {
    console.error('❌ Invalid services data for email')
    return false
  }

  if (typeof worker !== 'object' || worker === null || !('name' in worker)) {
    console.error('❌ Invalid worker data for email')
    return false
  }

  return true
}
