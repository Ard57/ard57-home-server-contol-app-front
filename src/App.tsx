import { useState } from "react";
import { useAuth } from "./auth/useAuth";
import Status from "./pages/Status";
import NavBar from "./components/Navbar";
import Auth from "./components/Auth";
import { FunctionsProvider } from './functions/useFunctions';
import './App.css';
import { BrowserRouter } from "react-router-dom";

function App() {
  const { user, loading } = useAuth();
  const [isRisen, setIsRisen] = useState(true);

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <NavBar />
        <div className="app-container">
          <header className="app-header">
            <Auth />
          </header>
          <main className="content-wrapper">
            {user ? (
              <FunctionsProvider>
                <Status onStatusChange={setIsRisen} />
              </FunctionsProvider>
            ) : (
              <div className="login-prompt">
                <h2>Please sign in to continue</h2>
              </div>
            )}
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App;
