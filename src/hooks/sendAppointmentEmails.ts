/**
 * Send Appointment Emails Hook
 * Automatically sends email notifications when appointments are created or updated
 */

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { Appointment, Customer, Service, Worker } from '../payload-types'
import {
  sendAppointmentConfirmation,
  sendBusinessNotification,
  sendCancellationEmail,
  validateEmailData,
} from '../email/services'

async function getEmailDataFromAppointment(
  appointment: Appointment,
  req: Parameters<CollectionAfterChangeHook<Appointment>>[0]['req'],
) {
  const { payload } = req

  const customerId =
    typeof appointment.customer === 'object' && appointment.customer !== null
      ? appointment.customer.id
      : appointment.customer
  const workerId =
    typeof appointment.worker === 'object' && appointment.worker !== null
      ? appointment.worker.id
      : appointment.worker
  const serviceIds = Array.isArray(appointment.service)
    ? appointment.service.map((service) =>
        typeof service === 'object' && service !== null ? service.id : service,
      )
    : []

  if (!customerId || !workerId || serviceIds.some((id) => !id)) {
    return null
  }

  const customer = (await payload.findByID({
    collection: 'customers',
    id: customerId,
    depth: 0,
    req, // Pass req for transaction safety
  })) as Customer

  const worker = (await payload.findByID({
    collection: 'workers',
    id: workerId,
    depth: 0,
    req, // Pass req for transaction safety
  })) as Worker

  const services = (await Promise.all(
    serviceIds.map((id) =>
      payload.findByID({
        collection: 'services',
        id,
        depth: 0,
        req, // Pass req for transaction safety
      }),
    ),
  )) as Service[]

  return { customer, services, worker }
}

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
  // Skip all email notifications when disabled on the appointment
  if (!doc.sendEmails) {
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

export const sendAppointmentDeletionEmail: CollectionAfterDeleteHook<Appointment> = async ({
  doc,
  req,
  context,
}) => {
  // Skip if emails already sent (to prevent loops)
  if (context?.skipEmails) {
    return doc
  }
  // Skip all email notifications when disabled on the appointment
  if (!doc.sendEmails) {
    return doc
  }

  try {
    const emailData = await getEmailDataFromAppointment(doc, req)

    if (!emailData) {
      console.error(`⚠️  Cannot send deletion email for appointment ${doc.id}: Missing relationship IDs`)
      return doc
    }

    const { payload } = req
    const { customer, services, worker } = emailData

    // Validate that relationships are populated
    if (!validateEmailData(customer, services, worker)) {
      console.error(`⚠️  Cannot send deletion email for appointment ${doc.id}: Missing relationship data`)
      return doc
    }

    console.log(`📧 Sending cancellation email for deleted appointment ${doc.id}...`)

    await sendCancellationEmail(payload, doc, customer, services, worker)

    console.log(`✅ Cancellation email processed for deleted appointment ${doc.id}`)
  } catch (error) {
    // Log error but don't throw - deletion should succeed even if email fails
    console.error(`❌ Error processing deletion email for appointment ${doc.id}:`, error)
  }

  return doc
}
