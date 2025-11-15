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
        {tags.map((t) => {
          return (
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
          );
        })}
      </div>
    </aside>
  );
}
```

````write file="book-snippet-manager-244521/frontend_react/src/components/SnippetCard.jsx"
import React from "react";
import { Card } from "./ui/Card";
import { Tag } from "./ui/Tag";

/** PUBLIC_INTERFACE
 * Snippet summary card
 */
export function SnippetCard({ snippet, onClick }) {
  const { title, author, bookTitle, content, tags = [], is_public } = snippet;
  return (
    <Card className="snippet-card" style={{ padding: 12, cursor: "pointer" }} onClick={onClick} role="button" aria-label={`Open snippet ${title}`}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <h3 style={{ margin: "0 0 4px" }}>{title}</h3>
          <div style={{ fontSize: 13, color: "#374151" }}>
            {author} • <em>{bookTitle}</em>
          </div>
        </div>
        {is_public && <span className="tag" title="Public">Public</span>}
      </div>
      <p style={{ fontSize: 14, color: "#374151" }}>
        {content?.slice(0, 140)}{content?.length > 140 ? "..." : ""}
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(Array.isArray(tags) ? tags : []).map((t) => <Tag key={t} label={t} />)}
      </div>
    </Card>
  );
}
