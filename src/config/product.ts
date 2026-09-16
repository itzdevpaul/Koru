export const REFERRAL_REWARD_THRESHOLD = 100

export const PRODUCT = {
  appName: 'Koru',
  supportEmail: 'support@koru.com.ng',
  privacyEmail: 'privacy@koru.com.ng',
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL ?? '',
  referralRewardThreshold: 100,
  pricing: {
    monthlyNaira: 2500,
    introNaira: 1000,
    reportUnlockNaira: 1000,
  },
} as const
