import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TaskBoard from '@/components/TaskBoard'
import type { Profile, Task } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: tasks }, { data: profile }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
  ])

  return (
    <TaskBoard
      initialTasks={(tasks ?? []) as Task[]}
      profile={(profile ?? { is_pro: false, sub_status: 'free' }) as Profile}
      userId={user.id}
    />
  )
}
