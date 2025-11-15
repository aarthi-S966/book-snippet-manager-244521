import React from "react";
import { Tag } from "./ui/Tag";

/** PUBLIC_INTERFACE
 * Sidebar for tag filters
 */
export function Sidebar({ tags = [], activeTag, onSelectTag }) {
  return (
    <aside className="card" style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Filters</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          className="btn"
          aria-pressed={!activeTag}
          onClick={() => onSelectTag?.(null)}
          style={{
            background: activeTag ? "#e5e7eb" : "var(--color-primary)",
            color: activeTag ? "#111827" : "white",
          }}
        >
          All
        </button>
        {tags.map((t) => (
          <button
            key={t}
            className="btn"
            aria-pressed={activeTag === t}
            onClick={() => onSelectTag?.(t)}
            style={{
              background: activeTag === t ? "var(--color-primary)" : "#e5e7eb",
              color: activeTag === t ? "white" : "#111827",
            }}
          >
            <Tag label={t} />
          </button>
        ))}
      </div>
    </aside>
  );
}
