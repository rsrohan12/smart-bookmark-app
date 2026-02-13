# Smart Bookmark App

A simple bookmark manager where users can log in with Google, save private bookmarks, and see updates in real-time across tabs.

**Live Demo**
(Add your deployed Vercel URL here)

---

## 🛠 Tech Stack

* Next.js (App Router)
* Supabase (Auth + Database + Realtime)
* Tailwind CSS
* TypeScript

---

## ✨ Features

* Google login (OAuth only)
* Add bookmarks (title + URL)
* Bookmarks are private per user (RLS enabled)
* Real-time updates without refresh (works across multiple tabs)
* Delete your own bookmarks
* Deployed on Vercel

---

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # Handles Supabase OAuth callback
│   ├── dashboard/
│   │   └── page.tsx            # Main bookmarks UI + realtime subscription
│   └── page.tsx                # Login page
├── components/
│   ├── BookmarkCard.tsx         # Single bookmark UI + delete button
│   └── BookmarkForm.tsx         # Add bookmark form
├── lib/
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       └── server.ts            # Server Supabase client (used in callback)
└── types/
    └── bookmark.ts              # Bookmark type
```

---

## ⚙️ Local Setup

### 1. Clone the Repo

```bash
git clone <your-repo-url>
cd smart-bookmark-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Environment Variables

Create a `.env.local` file in the root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in:
**Supabase → Project Settings → API**

### 4. Run the Project

```bash
npm run dev
```

App will run on: **http://localhost:3000**

---

## 🔧 Supabase Setup Notes (Important)

### Database Table

A `bookmarks` table is created with:

* `id` (uuid)
* `user_id` (uuid, linked to auth.users)
* `title` (text)
* `url` (text)
* `created_at` (timestamp)

### Privacy (RLS)

Row Level Security (RLS) is enabled so that:

* Users can only **read** their own bookmarks
* Users can only **insert** bookmarks for themselves
* Users can only **delete** their own bookmarks

---

## 🐛 Problems I Ran Into (and How I Solved Them)

### 1) Realtime worked for INSERT but not DELETE

Initially, bookmarks were appearing in real-time when added, but deletions were not syncing across tabs.

**Fix:**
* Enabled realtime on the `bookmarks` table in Supabase
* Ensured `DELETE` events were broadcast
* Updated the client subscription to explicitly listen to `INSERT` and `DELETE` events and update state accordingly

### 2) UI didn't update instantly after deleting

At first, the deleted bookmark stayed in the UI until refresh.

**Fix:**
* Updated the UI state immediately when deleting (optimistic UI)
* Kept realtime enabled so other tabs stay in sync

---

## 🚀 Deployment

Deployed on Vercel.

To make Google login work in production:

* Added the Vercel domain in Supabase Auth URL configuration
* Added production redirect URL:
  ```
  https://your-domain.vercel.app/auth/callback
  ```
* Added the Vercel domain in Google Cloud OAuth credentials under **Authorized JavaScript Origins**