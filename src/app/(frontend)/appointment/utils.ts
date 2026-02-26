export function formatServiceNames(serviceNames: string[]): string {
  if (serviceNames.length <= 1) {
    return serviceNames[0] ?? ''
  }

  if (serviceNames.length === 2) {
    return `${serviceNames[0]} og ${serviceNames[1]}`
  }

  return `${serviceNames.slice(0, -1).join(', ')} og ${serviceNames[serviceNames.length - 1]}`
}
