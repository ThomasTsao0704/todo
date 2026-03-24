import { createClient } from '@/lib/supabase/server'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'
import CheckoutButton from '@/components/CheckoutButton'
import ManageBillingButton from '@/components/ManageBillingButton'

const FREE_FEATURES = [
  '最多 50 個任務',
  '3 種分類',
  '基本優先度',
  '雲端同步',
]

const PRO_FEATURES = [
  '無限任務',
  '所有分類 + 自訂標籤',
  '優先度排序 & 篩選',
  '生產力統計（即將推出）',
  '優先客服支援',
  '永久資料保存',
]

export default async function PricingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPro = false
  let hasActiveSub = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, sub_status')
      .eq('id', user.id)
      .single()
    isPro = profile?.is_pro ?? false
    hasActiveSub = profile?.sub_status === 'active'
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="font-display text-2xl font-bold text-ink">Taskly</Link>
        {user
          ? <Link href="/dashboard" className="btn-outline">我的任務</Link>
          : <Link href="/auth" className="btn-primary">開始使用</Link>}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="font-display text-5xl font-bold text-ink mb-4">簡單透明的定價</h1>
          <p className="text-muted text-lg">免費開始，需要更多再升級</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">

          {/* Free plan */}
          <div className="card p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">免費版</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-ink">$0</span>
                <span className="text-muted">/月</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-ink">
                  <Check size={15} className="text-muted flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {user && !isPro ? (
              <div className="w-full text-center py-2.5 rounded-lg bg-paper border border-border
                              text-sm font-medium text-muted">
                目前方案 ✓
              </div>
            ) : (
              <Link href="/auth" className="btn-outline w-full block text-center">
                免費開始
              </Link>
            )}
          </div>

          {/* Pro plan */}
          <div className="card p-8 border-2 border-ink relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="badge-pro text-xs">最受歡迎</span>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-accent uppercase tracking-wide mb-2">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-ink">$9</span>
                <span className="text-muted">/月</span>
              </div>
              <p className="text-xs text-muted mt-1">按月計費，隨時取消</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-ink">
                  <Check size={15} className="text-accent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {!user ? (
              <Link href="/auth" className="btn-primary w-full block text-center">
                立即開始
              </Link>
            ) : isPro && hasActiveSub ? (
              <div className="space-y-2">
                <div className="w-full text-center py-2.5 rounded-lg bg-accent/10 border border-accent/20
                                text-sm font-semibold text-accent flex items-center justify-center gap-2">
                  <Zap size={14} /> 已訂閱 Pro
                </div>
                <ManageBillingButton />
              </div>
            ) : (
              <CheckoutButton />
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-ink mb-8 text-center">常見問題</h2>
          {[
            ['可以隨時取消嗎？', '可以。取消後仍可使用至週期結束，不會立即停用。'],
            ['付款安全嗎？', '使用 Stripe 處理所有付款，我們不儲存你的信用卡資訊。'],
            ['免費版有期限嗎？', '沒有，免費版永久有效，限制為 50 個任務。'],
            ['支援退款嗎？', '若對服務不滿意，7 天內可申請退款，請聯繫客服。'],
          ].map(([q, a]) => (
            <div key={q} className="border-b border-border py-5">
              <p className="font-medium text-ink mb-1.5">{q}</p>
              <p className="text-sm text-muted">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
