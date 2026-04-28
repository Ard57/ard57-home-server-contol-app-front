import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, Firestore } from 'firebase/firestore';
import { useAuth } from '../auth/useAuth';
import { useFunctions } from '../functions/useFunctions';
import { Button } from './ui/Button';

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
  const { connect, disconnect } = useFunctions();
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

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

  const handleConnect = async () => {
    if (!user) return;
    setIsConnecting(true);
    try {
      await connect({ serverId: documentId });
    } catch (error) {
      console.error("Error connecting:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    setIsConnecting(true);
    try {
      await disconnect({ serverId: documentId });
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">Loading...</p>;
  }

  if (error) {
    return <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">Error: {error.message}</p>;
  }

  if (!serverData) {
    return <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">Server not found.</p>;
  }

  const isUserConnected = user && serverData.activeUsers.hasOwnProperty(user.uid);

  return (
    <>
        <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">
            {serverData.name}: {serverData.status} ({serverData.userCount} users).
        </p>
        <p className="text-slate-500 text-shadow-md text-lg font-light mt-2">
            {serverData.desc}
        </p>

        <div className="mt-4">
            {isUserConnected ? (
                <Button onClick={handleDisconnect} disabled={isConnecting}>
                    {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
            ) : (
                <Button onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
            )}
        </div>

        <ul className="list-none p-0 mt-4 text-slate-600 text-base text-left">
            {Object.entries(serverData.activeUsers).map(([uid, displayName]) => (
                <li key={uid}>{displayName}</li>
            ))}
        </ul>
    </>
  );
};

export default ServerCard;
