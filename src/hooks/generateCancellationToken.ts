/**
 * Generate Cancellation Token Hook
 * Automatically generates a secure cancellation token when an appointment is created
 */

import type { CollectionBeforeChangeHook } from 'payload'
import type { Appointment } from '../payload-types'
import { randomBytes } from 'crypto'

/**
 * BeforeChange hook to generate cancellation token for new appointments
 */
export const generateCancellationToken: CollectionBeforeChangeHook<Appointment> = async ({
  data,
  operation,
}) => {
  // Only generate token on create
  if (operation === 'create') {
    // Generate a secure random token (32 bytes = 64 hex characters)
    const token = randomBytes(32).toString('hex')
    
    data.cancellationToken = token
    
    console.log(`🔐 Generated cancellation token for new appointment`)
  }

  return data
}
