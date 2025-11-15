import React from "react";
import { Card } from "./ui/Card";
import { Tag } from "./ui/Tag";

/** PUBLIC_INTERFACE
 * Snippet summary card
 */
export function SnippetCard({ snippet, onClick }) {
  const { title, author, bookTitle, content, tags = [], is_public } = snippet || {};
  return (
    <Card className="snippet-card" style={{ padding: 12, cursor: "pointer" }}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open snippet ${title || ""}`}
        onClick={onClick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
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
          {content?.slice(0, 140)}{content && content.length > 140 ? "..." : ""}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(Array.isArray(tags) ? tags : []).map((t) => <Tag key={t} label={t} />)}
        </div>
      </div>
    </Card>
  );
}
