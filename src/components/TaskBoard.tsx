'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Crown, Trash2, CheckCircle2, Circle, Filter } from 'lucide-react'
import Link from 'next/link'
import {
  type Task, type Profile, type Category, type Priority,
  CATEGORY_MAP, PRIORITY_MAP, FREE_TASK_LIMIT,
} from '@/types'
import { useRouter } from 'next/navigation'

interface Props {
  initialTasks: Task[]
  profile: Profile
  userId: string
}

type FilterView = 'all' | 'pending' | 'done'

export default function TaskBoard({ initialTasks, profile, userId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [tasks, setTasks] = useOptimistic(initialTasks)
  const [text, setText] = useState('')
  const [category, setCategory] = useState<Category>('工作')
  const [priority, setPriority] = useState<Priority>('medium')
  const [filter, setFilter] = useState<FilterView>('all')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPro = profile.is_pro
  const taskCount = tasks.length
  const limitReached = !isPro && taskCount >= FREE_TASK_LIMIT

  // ── Filtered view ──────────────────────────────────
  const visible = tasks.filter(t => {
    if (filter === 'pending') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const pendingCount = tasks.filter(t => !t.done).length
  const doneCount = tasks.filter(t => t.done).length

  // ── Add task ───────────────────────────────────────
  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || adding) return
    if (limitReached) { setError('已達免費上限，請升級 Pro'); return }

    setAdding(true)
    setError(null)

    const optimistic: Task = {
      id: `optimistic-${Date.now()}`,
      user_id: userId,
      text: text.trim(),
      category,
      priority,
      done: false,
      created_at: new Date().toISOString(),
    }

    startTransition(() => setTasks([optimistic, ...tasks]))
    setText('')

    const { error: err } = await supabase
      .from('tasks')
      .insert({ user_id: userId, text: optimistic.text, category, priority })

    if (err) {
      setError(
        err.message.includes('FREE_LIMIT_EXCEEDED')
          ? '已達免費上限（50 個任務），升級 Pro 解鎖無限任務。'
          : err.message
      )
    }
    setAdding(false)
    router.refresh()
  }

  // ── Toggle done ────────────────────────────────────
  async function toggleTask(task: Task) {
    startTransition(() =>
      setTasks(tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
    )
    await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id)
    router.refresh()
  }

  // ── Delete task ────────────────────────────────────
  async function deleteTask(id: string) {
    startTransition(() => setTasks(tasks.filter(t => t.id !== id)))
    await supabase.from('tasks').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display text-4xl font-bold text-ink">我的任務</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-sm text-muted">
            待完成 <strong className="text-ink">{pendingCount}</strong> ·{' '}
            已完成 <strong className="text-ink">{doneCount}</strong>
          </span>
          {!isPro && (
            <span className="text-xs text-muted bg-paper border border-border px-2.5 py-0.5 rounded-full">
              {taskCount} / {FREE_TASK_LIMIT} 任務
            </span>
          )}
          {isPro && <span className="badge-pro">⚡ Pro</span>}
        </div>

        {/* Free limit progress bar */}
        {!isPro && (
          <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden w-48">
            <div
              className={`h-full rounded-full transition-all ${limitReached ? 'bg-accent' : 'bg-ink/30'}`}
              style={{ width: `${Math.min((taskCount / FREE_TASK_LIMIT) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Upgrade banner */}
      {limitReached && (
        <div className="mb-6 card border-accent/30 bg-accent/5 p-4 flex items-center justify-between gap-4 animate-fade-up">
          <div>
            <p className="text-sm font-semibold text-ink">已達免費上限</p>
            <p className="text-xs text-muted mt-0.5">升級 Pro 解鎖無限任務、優先支援</p>
          </div>
          <Link href="/pricing" className="btn-primary flex items-center gap-1.5 whitespace-nowrap">
            <Crown size={13} /> 升級 Pro
          </Link>
        </div>
      )}

      {/* Add task form */}
      <form onSubmit={addTask} className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex gap-2 mb-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={limitReached ? '升級 Pro 以新增更多任務…' : '新增任務…'}
            disabled={limitReached}
            maxLength={500}
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={!text.trim() || adding || limitReached}
            className="btn-primary flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            新增
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Category select */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-paper text-muted
                       focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
          >
            {(Object.entries(CATEGORY_MAP) as [Category, { emoji: string; color: string }][]).map(([c, { emoji }]) => (
              <option key={c} value={c}>{emoji} {c}</option>
            ))}
          </select>

          {/* Priority select */}
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-paper text-muted
                       focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
          >
            {(Object.entries(PRIORITY_MAP) as [Priority, { label: string }][]).map(([p, { label }]) => (
              <option key={p} value={p}>優先度：{label}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-xs text-accent mt-2 bg-accent/8 px-3 py-2 rounded-lg flex items-center gap-2">
            ⚠️ {error}
            {error.includes('上限') && (
              <Link href="/pricing" className="underline font-medium ml-auto">升級</Link>
            )}
          </p>
        )}
      </form>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-border pb-0">
        {(['all', 'pending', 'done'] as FilterView[]).map(f => {
          const labels = { all: '全部', pending: '待完成', done: '已完成' }
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px
                ${filter === f
                  ? 'border-accent text-ink'
                  : 'border-transparent text-muted hover:text-ink'}`}
            >
              {labels[f]}
            </button>
          )
        })}
      </div>

      {/* Task list */}
      <ul className="space-y-2">
        {visible.length === 0 && (
          <li className="text-center py-16 text-muted text-sm">
            <div className="text-4xl mb-3">{filter === 'done' ? '🎉' : '📋'}</div>
            {filter === 'done' ? '還沒有完成的任務' : '新增你的第一個任務吧！'}
          </li>
        )}

        {visible.map((task, i) => {
          const cat = CATEGORY_MAP[task.category as Category]
          const pri = PRIORITY_MAP[task.priority as Priority]
          return (
            <li
              key={task.id}
              className={`card flex items-center gap-3 p-4 group
                          hover:-translate-y-px transition-all duration-150
                          animate-slide-in ${task.done ? 'opacity-55' : ''}`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              {/* Toggle button */}
              <button
                onClick={() => toggleTask(task)}
                className="flex-shrink-0 text-muted hover:text-accent transition-colors"
              >
                {task.done
                  ? <CheckCircle2 size={20} className="text-accent" />
                  : <Circle size={20} />}
              </button>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-ink ${task.done ? 'line-through text-muted' : ''}`}>
                  {task.text}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {cat && (
                    <span className="text-xs flex items-center gap-1" style={{ color: cat.color }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                      {task.category}
                    </span>
                  )}
                  {pri && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ color: pri.color, background: pri.bg }}
                    >
                      {pri.label}優先
                    </span>
                  )}
                  <span className="text-xs text-muted">
                    {new Date(task.created_at).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent
                           transition-all p-1 rounded flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </li>
          )
        })}
      </ul>

      {/* Clear done */}
      {doneCount > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={async () => {
              const doneIds = tasks.filter(t => t.done).map(t => t.id)
              startTransition(() => setTasks(tasks.filter(t => !t.done)))
              await supabase.from('tasks').delete().in('id', doneIds)
              router.refresh()
            }}
            className="text-xs text-muted hover:text-accent transition-colors underline"
          >
            清除所有已完成任務
          </button>
        </div>
      )}
    </div>
  )
}
