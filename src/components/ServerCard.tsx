import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, Firestore } from 'firebase/firestore';
import { useAuth } from '../auth/useAuth';

export interface ServerData {
    name: string;
    desc: string;
    status: string;
    userCount: number;
    activeUsers: Record<string, string>;
}

interface ServerCardProps {
  firestore: Firestore;
  collectionName: string;
  documentId: string;
  onDataChange?: (data: ServerData | null) => void;
}

const ServerCard: React.FC<ServerCardProps> = ({ firestore, collectionName, documentId, onDataChange }) => {
  const { user } = useAuth();
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const docRef = doc(firestore, collectionName, documentId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ServerData;
        setServerData(data);
        if (onDataChange) onDataChange(data);
      } else {
        setServerData(null);
        setError(new Error("Status document not found"));
        if (onDataChange) onDataChange(null);
      }
      setLoading(false);
    }, (err) => {
        console.error(err);
        setError(new Error("Status not available."));
        setLoading(false);
        if (onDataChange) onDataChange(null);
    });

    return () => unsubscribe();
  }, [firestore, collectionName, documentId, user, onDataChange]);

  if (loading) {
    return <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">Loading...</p>;
  }

  if (error) {
    return <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">Error: {error.message}</p>;
  }
  
  if (!serverData) {
    return <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">Server not found.</p>;
  }

  return (
    <>
        <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">
            {serverData.name}: {serverData.status} ({serverData.userCount} users).
        </p>
        <ul className="list-none p-0 mt-4 text-slate-600 text-base text-left">
            {Object.entries(serverData.activeUsers).map(([uid, displayName]) => (
                <li key={uid}>{displayName}</li>
            ))}
        </ul>
    </>
  );
};

export default ServerCard;
