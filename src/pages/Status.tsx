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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ServerCard
        firestore={firestore}
        collectionName={collectionName}
        documentId={documentId}
        onDataChange={handleDataChange}
      />
    </div>
  );
};

export default Status;
