
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    type User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    type UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    register: (email: string, password: string) => Promise<UserCredential>;
    login: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!auth) {
            console.warn("Auth context: Firebase not configured, auth features disabled.");
            setIsLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = (email: string, password: string): Promise<UserCredential> => {
        if (!auth) {
            return Promise.reject(new Error("Firebase is not configured."));
        }
        return signInWithEmailAndPassword(auth, email, password);
    }
    
    const handleRegister = (email: string, password: string): Promise<UserCredential> => {
        if (!auth) {
            return Promise.reject(new Error("Firebase is not configured."));
        }
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const handleLogout = async () => {
        if (!auth) {
            console.warn("Attempted to log out, but Firebase is not configured.");
            return;
        }
        try {
            await signOut(auth);
             toast({
                title: "Oturum Kapatıldı",
                description: "Başarıyla çıkış yaptınız.",
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Hata",
                description: "Oturum kapatılırken bir hata oluştu.",
            });
        }
    }

    const value = {
        user,
        isLoading,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
