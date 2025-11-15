import React from "react";

/** PUBLIC_INTERFACE
 * Card container with optional header/footer
 */
export function Card({ children, className = "", style }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}
