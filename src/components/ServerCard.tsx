import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, Firestore } from 'firebase/firestore';
import { useAuth } from '../auth/useAuth';
import { useFunctions } from '../functions/useFunctions';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import PeopleIcon from '@mui/icons-material/People';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AutorenewIcon from '@mui/icons-material/Autorenew';

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

  const renderMessage = (message: string) => (
    <Card className="bg-slate-50 border-dashed">
      <CardContent className="flex items-center justify-center gap-3 py-12 text-slate-500">
        {loading && <AutorenewIcon className="animate-spin" fontSize="small" />}
        <span>{message}</span>
      </CardContent>
    </Card>
  );

  if (loading) {
    return renderMessage("Loading...");
  }

  if (error) {
    return renderMessage(`Error: ${error.message}`);
  }

  if (!serverDocData) {
    return renderMessage("Server not found.");
  }

  const isUserConnected = !!(user && activeUsers && user.uid in activeUsers);
  const isOnline = serverDocData.status === 'online';
  const userCount = serverDocData.userCount || 0;
  const activeUserEntries = Object.entries(activeUsers || {});

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className={`h-2 w-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle>{serverDocData.name}</CardTitle>
            <CardDescription className="mt-1">{serverDocData.desc || 'No description'}</CardDescription>
          </div>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
            isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <PeopleIcon fontSize="small" />
            <span>{userCount} active connection{userCount !== 1 ? 's' : ''}</span>
          </div>

          {activeUserEntries.length > 0 && (
            <ul className="list-none p-0 space-y-1 text-sm text-slate-600">
              {activeUserEntries.map(([uid, displayName]) => (
                <li key={uid} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {displayName}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 border-t border-slate-100 pt-6">
        {isUserConnected ? (
          <Button
            className="w-full gap-2 bg-red-500 hover:bg-red-500/90 text-white"
            onClick={handleDisconnect}
            disabled={isConnecting}
          >
            {isConnecting ? <AutorenewIcon className="animate-spin" fontSize="small" /> : <PowerSettingsNewIcon fontSize="small" />}
            Disconnect
          </Button>
        ) : (
          <Button
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? <AutorenewIcon className="animate-spin" fontSize="small" /> : <PowerSettingsNewIcon fontSize="small" />}
            {isOnline ? 'Connect' : 'Connect & Power On'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ServerCard;
