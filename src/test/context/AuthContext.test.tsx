import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as firebaseAuth from 'firebase/auth';
import userEvent from '@testing-library/user-event';

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

const TestComponent = () => {
    const {
        user,
        loading,
        isGithubUser,
        githubAccessToken,
        loginWithGoogle,
        loginWithGithub,
        logout,
    } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {user ? <span data-testid="user-email">{user.email}</span> : <span>No User</span>}
            <span data-testid="is-github-user">{String(isGithubUser)}</span>
            <span data-testid="github-token">{githubAccessToken || 'none'}</span>
            <button onClick={loginWithGoogle}>Login Google</button>
            <button onClick={loginWithGithub}>Login GitHub</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    const mockGithubUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        providerData: [{ providerId: 'github.com' }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();

        (firebaseAuth.GithubAuthProvider as unknown as Mock).mockImplementation(() => ({
            addScope: vi.fn(),
        }));
        (firebaseAuth.GoogleAuthProvider as unknown as Mock).mockImplementation(() => ({}));
        (firebaseAuth.GithubAuthProvider as unknown as { credentialFromResult: Mock }).credentialFromResult = vi.fn(() => ({
            accessToken: 'gh-oauth-token',
        }));
    });

    it('starts in loading and resolves without user', async () => {
        (firebaseAuth.onAuthStateChanged as Mock).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(null);
            return () => { };
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.getByText('No User')).toBeInTheDocument());
        expect(screen.getByTestId('github-token')).toHaveTextContent('none');
    });

    it('sets user and github flag when provider is github', async () => {
        (firebaseAuth.onAuthStateChanged as Mock).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(mockGithubUser);
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

    it('calls signInWithPopup when loginWithGoogle is used', async () => {
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

        await user.click(screen.getByText('Login Google'));

        expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
        expect(firebaseAuth.GoogleAuthProvider).toHaveBeenCalled();
    });

    it('captures github oauth token after loginWithGithub', async () => {
        (firebaseAuth.onAuthStateChanged as Mock).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(null);
            return () => { };
        });
        (firebaseAuth.signInWithPopup as Mock).mockResolvedValue({ providerId: 'github.com' });

        const user = userEvent.setup();
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await user.click(screen.getByText('Login GitHub'));

        await waitFor(() => {
            expect(screen.getByTestId('github-token')).toHaveTextContent('gh-oauth-token');
        });
        expect(sessionStorage.getItem('github_oauth_token')).toBe('gh-oauth-token');
    });

    it('calls signOut when logout is used', async () => {
        (firebaseAuth.onAuthStateChanged as Mock).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(mockGithubUser);
            return () => { };
        });

        const user = userEvent.setup();
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com'));
        await user.click(screen.getByText('Logout'));
        expect(firebaseAuth.signOut).toHaveBeenCalled();
    });
});
