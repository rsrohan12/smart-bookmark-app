"use client";

import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const supabase = createClient();

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Smart Bookmark App</h1>

        <p className="mt-2 text-sm text-gray-600">
          Login with Google to save and manage your bookmarks.
        </p>

        <button
          onClick={loginWithGoogle}
          className="mt-6 cursor-pointer w-full rounded-lg bg-black text-white py-2"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
