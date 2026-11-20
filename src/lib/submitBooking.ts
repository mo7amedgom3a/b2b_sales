export type BookingPayload = {
  fullName: string
  jobTitle: string
  company: string
  phone: string
  email: string
  teamSize: string
  sector: string
  challenge?: string
}

/**
 * Single seam for the booking backend.
 *
 * The legacy Python/Bitrix24 backend is intentionally not ported (DECISIONS D-004).
 * To wire it later, replace the mock below with a POST to the Bitrix endpoint:
 *
 *   const res = await fetch('/api/leads', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   })
 *   if (!res.ok) throw new Error('BOOKING_FAILED')
 *
 * Keep `BITRIX24_WEBHOOK_URL` server-side only.
 */
export async function submitBooking(payload: BookingPayload): Promise<{ ok: true }> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[submitBooking] mock payload', payload)
  }
  return { ok: true }
}
