import type { Access } from 'payload'

// Anyone can access
export const anyone: Access = () => true

// Admin users only
export const adminOnly: Access = ({ req }) => req.user?.collection === 'users'

// Read access for active items only (public)
export const activeOnly: Access = () => {
  return { isActive: { equals: true } }
}
