import Link from 'next/link'
import { CheckCircle, Zap, Lock, BarChart3 } from 'lucide-react'

const features = [
  { icon: CheckCircle, title: '無限任務管理', desc: '升級 Pro 無上限新增任務，分類、優先度一目了然。' },
  { icon: Zap,         title: '即時同步',     desc: '任何裝置登入即同步，資料永久雲端保存。' },
  { icon: Lock,        title: '資料安全',     desc: 'Row Level Security 確保資料只屬於你。' },
  { icon: BarChart3,   title: '生產力洞察',   desc: '（即將推出）完成率統計、每週回顧報告。' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-display text-2xl font-bold text-ink">Taskly</span>
        <div className="flex gap-3">
          <Link href="/pricing" className="btn-outline">定價</Link>
          <Link href="/auth" className="btn-primary">開始使用</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold
                        px-3 py-1.5 rounded-full mb-6">
          ✨ 現已開放測試
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-ink leading-[1.1] mb-6">
          專注的人才用的<br/>
          <span className="text-accent">待辦清單</span>
        </h1>
        <p className="text-muted text-lg mb-10 leading-relaxed">
          不再被功能淹沒。Taskly 用優雅的設計讓你每天清楚知道<br className="hidden md:block"/>
          最重要的三件事，並真正完成它。
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/auth" className="btn-primary text-base px-7 py-3">
            免費開始 →
          </Link>
          <Link href="/pricing" className="btn-outline text-base px-7 py-3">
            查看方案
          </Link>
        </div>
        <p className="text-muted text-xs mt-4">免費版 50 個任務，無需信用卡</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 flex gap-4 hover:-translate-y-0.5 transition-transform">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-ink text-white py-16 px-6 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">準備好了嗎？</h2>
        <p className="text-white/60 mb-8">今天就加入，免費開始你的第一個任務。</p>
        <Link href="/auth" className="bg-accent hover:bg-accent-dim text-white font-medium
                                      px-8 py-3 rounded-lg transition-colors inline-block">
          免費註冊
        </Link>
      </section>

      <footer className="text-center py-8 text-muted text-xs">
        © {new Date().getFullYear()} Taskly · Built with Next.js & Supabase
      </footer>
    </main>
  )
}
