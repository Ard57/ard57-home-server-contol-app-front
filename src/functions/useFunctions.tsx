/**
 * @file This file defines the facade for interacting with Firebase Functions,
 * following a similar pattern to the Auth facade. It provides a `useFunctions`
 * hook to access the functions API.
 *
 * This could be split into multiple files (e.g., for context, provider, types, and api)
 * for larger applications.
 */
import React, { createContext, useContext } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase";

export interface MockUser {
  name: string;
}

/**
 * The response from the status function.
 */
export interface StatusResponse {
  status: 'active' | 'inactive';
  usersConnected: number;
  users: MockUser[];
}

/**
* Interface for the callable functions API.
*/
export interface FunctionsAPI {
  status2: () => Promise<StatusResponse>;
}

// --- Implementations ---

class FirebaseFunctionsAPI implements FunctionsAPI {
  async status2(): Promise<StatusResponse> {
    const functions = getFunctions(app);
    const callable = httpsCallable<void, StatusResponse>(functions, 'function_status2');
    const { data } = await callable();
    return data;
  }
}

class MockFunctionsAPI implements FunctionsAPI {
  async status2(): Promise<StatusResponse> {
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
}

// --- Factory and Context ---

const functionsApi: FunctionsAPI = import.meta.env.DEV
  ? new MockFunctionsAPI()
  : new FirebaseFunctionsAPI();

const FunctionsContext = createContext<FunctionsAPI | undefined>(undefined);

// --- Provider and Hook ---

export const FunctionsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <FunctionsContext.Provider value={functionsApi}>
      {children}
    </FunctionsContext.Provider>
  );
};

export const useFunctions = (): FunctionsAPI => {
  const context = useContext(FunctionsContext);
  if (context === undefined) {
    throw new Error('useFunctions must be used within a FunctionsProvider');
  }
  return context;
};
