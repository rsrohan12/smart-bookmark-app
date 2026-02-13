"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bookmark } from "@/types/bookmark";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkCard from "@/components/BookmarkCard";

export default function DashboardPage() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async (uid: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error) setBookmarks(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email || "");

      await fetchBookmarks(data.user.id);
      setLoading(false);
    };

    init();
  }, []);

  // Realtime sync
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
          await fetchBookmarks(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const addBookmark = async (title: string, url: string) => {
    if (!userId) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: userId,
    });
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Your Bookmarks</h1>
            <p className="text-sm text-gray-600">{email}</p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            Logout
          </button>
        </div>

        <div className="mt-6">
          <BookmarkForm onAdd={addBookmark} />
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-600">Loading...</p>
          ) : bookmarks.length === 0 ? (
            <p className="text-sm text-gray-600">
              No bookmarks yet. Add your first one.
            </p>
          ) : (
            bookmarks.map((b) => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                onDelete={deleteBookmark}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
