import { createServerFn } from "@tanstack/react-start"
import { getTranslationContent, type Locale } from "intlayer"
import { waitlistEmailTranslations } from "@/config/locale/waitlist.content"
import { isEmailEnabled, sendEmail } from "@/shared/lib/email/send-email"
import { insertWaitlistEntry } from "@/shared/model/waitlist.model"

export const joinWaitlistFn = createServerFn({ method: "POST" })
  .validator((params: { email: string; locale?: string }) => params)
  .handler(async ({ data: { email, locale = "en" } }) => {
    const entry = await insertWaitlistEntry({ email, locale })

    if (!entry) {
      return { success: true, duplicate: true }
    }

    if (isEmailEnabled) {
      const subject = getTranslationContent(waitlistEmailTranslations.subject, locale as Locale)

      await sendEmail({
        to: email,
        subject,
        type: "waitlist",
        locale,
      })
    }

    return { success: true, duplicate: false }
  })
