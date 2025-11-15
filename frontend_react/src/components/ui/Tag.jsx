import React from "react";

/** PUBLIC_INTERFACE
 * Tag component used for snippet tags with onRemove optional
 */
export function Tag({ label, onRemove }) {
  return (
    <span className="tag" aria-label={`tag ${label}`}>
      {label}
      {onRemove && (
        <button
          type="button"
          aria-label={`remove tag ${label}`}
          onClick={onRemove}
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          ×
        </button>
      )}
    </span>
  );
}
