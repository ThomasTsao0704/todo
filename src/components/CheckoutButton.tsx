'use client'

import { useState } from 'react'
import { Loader2, Zap } from 'lucide-react'

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '發生錯誤'); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError('連線失敗，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
        升級 Pro · $9/月
      </button>
      {error && <p className="text-xs text-accent mt-2 text-center">{error}</p>}
    </div>
  )
}
