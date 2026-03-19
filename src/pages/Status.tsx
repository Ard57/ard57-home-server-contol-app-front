
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";
import button from '../assets/button.svg';
import './Status.css';

interface StatusProps {
  onStatusChange: (isGreen: boolean) => void;
}

interface StatusData {
    name: string;
    desc: string;
    status: string;
    userCount: number;
    activeUsers: Record<string, string>;
}

const initialState: StatusData = { name: '', desc: '', status: 'inactive', userCount: 0, activeUsers: {} };

const Status: React.FC<StatusProps> = ({ onStatusChange }) => {
  const { user } = useAuth();
  const [response, setResponse] = useState<StatusData>(initialState);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (import.meta.env.DEV) {
        console.log("Using mock status data in development.");
        const mockData: StatusData[] = [
          { name: "dev-server", desc: "Development server", status: "active", userCount: 2, activeUsers: { "uid-123": "Alice", "uid-456": "Bob" } },
          { name: "dev-server", desc: "Development server", status: "active", userCount: 3, activeUsers: { "uid-123": "Alice", "uid-456": "Bob", "uid-789": "Charlie" } },
          { name: "dev-server", desc: "Development server", status: "degraded", userCount: 1, activeUsers: { "uid-123": "Alice" } },
          { name: "dev-server", desc: "Development server", status: "inactive", userCount: 0, activeUsers: {} },
        ];
        let i = 0;
        const interval = setInterval(() => {
          setResponse(mockData[i]);
          i = (i + 1) % mockData.length;
          setLoading(false);
        }, 2000); // Update every 2 seconds
        return () => clearInterval(interval);
      } else {
        const collectionName = import.meta.env.VITE_FIRESTORE_COLLECTION_NAME;
        const documentId = import.meta.env.VITE_HOME_SERVER_ID;
        const docRef = doc(firestore, collectionName, documentId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setResponse(doc.data() as StatusData);
          } else {
            setError(new Error("Status document not found."));
          }
          setLoading(false);
        }, (err) => {
          setError(err);
          setLoading(false);
        });
        return () => unsubscribe();
      }
    }
  }, [user]);

  useEffect(() => {
    onStatusChange(response.status === 'active');
  }, [response.status, onStatusChange]);

  const isGreen = response.status === 'active';
  const buttonClassName = isGreen ? 'status-button-on' : 'status-button-off';

  return (
    <div className="status-container">
        <div className="status-header">
            <div className={`status-button-wrapper ${buttonClassName}`}>
                <img src={button} className="status-button" alt="status button" />
            </div>
        </div>
        <div className="status-body">
            {loading ? (
                <p className="status-text">Loading...</p>
            ) : error ? (
                <p className="status-text">Error: {error.message}</p>
            ) : (
                <>
                    <p className="status-text">
                        {response.name}: {response.status} ({response.userCount} users).
                    </p>
                    <ul className="user-list">
                        {Object.entries(response.activeUsers).map(([uid, displayName]) => (
                            <li key={uid}>{displayName}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    </div>
  );
};

export default Status;
