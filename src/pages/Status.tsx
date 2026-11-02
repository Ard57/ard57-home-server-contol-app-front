import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";
import ServerCard from "../components/ServerCard";

interface StatusProps {
  collectionName: string;
  demoCollectionName: string;
}

const Status: React.FC<StatusProps> = ({ collectionName, demoCollectionName }) => {
  const [serverIds, setServerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, demoCollectionName), (snap) => {
      setServerIds(snap.docs.map(d => d.id));
      setError(null);
      setLoading(false);
    }, (err) => {
      console.error("Error subscribing to demo servers:", err);
      setError(new Error("Demo servers not available."));
      setLoading(false);
    });

    return unsubscribe;
  }, [demoCollectionName]);

  if (loading) {
    return <p className="text-center text-slate-500">Loading servers...</p>;
  }

  if (error) {
    return <p className="text-center text-slate-500">Error: {error.message}</p>;
  }

  if (serverIds.length === 0) {
    return <p className="text-center text-slate-500">No demo servers available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {serverIds.map(id => (
        <ServerCard
          key={id}
          firestore={firestore}
          collectionName={collectionName}
          documentId={id}
        />
      ))}
    </div>
  );
};

export default Status;
