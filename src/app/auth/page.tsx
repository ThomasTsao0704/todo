'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/dashboard` },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setMessage('確認信已寄出！請查看你的信箱完成驗證。')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4">
      <Link href="/" className="font-display text-2xl font-bold text-ink mb-10">
        Taskly
      </Link>

      <div className="card w-full max-w-sm p-8 animate-fade-up">
        {/* Tab switch */}
        <div className="flex bg-paper rounded-lg p-1 mb-6 gap-1">
          {(['login','signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setMessage(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all
                ${mode === m ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'}`}
            >
              {m === 'login' ? '登入' : '註冊'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 block">密碼</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="至少 6 個字元"
            />
          </div>

          {error && (
            <p className="text-accent text-xs bg-accent/8 border border-accent/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {message && (
            <p className="text-green-700 text-xs bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === 'login' ? '登入' : '建立帳號'}
          </button>
        </form>
      </div>

      <p className="text-muted text-xs mt-6">
        繼續使用即同意{' '}
        <span className="underline cursor-pointer">服務條款</span> 與{' '}
        <span className="underline cursor-pointer">隱私政策</span>
      </p>
    </div>
  )
}
