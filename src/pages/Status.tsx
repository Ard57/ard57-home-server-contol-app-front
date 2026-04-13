import { useCallback } from "react";
import { firestore } from "../firebase";
import ServerCard, { type ServerData } from "../components/ServerCard";

interface StatusProps {
  onStatusChange: (isGreen: boolean) => void;
  collectionName: string;
  documentId: string;
}

const Status: React.FC<StatusProps> = ({ onStatusChange, collectionName, documentId }) => {
  const handleDataChange = useCallback((data: ServerData | null) => {
    onStatusChange(data?.status === 'active');
  }, [onStatusChange]);

  return (
    <ServerCard
      firestore={firestore}
      collectionName={collectionName}
      documentId={documentId}
      onDataChange={handleDataChange}
    />
  );
};

export default Status;
