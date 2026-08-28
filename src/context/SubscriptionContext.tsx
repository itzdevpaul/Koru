import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getSubscription } from '../firebase'

interface SubCtx {
  isPro: boolean
  isExpired: boolean          // was subscribed but now past expiresAt
  expiresAt: Date | null      // when the active sub expires (or expired)
  daysLeft: number | null     // days remaining for active Pro (null if free/expired)
  loading: boolean
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubCtx>({
  isPro: false,
  isExpired: false,
  expiresAt: null,
  daysLeft: null,
  loading: true,
  refresh: async () => {},
})

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isPro, setIsPro] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [unlockedQuizIds, setUnlockedQuizIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setIsPro(false); setIsExpired(false)
      setExpiresAt(null); setDaysLeft(null)
      setUnlockedQuizIds([])
      setLoading(false); return
    }
    try {
      const [sub, unlocked] = await Promise.all([
        getSubscription(user.uid),
        getUnlockedReports(user.uid),
      ])
      setUnlockedQuizIds(unlocked)
      const now = new Date()
      if (sub?.active && sub.expiresAt) {
        const exp = sub.expiresAt.toDate()
        setExpiresAt(exp)
        if (exp > now) {
          setIsPro(true)
          setIsExpired(false)
          const ms = exp.getTime() - now.getTime()
          setDaysLeft(Math.ceil(ms / (1000 * 60 * 60 * 24)))
        } else {
          setIsPro(false)
          setIsExpired(true)
          setDaysLeft(null)
        }
      } else {
        setIsPro(false); setIsExpired(false)
        setExpiresAt(null); setDaysLeft(null)
      }
    } catch {
      setIsPro(false); setIsExpired(false)
      setExpiresAt(null); setDaysLeft(null)
      setUnlockedQuizIds([])
    } finally {
      setLoading(false)
    }
  }, [user])

  const hasReportAccess = useCallback((quizId: string) =>
    isPro || unlockedQuizIds.includes(quizId),
  [isPro, unlockedQuizIds])

  useEffect(() => { refresh() }, [refresh])

  return (
    <SubscriptionContext.Provider value={{ isPro, isExpired, expiresAt, daysLeft, loading, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  return useContext(SubscriptionContext)
}
