export type Priority = 'low' | 'medium' | 'high'
export type SubStatus = 'free' | 'active' | 'past_due' | 'canceled'

export interface Profile {
  id: string
  email: string | null
  is_pro: boolean
  stripe_customer_id: string | null
  stripe_sub_id: string | null
  sub_status: SubStatus
  sub_period_end: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  text: string
  category: string
  priority: Priority
  done: boolean
  created_at: string
}

export type Category = '工作' | '生活' | '學習' | '其他'

export const CATEGORY_MAP: Record<Category, { emoji: string; color: string }> = {
  '工作': { emoji: '💼', color: '#3b82f6' },
  '生活': { emoji: '🏠', color: '#22c55e' },
  '學習': { emoji: '📚', color: '#a855f7' },
  '其他': { emoji: '✨', color: '#f97316' },
}

export const PRIORITY_MAP: Record<Priority, { label: string; color: string; bg: string }> = {
  low:    { label: '低',  color: '#6b7280', bg: '#f3f4f6' },
  medium: { label: '中',  color: '#d97706', bg: '#fef3c7' },
  high:   { label: '高',  color: '#dc2626', bg: '#fee2e2' },
}

export const FREE_TASK_LIMIT = 50
