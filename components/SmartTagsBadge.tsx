"use client";

import type { SmartTag } from "@/lib/smartTags";

export default function SmartTagsBadge({ tags }: { tags: SmartTag[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex gap-1 flex-wrap">
      {tags.map((tag) => (
        <span
          key={tag.type}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tag.color}`}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
