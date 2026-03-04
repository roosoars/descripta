import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    type User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    signOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';

const GITHUB_TOKEN_STORAGE_KEY = 'github_oauth_token';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isGithubUser: boolean;
    githubAccessToken: string | null;
    loginWithGoogle: () => Promise<void>;
    loginWithGithub: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [githubAccessToken, setGithubAccessToken] = useState<string | null>(() => sessionStorage.getItem(GITHUB_TOKEN_STORAGE_KEY));
    const isGithubUser = user?.providerData?.some((provider) => provider.providerId === 'github.com') ?? false;

    const persistGithubToken = (token: string | null) => {
        setGithubAccessToken(token);
        if (token) {
            sessionStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token);
            return;
        }
        sessionStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);

            const hasGithubSession = user?.providerData?.some((provider) => provider.providerId === 'github.com') ?? false;
            if (!hasGithubSession) {
                persistGithubToken(null);
            }
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const loginWithGithub = async () => {
        const provider = new GithubAuthProvider();
        provider.addScope('read:user');
        provider.addScope('models:read');

        const result = await signInWithPopup(auth, provider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        persistGithubToken(credential?.accessToken ?? null);
    };

    const logout = async () => {
        await signOut(auth);
        persistGithubToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isGithubUser,
                githubAccessToken,
                loginWithGoogle,
                loginWithGithub,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
