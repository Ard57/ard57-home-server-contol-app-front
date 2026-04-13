import { useState } from "react";
import { useAuth } from "./auth/useAuth";
import Status from "./pages/Status";
import NavBar from "./components/ui/Navbar";
import { FunctionsProvider } from './functions/useFunctions';
import { BrowserRouter } from "react-router-dom";

function App() {
  const { user, loading } = useAuth();
  const [, setIsOnline] = useState(false);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
        <div className="text-2xl font-medium text-slate-700">Loading...</div>
      </div>
    )
  }

  const collectionName = import.meta.env.VITE_FIRESTORE_COLLECTION_NAME || 'servers';
  const documentId = import.meta.env.VITE_HOME_SERVER_ID || 'home';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {user ? (
            <FunctionsProvider>
              <Status 
                onStatusChange={setIsOnline} 
                collectionName={collectionName}
                documentId={documentId}
              />
            </FunctionsProvider>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-700">Please sign in to continue</h2>
              <p className="text-slate-600 mt-2">Use the buttons in the top right to sign in.</p>
            </div>
          )}
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;
