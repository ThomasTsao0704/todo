'use client'

import { useState } from 'react'
import { Loader2, Settings } from 'lucide-react'

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="btn-outline w-full flex items-center justify-center gap-2 text-sm
                 disabled:opacity-60"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
      管理訂閱
    </button>
  )
}
