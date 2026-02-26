/**
 * Send Appointment Emails Hook
 * Automatically sends email notifications when appointments are created or updated
 */

import type { CollectionAfterChangeHook } from 'payload'
import type { Appointment, Customer, Service, Worker } from '../payload-types'
import {
  sendAppointmentConfirmation,
  sendBusinessNotification,
  sendCancellationEmail,
  validateEmailData,
} from '../email/services'

/**
 * AfterChange hook to send emails when appointments are created or cancelled
 */
export const sendAppointmentEmails: CollectionAfterChangeHook<Appointment> = async ({
  doc,
  operation,
  previousDoc,
  req,
  context,
}) => {
  // Skip if emails already sent (to prevent loops)
  if (context?.skipEmails) {
    return doc
  }

  const { payload } = req

  try {
    // Fetch appointment with full relationship data (depth: 2)
    const fullAppointment = await payload.findByID({
      collection: 'appointments',
      id: doc.id,
      depth: 2,
      req, // Pass req for transaction safety
    })

    // Extract relationship data
    const customer = fullAppointment.customer as Customer
    const services = Array.isArray(fullAppointment.service)
      ? (fullAppointment.service as Service[])
      : [fullAppointment.service as Service]
    const worker = fullAppointment.worker as Worker

    // Validate that relationships are populated
    if (!validateEmailData(customer, services, worker)) {
      console.error(`⚠️  Cannot send emails for appointment ${doc.id}: Missing relationship data`)
      return doc
    }

    // OPERATION: CREATE - Send confirmation + business notification
    if (operation === 'create') {
      console.log(`📧 Sending emails for new appointment ${doc.id}...`)

      // Send customer confirmation email
      const confirmationResult = await sendAppointmentConfirmation(
        payload,
        fullAppointment,
        customer,
        services,
        worker,
      )

      // Send business notification email
      const notificationResult = await sendBusinessNotification(
        payload,
        fullAppointment,
        customer,
        services,
        worker,
      )

      // Update email tracking fields
      await payload.update({
        collection: 'appointments',
        id: doc.id,
        data: {
          emailsSent: {
            confirmationSent: confirmationResult.success,
            confirmationSentAt: confirmationResult.success ? new Date().toISOString() : undefined,
            businessNotificationSent: notificationResult.success,
            businessNotificationSentAt: notificationResult.success
              ? new Date().toISOString()
              : undefined,
          },
        },
        context: { skipEmails: true }, // Prevent infinite loop
        req, // Pass req for transaction safety
      })

      console.log(`✅ Email notifications processed for appointment ${doc.id}`)
    }

    // OPERATION: UPDATE - Check for status changes (cancellation)
    if (operation === 'update' && previousDoc) {
      const wasCancelled = doc.status === 'cancelled' && previousDoc.status !== 'cancelled'

      if (wasCancelled) {
        console.log(`📧 Sending cancellation email for appointment ${doc.id}...`)

        // Send cancellation email
        const cancellationResult = await sendCancellationEmail(
          payload,
          fullAppointment,
          customer,
          services,
          worker,
        )

        // Update email tracking fields
        await payload.update({
          collection: 'appointments',
          id: doc.id,
          data: {
            emailsSent: {
              ...doc.emailsSent,
              cancellationSent: cancellationResult.success,
              cancellationSentAt: cancellationResult.success ? new Date().toISOString() : undefined,
            },
          },
          context: { skipEmails: true }, // Prevent infinite loop
          req, // Pass req for transaction safety
        })

        console.log(`✅ Cancellation email processed for appointment ${doc.id}`)
      }
    }
  } catch (error) {
    // Log error but don't throw - appointment should succeed even if emails fail
    console.error(`❌ Error processing emails for appointment ${doc.id}:`, error)
  }

  return doc
}
