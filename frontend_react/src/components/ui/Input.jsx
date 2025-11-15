import React from "react";

/** PUBLIC_INTERFACE
 * Input component with label and error message
 */
export function Input({ label, error, id, className = "", ...props }) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={inputId} style={{ display: "block", marginBottom: 6 }}>{label}</label>}
      <input id={inputId} className="input" aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} {...props} />
      {error && <div id={`${inputId}-error`} role="alert" style={{ color: "#EF4444", marginTop: 4, fontSize: 12 }}>{error}</div>}
    </div>
  );
}
