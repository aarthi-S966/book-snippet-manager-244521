import React from "react";

/** PUBLIC_INTERFACE
 * Simple toast message box. Use controlled visibility from parent.
 */
export function Toast({ message, type = "info", onClose }) {
  const bg = type === "error" ? "rgba(239,68,68,0.9)" : type === "success" ? "rgba(16,185,129,0.9)" : "rgba(37,99,235,0.9)";
  return (
    <div
      role="status"
      aria-live="polite"
      className="card"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: bg,
        color: "white",
        padding: "10px 12px",
        borderRadius: 10,
        boxShadow: "var(--shadow-lg)",
        zIndex: 999,
        maxWidth: "320px"
      }}
      onClick={onClose}
    >
      {message}
    </div>
  );
}
