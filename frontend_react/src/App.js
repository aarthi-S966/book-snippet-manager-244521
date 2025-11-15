import React, { useEffect, useState } from "react";
import "./App.css";
import "./styles/theme.css";
import { getEnv } from "./config/env";
import { getSupabaseClient } from "./lib/supabaseClient";
import { Router, parseHashRoute } from "./routes";
import { AuthModal } from "./components/AuthModal";

/** Error Boundary to catch runtime errors */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    const env = getEnv();
    if (env.isDev) env.log.error("ErrorBoundary", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="container">
          <div className="card" style={{ padding: 16, color: "#EF4444" }}>
            <h2>Something went wrong</h2>
            <p>Try reloading the page. If the issue persists, contact support.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Setup notice when Supabase env is missing */
function SetupNotice() {
  return (
    <div className="container">
      <div className="card" style={{ padding: 16 }}>
        <h2>Configuration required</h2>
        <p>Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your environment.</p>
      </div>
    </div>
  );
}

/** PUBLIC_INTERFACE
 * App entry point with simple hash router and Supabase auth session handling.
 */
function App() {
  const env = getEnv();
  const supabase = getSupabaseClient();
  const [routeState, setRouteState] = useState(parseHashRoute());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Routing
  useEffect(() => {
    const handler = () => setRouteState(parseHashRoute());
    window.addEventListener("hashchange", handler);
    if (!window.location.hash) window.location.hash = "/";
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  // Auth: load session and subscribe to changes
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <ErrorBoundary>
        <SetupNotice />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <Router
          route={routeState.route}
          params={routeState.params}
          navigate={navigate}
          user={user}
          onSignInClick={() => setAuthModalOpen(true)}
          onSignOut={async () => { await supabase.auth.signOut(); }}
        />
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => {}} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
