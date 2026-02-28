import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'citizen' | 'admin';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string, role: 'citizen' | 'admin') => Promise<void>;
    signup: (email: string, pass: string, name: string, role: 'citizen' | 'admin') => Promise<void>;
    loginWithGoogle: (role: 'citizen' | 'admin') => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch additional user data (role) from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: userData.name || firebaseUser.displayName || 'User',
                        role: userData.role || 'citizen',
                        avatar: firebaseUser.photoURL || undefined
                    });
                } else {
                    // Fallback for cases where document doesn't exist yet
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || 'User',
                        role: 'citizen'
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string, _role: 'citizen' | 'admin') => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email: string, pass: string, name: string, role: 'citizen' | 'admin') => {
        setLoading(true);
        try {
            const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, pass);

            // Create user document in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                name,
                email,
                role,
                createdAt: serverTimestamp()
            });

            setUser({
                id: firebaseUser.uid,
                email,
                name,
                role
            });
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (role: 'citizen' | 'admin') => {
        setLoading(true);
        try {
            const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);

            // Check if user document exists, if not create it
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                    name: firebaseUser.displayName || 'Google User',
                    email: firebaseUser.email,
                    role: role, // Assign the role selected during sign-in
                    createdAt: serverTimestamp()
                });
            }

            // State is handled by onAuthStateChanged listener
        } catch (error) {
            console.error("Google logic error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
