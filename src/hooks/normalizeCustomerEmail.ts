import type { CollectionBeforeValidateHook } from 'payload'
import type { Customer } from '@/payload-types'
import { normalizeEmail } from '@/lib/normalizeEmail'

export const normalizeCustomerEmail: CollectionBeforeValidateHook<Customer> = ({ data }) => {
  if (data?.email) {
    data.email = normalizeEmail(data.email)
  }

  return data
}
