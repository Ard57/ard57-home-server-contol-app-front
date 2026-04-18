import React, { createContext, useContext } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase";
export interface MockUser {
  name: string;
}

export interface StatusResponse {
  status: 'active' | 'inactive';
  usersConnected: number;
  users: MockUser[];
}

const functions = getFunctions(app, "europe-central2");

const functionsApi = {
  connect: httpsCallable(functions, 'connect'),
  disconnect: httpsCallable(functions, 'disconnect'),
  status2: async () => {
    if (import.meta.env.DEV) {
      console.log("mock: calling status2 function");
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockUsers = [
          { name: "John Doe" },
          { name: "Jane Smith" },
          { name: "Peter Jones" },
      ];
      return {
        status: 'active',
        usersConnected: mockUsers.length,
        users: mockUsers
      };
    }
    const functionStatus2 = httpsCallable(functions, 'function_status2');
    return await functionStatus2(null);
    /*const { result, error } = await callFunction<null>(functions, 'function_status2', null);
    if (error) {
      throw error;
    }
    return result;*/
  }
};

const FunctionsContext = createContext<typeof functionsApi | undefined>(undefined);

export const FunctionsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <FunctionsContext.Provider value={functionsApi}>
      {children}
    </FunctionsContext.Provider>
  );
};

export const useFunctions = () => {
  const context = useContext(FunctionsContext);
  if (context === undefined) {
    throw new Error('useFunctions must be used within a FunctionsProvider');
  }
  return context;
};