import React from "react";

/** PUBLIC_INTERFACE
 * TextArea component with label and error
 */
export function TextArea({ label, error, id, className = "", ...props }) {
  const inputId = id || `textarea-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`textarea-group ${className}`}>
      {label && <label htmlFor={inputId} style={{ display: "block", marginBottom: 6 }}>{label}</label>}
      <textarea id={inputId} className="textarea" aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} {...props} />
      {error && <div id={`${inputId}-error`} role="alert" style={{ color: "#EF4444", marginTop: 4, fontSize: 12 }}>{error}</div>}
    </div>
  );
}
