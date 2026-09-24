/**
 * Business details used by the Privacy Policy and Terms of Service.
 *
 * FILL THESE IN BEFORE LAUNCH. Any empty value is shown on the pages as a
 * highlighted "[placeholder]" so it can't be missed. Everything else on those
 * pages describes what the app actually does; if you change the app (new
 * analytics, a new payment provider, a different cookie), update the pages too.
 *
 * Have a Nigerian lawyer or data-protection consultant review both pages. They
 * are a solid, accurate starting point, not legal advice.
 */
export const LEGAL = {
  businessName: 'De-Jolique Enterprise',
  // Registered business name and CAC number, e.g. "De-Jolique Enterprise (BN 1234567)"
  legalEntity: 'De-Jolique Enterprise (BN 3554939)',
  // Support email, phone and business address are NOT here: the admin edits them in
  // Admin → Store settings, and the pages read them from the API.
  // Where you deliver, e.g. "all 36 states and the FCT" or "Lagos only"
  deliveryAreas: 'all 36 states and the FCT (nationwide)',
  // Typical delivery time, e.g. "2–5 working days in Lagos, 5–10 elsewhere"
  deliveryTimes: '2–5 working days, both within Lagos and outside Lagos',
  // Days after delivery a customer can ask to return an item, e.g. 7
  returnWindowDays: 7,
  // Days to process a refund once a return is approved, e.g. 10
  refundDays: 10,

  // Already true in the app; change only if the configuration changes.
  unpaidOrderHours: 48, // server PENDING_ORDER_TTL_HOURS
  effectiveDate: '24 September 2026',
};
