import type { Access } from 'payload'

const getRole = (user: unknown) => {
  if (!user || typeof user !== 'object' || !('role' in user)) return undefined

  const role = user.role

  return typeof role === 'string' ? role : undefined
}

export const isAdmin = (user: unknown) => getRole(user) === 'admin'

export const isWorker = (user: unknown) => getRole(user) === 'worker'

export const hideFromWorkers = ({ user }: { user: unknown }) => isWorker(user)

// Anyone can access
export const anyone: Access = () => true

export const adminsOnly: Access = ({ req: { user } }) => isAdmin(user)

export const adminsAndWorkers: Access = ({ req: { user } }) => isAdmin(user) || isWorker(user)
