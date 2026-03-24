# 🚀 Taskly — SaaS Todo App

Next.js 14 · Supabase · Stripe · TypeScript · Tailwind · Vercel

---

## 目錄結構

```
todo-saas/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # 行銷首頁
│   │   ├── auth/page.tsx                # 登入 / 註冊
│   │   ├── pricing/page.tsx             # 定價頁
│   │   ├── dashboard/
│   │   │   ├── layout.tsx               # 側邊欄 (SSR + auth guard)
│   │   │   └── page.tsx                 # 任務看板 (SSR)
│   │   └── api/
│   │       ├── auth/signout/route.ts    # 登出
│   │       └── stripe/
│   │           ├── checkout/route.ts    # 建立付款 Session
│   │           ├── portal/route.ts      # 訂閱管理入口
│   │           └── webhook/route.ts     # ⭐ 同步訂閱狀態（最關鍵）
│   ├── components/
│   │   ├── TaskBoard.tsx                # 任務 UI（客戶端）
│   │   ├── CheckoutButton.tsx           # 付款按鈕
│   │   └── ManageBillingButton.tsx      # 管理訂閱按鈕
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # 瀏覽器 client
│   │   │   └── server.ts                # Server Component client
│   │   └── stripe.ts                    # Stripe SDK
│   └── types/index.ts                   # 共用型別
├── supabase/migrations/001_init.sql     # 完整資料庫 schema
├── middleware.ts                        # 路由保護
├── .env.example                         # 環境變數範本
└── README.md
```

---

## Step 1 — 安裝

```bash
npx create-next-app@latest todo-saas --typescript --tailwind --app --src-dir
cd todo-saas
npm install @supabase/supabase-js @supabase/ssr stripe lucide-react
# 複製本專案所有檔案到 todo-saas/
```

---

## Step 2 — Supabase 設定

1. 前往 [supabase.com](https://supabase.com) 建立新專案
2. **SQL Editor** → 貼上 `supabase/migrations/001_init.sql` → 執行
3. **Project Settings → API**：複製
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`（僅用於 webhook，絕不暴露前端）
4. **Authentication → Providers**：確認 Email 已啟用

---

## Step 3 — Stripe 設定

1. 前往 [stripe.com](https://stripe.com) → **Products** → 新增產品
   - 名稱：`Taskly Pro`
   - 價格：`$9.00 USD` / `monthly` / `recurring`
   - 複製 **Price ID** → `STRIPE_PRO_PRICE_ID`
2. **Developers → API keys**：
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. **Billing → Customer portal**：啟用，設定允許取消訂閱

---

## Step 4 — 本地開發

```bash
cp .env.example .env.local
# 填入所有環境變數

npm run dev

# 另開終端機，監聽 Stripe webhook（需安裝 Stripe CLI）
stripe listen --forward-to localhost:3000/api/stripe/webhook
# 複製輸出的 whsec_... → STRIPE_WEBHOOK_SECRET
```

---

## Step 5 — 部署到 Vercel

```bash
npm install -g vercel
vercel

# 在 Vercel Dashboard → Settings → Environment Variables
# 貼上所有 .env.example 中的變數
```

### Stripe Webhook 設定（生產環境）

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL：`https://your-app.vercel.app/api/stripe/webhook`
3. 監聽事件（全選以下）：
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `checkout.session.completed`
4. 複製 **Signing secret** → `STRIPE_WEBHOOK_SECRET`（Vercel 環境變數）

---

## 架構說明

```
使用者付款
    ↓
Stripe Checkout Session (checkout/route.ts)
    ↓
付款成功
    ↓
Stripe Webhook → /api/stripe/webhook
    ↓
寫入 Supabase profiles (is_pro=true, sub_status='active')
    ↓
DB Trigger (check_task_limit) 阻擋免費用戶超出 50 任務
    ↓
用戶取消訂閱
    ↓
Stripe Webhook → is_pro=false
```

### 安全機制

| 層級 | 機制 |
|------|------|
| 路由 | `middleware.ts` — 未登入自動跳轉 `/auth` |
| 資料庫 | Row Level Security — 用戶只能存取自己的資料 |
| 任務上限 | `check_task_limit` DB trigger — **無法被前端繞過** |
| Webhook | `stripe.webhooks.constructEvent` 驗證簽章 |
| 訂閱同步 | Webhook 即時寫回 `is_pro`，取消立即停用 |

---

## 收費功能擴充建議

- [ ] Stripe Coupon / Promo code 折扣碼
- [ ] Annual plan（年繳85折）
- [ ] Team plan（多用戶 workspace）
- [ ] Usage-based billing（任務數計費）
- [ ] Email 自動化（Resend）：歡迎信、付款失敗提醒、到期提醒

---

## 環境變數完整清單

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # 僅後端，勿暴露

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

NEXT_PUBLIC_APP_URL=
```
