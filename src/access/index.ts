import type { Access } from 'payload'

// Anyone can access
export const anyone: Access = () => true

// Read access for active items only (public)
export const activeOnly: Access = () => {
  return { isActive: { equals: true } }
}
