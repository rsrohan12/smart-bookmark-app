"use client";

import { useState } from "react";

type Props = {
  onAdd: (title: string, url: string) => Promise<void>;
};

export default function BookmarkForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) return;

    try {
      setLoading(true);
      await onAdd(title.trim(), url.trim());
      setTitle("");
      setUrl("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border p-4 space-y-3">
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

      <button
        disabled={loading}
        className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Bookmark"}
      </button>
    </form>
  );
}
