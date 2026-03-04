import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../../components/Auth/Login';

const loginWithGoogleMock = vi.fn();
const loginWithGithubMock = vi.fn();
const toggleThemeMock = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        loginWithGoogle: loginWithGoogleMock,
        loginWithGithub: loginWithGithubMock,
    }),
}));

vi.mock('../../../services/firebase', () => ({
    auth: {},
    app: {},
}));

vi.mock('../../../context/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'light',
        toggleTheme: toggleThemeMock,
    }),
}));

describe('Login', () => {
    it('renders icon logo and nav actions in expected order', () => {
        const { container } = render(<Login />);

        expect(container.querySelector('.login__nav-brand svg')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'ENTRAR' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Ativar modo escuro/i })).toBeInTheDocument();

        const navActions = container.querySelector('.login__nav-actions');
        expect(navActions?.firstElementChild?.textContent).toContain('ENTRAR');
    });

    it('opens login modal on access click', async () => {
        render(<Login />);

        const accessButton = screen.getByRole('button', { name: 'ENTRAR' });
        fireEvent.click(accessButton);

        expect(await screen.findByText(/Entrar no DESCRIPTA/)).toBeInTheDocument();
        expect(screen.getByText('Continuar com Google')).toBeInTheDocument();
    });

    it('calls login providers', async () => {
        render(<Login />);

        const accessButton = screen.getByRole('button', { name: 'ENTRAR' });
        fireEvent.click(accessButton);

        const googleBtn = await screen.findByText('Continuar com Google');
        fireEvent.click(googleBtn);

        expect(loginWithGoogleMock).toHaveBeenCalled();
    });

    it('toggles theme from navbar button', () => {
        render(<Login />);
        fireEvent.click(screen.getByRole('button', { name: /Ativar modo escuro/i }));
        expect(toggleThemeMock).toHaveBeenCalled();
    });
});
