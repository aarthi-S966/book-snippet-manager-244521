import React from "react";

/** PUBLIC_INTERFACE
 * NotFound page for unknown routes
 */
export function NotFound() {
  return (
    <div className="container">
      <div className="card" style={{ padding: 16 }}>
        <h2>404 - Not Found</h2>
        <p>The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}
