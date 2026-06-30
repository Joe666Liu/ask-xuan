import { type Dictionary, t } from "intlayer"

export const waitlistEmailTranslations = {
  subject: { en: "You're on the waitlist!", zh: "您已加入等待列表！" },
  preview: {
    en: "Thanks for joining the Ask Xuan waitlist — early bird discount inside",
    zh: "感谢加入 Ask Xuan 等待列表 — 内含早鸟优惠信息",
  },
  heading: { en: "You're on the list!", zh: "您已成功加入等待列表！" },
  description: {
    en: "Thanks for signing up! We'll notify you on launch day with an exclusive early bird discount code — $69 instead of $89 (save $20).",
    zh: "感谢您的注册！上线当天我们会发送专属早鸟优惠码给您 — $69 而非 $89（立省 $20）。",
  },
  earlyBird: {
    en: "As an early supporter, you'll get first access and the best price when we launch.",
    zh: "作为早期支持者，您将在上线时享有优先体验资格和最优价格。",
  },
  footer: {
    en: "You're receiving this because you signed up for the Ask Xuan waitlist. No spam, ever.",
    zh: "您收到此邮件是因为您注册了 Ask Xuan 等待列表。我们绝不发送垃圾邮件。",
  },
} as const

export default {
  key: "waitlist",
  content: {
    title: t({
      en: "Join the Waitlist",
      zh: "加入等待列表",
    }),
    description: t({
      en: "Get notified on launch day with an exclusive early bird discount code.",
      zh: "上线当天我们将发送专属早鸟优惠码给您。",
    }),
    emailLabel: t({
      en: "Email",
      zh: "邮箱",
    }),
    emailPlaceholder: t({
      en: "you@example.com…",
      zh: "you@example.com…",
    }),
    joinButton: t({
      en: "Join",
      zh: "加入",
    }),
    invalidEmail: t({
      en: "Please enter a valid email address",
      zh: "请输入有效的邮箱地址",
    }),
    submitError: t({
      en: "Something went wrong, please try again later",
      zh: "提交失败，请稍后重试",
    }),
    success: {
      title: t({
        en: "You're on the list!",
        zh: "您已加入等待列表！",
      }),
      description: t({
        en: "We'll send you the early bird discount code on launch day.",
        zh: "上线当天我们会发送早鸟优惠码给您。",
      }),
    },
    earlyBird: {
      title: t({
        en: "Early Bird Offer",
        zh: "早鸟优惠",
      }),
      save: t({
        en: "Save $20",
        zh: "立省 $20",
      }),
      endsIn: t({
        en: "Ends in",
        zh: "剩余时间",
      }),
      expiredTitle: t({
        en: "Early bird offer has ended",
        zh: "早鸟优惠已结束",
      }),
      expiredDescription: t({
        en: "You can still join the waitlist and receive launch updates.",
        zh: "您仍可加入等待列表并接收上线通知。",
      }),
    },
    footer: t({
      en: "No spam, ever. Unsubscribe anytime.",
      zh: "绝不发送垃圾邮件，随时可退订。",
    }),
  },
} satisfies Dictionary
