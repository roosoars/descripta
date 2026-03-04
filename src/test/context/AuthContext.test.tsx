import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as firebaseAuth from 'firebase/auth';
import userEvent from '@testing-library/user-event';

// Mock firebase services
vi.mock('../../services/firebase', () => ({
    auth: {
        currentUser: null,
    },
}));

vi.mock('firebase/auth', async () => {
    const actual = await vi.importActual('firebase/auth');
    return {
        ...actual,
        onAuthStateChanged: vi.fn(),
        signInWithPopup: vi.fn(),
        signOut: vi.fn(),
        GoogleAuthProvider: vi.fn(),
        GithubAuthProvider: vi.fn(),
    };
});

// Helper component
const TestComponent = () => {
    const { user, loading, isGithubUser, loginWithGoogle, logout } = useAuth();
    if (loading) return <div>Loading...</div>;
    return (
        <div>
            {user ? <span data-testid="user-email">{user.email}</span> : <span>No User</span>}
            <span data-testid="is-github-user">{String(isGithubUser)}</span>
            <button onClick={loginWithGoogle}>Login Google</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        providerData: [{ providerId: 'github.com' }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('starts in loading state and updates when auth state resolves', async () => {
        // Mock onAuthStateChanged to immediately return null (no user logged in initially)
        (firebaseAuth.onAuthStateChanged as Mock).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(null);
            return () => { }; // unsubscribe
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Initially loading (might be too fast to catch, but waitFor helps)
        // Wait for loading to finish
        await waitFor(() => expect(screen.getByText('No User')).toBeInTheDocument());
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('sets user when onAuthStateChanged provides a user', async () => {
        (firebaseAuth.onAuthStateChanged as Mock).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(mockUser);
            return () => { };
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com'));
        expect(screen.getByTestId('is-github-user')).toHaveTextContent('true');
    });

    it('calls signInWithPopup when loginWithGoogle is called', async () => {
        (firebaseAuth.onAuthStateChanged as Mock).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(null);
            return () => { };
        });

        const user = userEvent.setup();
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.getByText('No User')).toBeInTheDocument());

        const loginButton = screen.getByText('Login Google');
        await user.click(loginButton);

        expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
        expect(firebaseAuth.GoogleAuthProvider).toHaveBeenCalled();
    });

    it('calls signOut when logout is called', async () => {
        (firebaseAuth.onAuthStateChanged as Mock).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(mockUser);
            return () => { };
        });

        const user = userEvent.setup();
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com'));

        const logoutButton = screen.getByText('Logout');
        await user.click(logoutButton);

        expect(firebaseAuth.signOut).toHaveBeenCalled();
    });
});
