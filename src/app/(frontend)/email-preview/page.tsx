import type { Metadata } from 'next'
import type { Appointment, Customer, Service, Worker } from '@/payload-types'
import {
  generateCancellationHTML,
  generateCancellationSubject,
  generateCancellationText,
} from '@/email/templates/appointment-cancellation'
import {
  generateConfirmationHTML,
  generateConfirmationSubject,
  generateConfirmationText,
} from '@/email/templates/appointment-confirmation'
import {
  generateNotificationHTML,
  generateNotificationSubject,
  generateNotificationText,
} from '@/email/templates/appointment-notification'
import {
  generateRebookingReminderHTML,
  generateRebookingReminderSubject,
  generateRebookingReminderText,
} from '@/email/templates/appointment-rebooking-reminder'
import {
  generateReminderHTML,
  generateReminderSubject,
  generateReminderText,
} from '@/email/templates/appointment-reminder'

export const metadata: Metadata = {
  title: 'Email Preview',
  robots: {
    index: false,
    follow: false,
  },
}

const now = new Date().toISOString()

const customer: Customer = {
  id: 'preview-customer',
  name: 'Ola Nordmann',
  email: 'ola@example.com',
  phone: '+47 12 34 56 78',
  updatedAt: now,
  createdAt: now,
}

const services: Service[] = [
  {
    id: 'preview-service-klipp',
    name: 'Herreklipp',
    duration: 30,
    price: 450,
    countsTowardLoyalty: true,
    isActive: true,
    updatedAt: now,
    createdAt: now,
  },
  {
    id: 'preview-service-skin-fade',
    name: 'Skin-fade',
    duration: 30,
    price: 350,
    countsTowardLoyalty: true,
    isActive: true,
    updatedAt: now,
    createdAt: now,
  },
  {
    id: 'preview-service-beard',
    name: 'Skjeggtrim',
    duration: 15,
    price: 250,
    countsTowardLoyalty: false,
    isActive: true,
    updatedAt: now,
    createdAt: now,
  },
]

const worker: Worker = {
  id: 'preview-worker',
  name: 'Bella Frisør',
  email: 'barber@example.com',
  phone: '+47 98 76 54 32',
  sortOrder: 1,
  isActive: true,
  updatedAt: now,
  createdAt: now,
}

const appointment: Appointment = {
  id: 'preview-appointment',
  customer,
  service: services,
  worker,
  appointmentDate: '2026-06-18T00:00:00.000Z',
  appointmentTime: '14:30',
  status: 'confirmed',
  notes: 'Ønsker en kort fade på sidene.',
  sendEmails: true,
  loyalty: {
    isFree: true,
    qualifyingCount: 10,
    progressCount: 10,
  },
  cancellationToken: 'preview-cancellation-token',
  updatedAt: now,
  createdAt: now,
}

const cancelledAppointment: Appointment = {
  ...appointment,
  status: 'cancelled',
  loyalty: {
    isFree: false,
    qualifyingCount: 0,
    progressCount: 0,
  },
}

const inProgressAppointment: Appointment = {
  ...appointment,
  id: 'preview-appointment-in-progress',
  loyalty: {
    isFree: false,
    qualifyingCount: 7,
    progressCount: 7,
  },
}

const rewardUsedAppointment: Appointment = {
  ...appointment,
  id: 'preview-appointment-reward-used',
  loyalty: {
    isFree: false,
    qualifyingCount: 20,
    progressCount: 10,
  },
}

const emailData = {
  appointment,
  customer,
  services,
  worker,
}

const cancellationEmailData = {
  appointment: cancelledAppointment,
  customer,
  services,
  worker,
}

const inProgressEmailData = {
  appointment: inProgressAppointment,
  customer,
  services,
  worker,
}

const rewardUsedEmailData = {
  appointment: rewardUsedAppointment,
  customer,
  services,
  worker,
}

const previews = [
  {
    title: 'Customer Confirmation',
    subject: generateConfirmationSubject(emailData),
    html: generateConfirmationHTML(emailData),
    text: generateConfirmationText(emailData),
  },
  {
    title: 'Business Notification',
    subject: generateNotificationSubject(emailData),
    html: generateNotificationHTML(emailData),
    text: generateNotificationText(emailData),
  },
  {
    title: 'Business Notification - Loyalty Progress',
    subject: generateNotificationSubject(inProgressEmailData),
    html: generateNotificationHTML(inProgressEmailData),
    text: generateNotificationText(inProgressEmailData),
  },
  {
    title: 'Business Notification - Pending Reward Next Year',
    subject: generateNotificationSubject(rewardUsedEmailData),
    html: generateNotificationHTML(rewardUsedEmailData),
    text: generateNotificationText(rewardUsedEmailData),
  },
  {
    title: 'Cancellation',
    subject: generateCancellationSubject(cancellationEmailData),
    html: generateCancellationHTML(cancellationEmailData),
    text: generateCancellationText(cancellationEmailData),
  },
  {
    title: '24-hour Reminder',
    subject: generateReminderSubject(emailData),
    html: generateReminderHTML(emailData),
    text: generateReminderText(emailData),
  },
  {
    title: '30-day Rebooking Reminder',
    subject: generateRebookingReminderSubject(emailData),
    html: generateRebookingReminderHTML(emailData),
    text: generateRebookingReminderText(emailData),
  },
]

export default function EmailPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c89e58]">
            Bella Frisør
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Email Preview</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Static preview using sample appointment data. The confirmation and business notification
            previews include the free loyalty appointment state.
          </p>
        </header>

        <div className="grid gap-8">
          {previews.map((preview) => (
            <section
              key={preview.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 space-y-1">
                <h2 className="text-xl font-semibold">{preview.title}</h2>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Subject:</span> {preview.subject}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <iframe
                  title={`${preview.title} HTML preview`}
                  srcDoc={preview.html}
                  className="h-[760px] w-full rounded-xl border border-slate-200 bg-white"
                />
                <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
                  <h3 className="mb-3 text-sm font-semibold text-slate-300">Plain Text</h3>
                  <pre className="max-h-[710px] overflow-auto whitespace-pre-wrap text-xs leading-relaxed">
                    {preview.text}
                  </pre>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
