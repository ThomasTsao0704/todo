import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Crown, Settings } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  const isPro = profile?.is_pro ?? false

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-ink text-white flex flex-col py-6 px-4 flex-shrink-0">
        <Link href="/" className="font-display text-xl font-bold mb-8 px-2">Taskly</Link>

        <nav className="flex-1 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                       bg-white/10 text-white font-medium"
          >
            ✓ 我的任務
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                       text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            <Crown size={14} /> 升級方案
          </Link>
        </nav>

        {/* User info */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="px-2 mb-3">
            <p className="text-xs text-white/40 truncate">{user.email}</p>
            <div className="mt-1">
              {isPro ? (
                <span className="badge-pro">⚡ Pro</span>
              ) : (
                <span className="text-xs text-white/40">免費版</span>
              )}
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <button
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white
                         px-2 py-1.5 rounded transition-colors w-full"
            >
              <LogOut size={13} /> 登出
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
