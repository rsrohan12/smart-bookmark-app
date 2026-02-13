"use client";

import { Bookmark } from "@/types/bookmark";

type Props = {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
};

export default function BookmarkCard({ bookmark, onDelete }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
      <div>
        <p className="font-medium">{bookmark.title}</p>

        <a
          href={bookmark.url}
          target="_blank"
          className="text-sm text-blue-600 underline break-all"
        >
          {bookmark.url}
        </a>

        <p className="mt-1 text-xs text-gray-500">
          {new Date(bookmark.created_at).toLocaleString()}
        </p>
      </div>

      <button
        onClick={() => onDelete(bookmark.id)}
        className="text-sm cursor-pointer text-red-600"
      >
        Delete
      </button>
    </div>
  );
}
