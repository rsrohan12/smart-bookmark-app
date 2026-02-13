"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

export default function DashboardPage() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // Load user + initial bookmarks
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }

      setUserId(data.user.id);

      const { data: bookmarkData } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      setBookmarks(bookmarkData || []);
    };

    init();
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // easiest human approach: refetch list
          const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          setBookmarks(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim() || !userId) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: userId,
    });

    setTitle("");
    setUrl("");
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  return (
    <main className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your Bookmarks</h1>
          <button
            onClick={logout}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            Logout
          </button>
        </div>

        <form
          onSubmit={addBookmark}
          className="mt-6 rounded-xl border p-4 space-y-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border px-3 py-2"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (https://...)"
            className="w-full rounded-lg border px-3 py-2"
          />
          <button className="w-full rounded-lg bg-black text-white py-2">
            Add Bookmark
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {bookmarks.length === 0 ? (
            <p className="text-sm text-gray-600">
              No bookmarks yet. Add your first one.
            </p>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="flex items-start justify-between gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="font-medium">{b.title}</p>
                  <a
                    href={b.url}
                    target="_blank"
                    className="text-sm text-blue-600 underline break-all"
                  >
                    {b.url}
                  </a>
                </div>

                <button
                  onClick={() => deleteBookmark(b.id)}
                  className="text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
