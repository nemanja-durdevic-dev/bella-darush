/**
 * Email Template Utilities
 * Shared formatting helpers for email templates
 */

import { formatAppointmentDateNorwegian } from '@/lib/appointmentDate'

/**
 * Format date to Norwegian readable format
 * @example formatDate('2026-02-15') => 'Lørdag, 15. Februar 2026'
 */
export function formatDate(dateString: string): string {
  return formatAppointmentDateNorwegian(dateString)
    .split(' ')
    .map((word) => {
      if (!word) return word
      return word.charAt(0).toLocaleUpperCase('nb-NO') + word.slice(1)
    })
    .join(' ')
}

/**
 * Format time from 24-hour to readable format
 * @example formatTime('14:00') => '14:00'
 */
export function formatTime(timeString: string): string {
  return timeString
}

/**
 * Format duration in minutes to readable format
 * @example formatDuration(60) => '1 time'
 * @example formatDuration(90) => '1 time 30 minutter'
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  const parts: string[] = []
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'time' : 'timer'}`)
  }
  if (mins > 0) {
    parts.push(`${mins} ${mins === 1 ? 'minutt' : 'minutter'}`)
  }

  return parts.join(' ')
}

/**
 * Format price in NOK
 * @example formatPrice(500) => '500 kr'
 */
export function formatPrice(amount: number): string {
  return `${amount} kr`
}

/**
 * Format multiple service names in Norwegian list style
 * @example formatServiceNames(['Klipp']) => 'Klipp'
 * @example formatServiceNames(['Klipp', 'Vask']) => 'Klipp og Vask'
 * @example formatServiceNames(['Klipp', 'Vask', 'Føn']) => 'Klipp, Vask og Føn'
 */
export function formatServiceNames(serviceNames: string[]): string {
  if (serviceNames.length <= 1) {
    return serviceNames[0] ?? ''
  }

  if (serviceNames.length === 2) {
    return `${serviceNames[0]} og ${serviceNames[1]}`
  }

  return `${serviceNames.slice(0, -1).join(', ')} og ${serviceNames[serviceNames.length - 1]}`
}

/**
 * Base HTML email styles
 */
export const emailStyles = {
  body: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
  `,
  container: `
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    padding: 40px 30px;
  `,
  header: `
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 3px solid #4F46E5;
  `,
  title: `
    color: #1a1a1a;
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 10px 0;
  `,
  subtitle: `
    color: #666666;
    font-size: 16px;
    margin: 0;
  `,
  section: `
    margin: 30px 0;
    padding: 20px;
    background-color: #f9fafb;
    border-radius: 8px;
    border-left: 4px solid #4F46E5;
  `,
  sectionTitle: `
    color: #1a1a1a;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 15px 0;
  `,
  infoRow: `
    margin: 10px 0;
    display: flex;
    align-items: flex-start;
  `,
  label: `
    font-weight: 600;
    color: #4b5563;
    min-width: 120px;
    display: inline-block;
  `,
  value: `
    color: #1a1a1a;
  `,
  button: `
    display: inline-block;
    padding: 14px 28px;
    background-color: #4F46E5;
    color: #ffffff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
  `,
  footer: `
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    color: #6b7280;
    font-size: 14px;
  `,
  warning: `
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
  `,
  success: `
    background-color: #d1fae5;
    border-left: 4px solid #10b981;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
  `,
}

/**
 * Generate base HTML email wrapper
 */
export function htmlEmailWrapper(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="nb">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Service App</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="${emailStyles.body}">
  ${preheader ? `<div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
