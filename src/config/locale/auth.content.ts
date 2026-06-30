import { type Dictionary, t } from "intlayer"

export const magicLinkEmailTranslations = {
  preview: { en: "Sign in to your account", zh: "登录您的账户" },
  heading: { en: "Sign in to your account", zh: "登录您的账户" },
  description: {
    en: "Click the button below to sign in. This link will expire in 10 minutes.",
    zh: "点击下方按钮登录。此链接将在 10 分钟后失效。",
  },
  button: { en: "Sign in", zh: "登录" },
  footer: {
    en: "If you didn't request this email, you can safely ignore it.",
    zh: "如果您没有请求此邮件，可以安全忽略。",
  },
  hint: {
    en: "Or copy and paste this URL into your browser:",
    zh: "或者复制以下链接到浏览器中打开：",
  },
} as const

export const verificationEmailTranslations = {
  subject: { en: "Verify your email address", zh: "验证您的邮箱地址" },
  preview: { en: "Verify your email to complete registration", zh: "验证邮箱以完成注册" },
  heading: { en: "Verify your email address", zh: "验证您的邮箱地址" },
  description: {
    en: "Thanks for signing up! Please click the button below to verify your email address.",
    zh: "感谢注册！请点击下方按钮验证您的邮箱地址。",
  },
  button: { en: "Verify Email", zh: "验证邮箱" },
  footer: {
    en: "If you didn't create an account, you can safely ignore this email.",
    zh: "如果您没有创建账户，可以安全忽略此邮件。",
  },
  hint: {
    en: "Or copy and paste this URL into your browser:",
    zh: "或者复制以下链接到浏览器中打开：",
  },
  expiry: {
    en: "This link will expire in 24 hours.",
    zh: "此链接将在 24 小时后失效。",
  },
} as const

export default {
  key: "auth",
  content: {
    loginPage: {
      home: t({ en: "Home", zh: "首页" }),
      testimonial: t({
        en: "This platform has helped me save time and serve my clients faster than ever before.",
        zh: "这个平台帮助我节省了时间，让我能够比以往更快地服务客户。",
      }),
      signIn: {
        title: t({ en: "Welcome back", zh: "欢迎回来" }),
        description: t({ en: "Sign in to your account to continue", zh: "登录您的账户以继续" }),
        button: t({ en: "Sign In", zh: "登录" }),
        switchText: t({ en: "Don't have an account?", zh: "还没有账户？" }),
        switchAction: t({ en: "Sign up", zh: "注册" }),
      },
      signUp: {
        title: t({ en: "Create an account", zh: "创建账户" }),
        description: t({ en: "Enter your details to get started", zh: "输入您的信息开始使用" }),
        button: t({ en: "Create Account", zh: "创建账户" }),
        switchText: t({ en: "Already have an account?", zh: "已有账户？" }),
        switchAction: t({ en: "Sign in", zh: "登录" }),
      },
      social: {
        google: t({ en: "Continue with Google", zh: "使用 Google 继续" }),
        github: t({ en: "Continue with GitHub", zh: "使用 GitHub 继续" }),
        divider: t({ en: "Or continue with email", zh: "或使用邮箱继续" }),
      },
      form: {
        name: t({ en: "Name", zh: "姓名" }),
        namePlaceholder: t({ en: "John Doe", zh: "张三" }),
        email: t({ en: "Email", zh: "邮箱" }),
        emailPlaceholder: t({ en: "name@example.com", zh: "name@example.com" }),
        password: t({ en: "Password", zh: "密码" }),
        showPassword: t({ en: "Show password", zh: "显示密码" }),
        hidePassword: t({ en: "Hide password", zh: "隐藏密码" }),
        errors: {
          nameRequired: t({ en: "Enter your name.", zh: "请输入您的姓名。" }),
          emailRequired: t({ en: "Enter your email address.", zh: "请输入您的邮箱地址。" }),
          passwordRequired: t({ en: "Enter your password.", zh: "请输入您的密码。" }),
          captchaRequired: t({
            en: "Complete the captcha verification.",
            zh: "请完成人机验证。",
          }),
        },
      },
      toast: {
        signInSuccess: t({ en: "Signed in successfully!", zh: "登录成功！" }),
        signUpSuccess: t({
          en: "Account created! Please check your email to verify your account.",
          zh: "账户创建成功！请检查您的邮箱验证账户。",
        }),
        fillAllFields: t({ en: "Please fill in all fields", zh: "请填写所有字段" }),
        enterName: t({ en: "Please enter your name", zh: "请输入您的姓名" }),
        captchaRequired: t({
          en: "Please complete the captcha verification",
          zh: "请完成人机验证",
        }),
        googleError: t({ en: "Failed to sign in with Google", zh: "Google 登录失败" }),
        githubError: t({ en: "Failed to sign in with GitHub", zh: "GitHub 登录失败" }),
        signInError: t({ en: "Invalid email or password", zh: "邮箱或密码错误" }),
        signUpError: t({ en: "Failed to create account", zh: "账户创建失败" }),
        emailNotVerified: t({
          en: "Please verify your email address. Check your inbox for the verification link.",
          zh: "请验证您的邮箱地址。请检查收件箱中的验证链接。",
        }),
        resendVerification: t({
          en: "Verification email sent! Please check your inbox.",
          zh: "验证邮件已发送！请检查您的收件箱。",
        }),
      },
    },
    magicLinkEmail: {
      preview: t(magicLinkEmailTranslations.preview),
      heading: t(magicLinkEmailTranslations.heading),
      description: t(magicLinkEmailTranslations.description),
      button: t(magicLinkEmailTranslations.button),
      footer: t(magicLinkEmailTranslations.footer),
      hint: t(magicLinkEmailTranslations.hint),
    },
    userMenu: {
      login: t({ en: "Login", zh: "登录" }),
      avatarAlt: t({ en: "User avatar", zh: "用户头像" }),
      credits: t({ en: "Credits", zh: "积分" }),
      profile: t({ en: "Profile", zh: "个人资料" }),
      settings: t({ en: "Settings", zh: "设置" }),
      logout: t({ en: "Logout", zh: "退出登录" }),
    },
  },
} satisfies Dictionary
