
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/useAuth";
import { useFunctions, type StatusResponse } from "../functions/useFunctions.tsx"; 
import button from '../assets/button.svg';
import './Status.css';

interface StatusProps {
  onStatusChange: (isGreen: boolean) => void;
}

const initialState: StatusResponse = { status: 'inactive', usersConnected: 0, users: [] };

const Status: React.FC<StatusProps> = ({ onStatusChange }) => {
  const { user } = useAuth();
  const functions = useFunctions();
  const [response, setResponse] = useState<StatusResponse>(initialState);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const data = await functions.status2();
        setResponse(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }
  }, [user, functions]);

  useEffect(() => {
    onStatusChange(response.status === 'active');
  }, [response.status, onStatusChange]);

  const handleButtonClick = () => {
    setResponse((prevResponse) => {
        const newStatus = prevResponse.status === 'active' ? 'inactive' : 'active';
        return {
            ...prevResponse,
            status: newStatus,
        }
    });
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isGreen = response.status === 'active';
  const buttonClassName = isGreen ? 'status-button-on' : 'status-button-off';

  return (
    <div className="status-container">
        <div className="status-header">
            <div className={`status-button-wrapper ${buttonClassName}`} onClick={handleButtonClick}>
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
                        {response.status}. {response.usersConnected} users connected.
                    </p>
                    <ul className="user-list">
                        {response.users.map((user: any) => (
                            <li key={user.name}>{user.name}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    </div>
  );
};

export default Status;
