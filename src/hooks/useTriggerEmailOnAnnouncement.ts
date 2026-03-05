import { useCallback } from "react"
import { AnnouncementFormState } from "../app/modules/Announcements/Announcement.types"
import { RESEND_TEMPLATE_IDS } from "../constants/ThirdPartyConstants"
import { useGoogleGroups } from "./useGoogleGroups"
import { useSendEmailWithTemplate } from "./useSendEmailWithTemplate"

export const useTriggerEmailOnAnnouncement = () => {
  const { sendEmail } = useSendEmailWithTemplate();
  const { groups } = useGoogleGroups();

  const triggerEmailOnAnnouncement = useCallback(async (announcement: AnnouncementFormState) => {
    const groupEmails = groups.map((group) => group.email);
    try {
      await sendEmail({
        to: groupEmails,
        templateId: RESEND_TEMPLATE_IDS.ANNOUNCEMENT,
        variables: { subject: announcement.title, announcement: announcement.description },
      })
    } catch (error) {
      console.error('Error triggering email on announcement:', error);
      throw error;
    }
  }, [sendEmail, groups])

  return {
    triggerEmailOnAnnouncement,
  }
}