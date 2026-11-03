import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "../auth/useAuth";
import ServerCard from "../components/ServerCard";

interface StatusProps {
  collectionName: string;
  demoCollectionName: string;
}

interface ServerIdsState {
  ids: string[];
  loading: boolean;
  error: Error | null;
}

// Subscribes to server ids: document ids of a collection, or keys of a document's `servers` map
const useServerIds = (path: string[] | null, source: "collection" | "userDoc"): ServerIdsState => {
  const [result, setResult] = useState<{ pathKey: string; ids: string[]; error: Error | null } | null>(null);
  const pathKey = path?.join("/");

  useEffect(() => {
    if (!pathKey) {
      return;
    }

    const onError = (err: Error) => {
      console.error(`Error subscribing to ${pathKey}:`, err);
      setResult({ pathKey, ids: [], error: new Error("Servers not available.") });
    };

    if (source === "userDoc") {
      return onSnapshot(doc(firestore, pathKey), (snap) => {
        setResult({ pathKey, ids: Object.keys(snap.data()?.servers || {}), error: null });
      }, onError);
    }

    return onSnapshot(collection(firestore, pathKey), (snap) => {
      setResult({ pathKey, ids: snap.docs.map(d => d.id), error: null });
    }, onError);
  }, [pathKey, source]);

  if (!pathKey) {
    return { ids: [], loading: false, error: null };
  }

  if (result?.pathKey !== pathKey) {
    return { ids: [], loading: true, error: null };
  }

  return { ids: result.ids, loading: false, error: result.error };
};

const Status: React.FC<StatusProps> = ({ collectionName, demoCollectionName }) => {
  const { user } = useAuth();

  const userServers = useServerIds(user ? ["users", user.uid] : null, "userDoc");
  const demoServers = useServerIds([demoCollectionName], "collection");

  if (userServers.loading || demoServers.loading) {
    return <p className="text-center text-slate-500">Loading servers...</p>;
  }

  if (demoServers.error && userServers.ids.length === 0) {
    return <p className="text-center text-slate-500">Error: {demoServers.error.message}</p>;
  }

  const userServerIds = userServers.ids;
  const demoServerIds = demoServers.ids.filter(id => !userServerIds.includes(id));

  if (userServerIds.length === 0 && demoServerIds.length === 0) {
    return <p className="text-center text-slate-500">No servers available.</p>;
  }

  const renderGrid = (ids: string[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ids.map(id => (
        <ServerCard
          key={id}
          firestore={firestore}
          collectionName={collectionName}
          documentId={id}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      {userServerIds.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">My Servers</h2>
          {renderGrid(userServerIds)}
        </section>
      )}

      {demoServerIds.length > 0 && (
        <section className="space-y-4">
          {userServerIds.length > 0 && (
            <h2 className="text-2xl font-bold tracking-tight">Demo Servers</h2>
          )}
          {renderGrid(demoServerIds)}
        </section>
      )}
    </div>
  );
};

export default Status;
