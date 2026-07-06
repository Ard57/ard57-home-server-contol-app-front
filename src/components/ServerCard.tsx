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
  
  const [serverDocData, setServerDocData] = useState<Omit<ServerData, 'activeUsers'> | null>(null);
  const [activeUsers, setActiveUsers] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoading(true);

    const docRef = doc(firestore, collectionName, documentId);
    const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<ServerData, 'activeUsers'>;
        setServerDocData(data);
        setError(null);
      } else {
        setServerDocData(null);
        setError(new Error("Status document not found"));
      }
      setLoading(false);
    }, (err) => {
        console.error("Error subscribing to main server document:", err);
        setError(new Error("Status not available."));
        setLoading(false);
    });

    const stateRef = doc(firestore, collectionName, documentId, "details", "state");
    const unsubscribeState = onSnapshot(stateRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveUsers(data?.activeUsers || {});
      } else {
        setActiveUsers({});
      }
    }, (err) => {
        console.error("Error subscribing to state subdocument:", err);
    });

    return () => {
      unsubscribeDoc();
      unsubscribeState();
    };
  }, [firestore, collectionName, documentId, user]);

  useEffect(() => {
    if (onDataChange) {
      if (serverDocData) {
        onDataChange({
          ...serverDocData,
          activeUsers
        });
      } else {
        onDataChange(null);
      }
    }
  }, [serverDocData, activeUsers, onDataChange]);

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

  if (!serverDocData) {
    return <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">Server not found.</p>;
  }

  const isUserConnected = !!(user && activeUsers && user.uid in activeUsers);

  return (
    <>
        <p className="text-slate-700 text-shadow-lg text-2xl font-light mt-4">
            {serverDocData.name}: {serverDocData.status} ({serverDocData.userCount} users).
        </p>
        <p className="text-slate-500 text-shadow-md text-lg font-light mt-2">
            {serverDocData.desc}
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
            {Object.entries(activeUsers || {}).map(([uid, displayName]) => (
                <li key={uid}>{displayName}</li>
            ))}
        </ul>
    </>
  );
};

export default ServerCard;
