import React from "react";

/** PUBLIC_INTERFACE
 * Button component with variants and accessibility support.
 */
export function Button({ children, onClick, type = "button", variant = "primary", disabled = false, ariaLabel, className = "", ...rest }) {
  const base = "btn";
  const variantClass = variant === "secondary" ? "btn-secondary" : "btn-primary";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${base} ${variantClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
