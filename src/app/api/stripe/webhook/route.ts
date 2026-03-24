import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Use service-role key to bypass RLS in webhooks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

async function syncSubscription(sub: Stripe.Subscription) {
  const uid = sub.metadata?.supabase_uid
  if (!uid) return

  const isActive = sub.status === 'active' || sub.status === 'trialing'

  await supabaseAdmin.from('profiles').update({
    is_pro:         isActive,
    stripe_sub_id:  sub.id,
    sub_status:     isActive ? 'active' : sub.status,
    sub_period_end: new Date(sub.current_period_end * 1000).toISOString(),
  }).eq('id', uid)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  switch (event.type) {
    // Subscription created or updated
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await syncSubscription(event.data.object as Stripe.Subscription)
      break

    // Subscription cancelled / expired
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const uid = sub.metadata?.supabase_uid
      if (uid) {
        await supabaseAdmin.from('profiles').update({
          is_pro:     false,
          sub_status: 'canceled',
        }).eq('id', uid)
      }
      break
    }

    // Payment failed — flag the account
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id

      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId)
        const uid = sub.metadata?.supabase_uid
        if (uid) {
          await supabaseAdmin.from('profiles').update({
            sub_status: 'past_due',
          }).eq('id', uid)
        }
      }
      break
    }

    // Checkout completed — link customer to user if not already done
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const uid = session.metadata?.supabase_uid
      const customerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id

      if (uid && customerId) {
        await supabaseAdmin.from('profiles').update({
          stripe_customer_id: customerId,
        }).eq('id', uid)
      }
      break
    }

    default:
      // Unhandled events — return 200 so Stripe doesn't retry
      break
  }

  return NextResponse.json({ received: true })
}

// Required: disable body parsing so we can verify the raw signature
export const config = { api: { bodyParser: false } }
