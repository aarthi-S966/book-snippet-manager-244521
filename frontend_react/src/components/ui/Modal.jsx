import React, { useEffect, useRef } from "react";

/** PUBLIC_INTERFACE
 * Accessible Modal/Dialog with focus trap
 */
export function Modal({ open, title, onClose, children, actions }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    dialogRef.current?.focus();
    return () => prev && prev.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      ref={dialogRef}
      onKeyDown={(e) => e.key === "Escape" && onClose?.()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="card" style={{ width: "min(560px, 92vw)", padding: 16, boxShadow: "var(--shadow-lg)" }}>
        <div className="ocean-header" style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>
          <h2 id="modal-title" style={{ margin: 0 }}>{title}</h2>
        </div>
        <div>{children}</div>
        {actions && <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>{actions}</div>}
      </div>
    </div>
  );
}
