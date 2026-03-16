export const RESEND_TEMPLATE_IDS = {
  ANNOUNCEMENT: '95caea7c-2d7a-4a03-ac1f-2a790e452663',
  /** Resend template for meeting feedback request. Set RESEND_TEMPLATE_MEETING_FEEDBACK env. Vars: meeting_title, feedback_form_link */
  MEETING_FEEDBACK: process.env.RESEND_TEMPLATE_MEETING_FEEDBACK ?? '',
}