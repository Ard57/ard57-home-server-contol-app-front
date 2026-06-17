import { useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    signInAnonymously as firebaseSignInAnonymously,
    type User
} from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(!import.meta.env.DEV);

    const signIn = async () => {
        if (import.meta.env.DEV) {
            const mockUser: User = {
                phoneNumber: "mock-phone-number",
                uid: "mock-uid",
                displayName: "Mock User",
                email: "mock.user@example.com",
                photoURL: "https://placekitten.com/200/200",
                providerId: "mock",
                emailVerified: true,
                isAnonymous: false,
                metadata: {},
                providerData: [],
                refreshToken: "mock-token",
                tenantId: null,
                delete: async () => { },
                getIdToken: async () => "mock-id-token",
                getIdTokenResult: async () => ({
                    token: "mock-id-token",
                    expirationTime: "2099-12-31T23:59:59.999Z",
                    authTime: "2021-01-01T00:00:00.000Z",
                    issuedAtTime: "2021-01-01T00:00:00.000Z",
                    signInProvider: "mock",
                    signInSecondFactor: null,
                    claims: {},
                }),
                reload: async () => { },
                toJSON: () => ({}),
            };
            setUser(mockUser);
        } else {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        }
    };

    const signInAnonymously = async () => {
        if (import.meta.env.DEV) {
            const mockUser: User = {
                phoneNumber: null,
                uid: "mock-anonymous-uid",
                displayName: null,
                email: null,
                photoURL: null,
                providerId: "anonymous",
                emailVerified: false,
                isAnonymous: true,
                metadata: {},
                providerData: [],
                refreshToken: "mock-token",
                tenantId: null,
                delete: async () => { },
                getIdToken: async () => "mock-id-token",
                getIdTokenResult: async () => ({
                    token: "mock-id-token",
                    expirationTime: "2099-12-31T23:59:59.999Z",
                    authTime: "2021-01-01T00:00:00.000Z",
                    issuedAtTime: "2021-01-01T00:00:00.000Z",
                    signInProvider: "anonymous",
                    signInSecondFactor: null,
                    claims: {},
                }),
                reload: async () => { },
                toJSON: () => ({}),
            };
            setUser(mockUser);
        } else {
            await firebaseSignInAnonymously(auth);
        }
    };

    const logOut = async () => {
        if (import.meta.env.DEV) {
            setUser(null);
        } else {
            await signOut(auth);
        }
    };

    useEffect(() => {
        if (import.meta.env.DEV) {
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        loading,
        signIn,
        signInAnonymously,
        signOut: logOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export type AuthContextType = {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signInAnonymously: () => Promise<void>;
    signOut: () => Promise<void>;
};
