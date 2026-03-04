import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../../../components/Settings/Settings';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { discoverProviderModels } from '../../../services/model-discovery';

vi.mock('../../../context/AppContext', () => ({
    useApp: vi.fn(),
}));

vi.mock('../../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../../services/model-discovery', () => ({
    discoverProviderModels: vi.fn(),
}));

describe('Settings', () => {
    const baseContext = {
        apiKey: 'key123',
        setApiKey: vi.fn(),
        provider: 'gemini',
        setProvider: vi.fn(),
        model: 'gemini-2.5-flash',
        setModel: vi.fn(),
        language: 'pt-BR',
        setLanguage: vi.fn(),
        style: 'concise',
        setStyle: vi.fn(),
        history: [],
        glossary: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useApp as unknown as Mock).mockReturnValue(baseContext);
        (useAuth as unknown as Mock).mockReturnValue({
            isGithubUser: true,
            githubAccessToken: 'gh-oauth-token',
            loginWithGithub: vi.fn().mockResolvedValue(undefined),
        });
        (discoverProviderModels as unknown as Mock).mockResolvedValue(['gemini-2.5-flash', 'gemini-2.5-pro']);
    });

    it('renders provider options including GitHub Models for GitHub users', () => {
        render(<Settings onClose={() => { }} />);

        expect(screen.getByText('Google Gemini')).toBeInTheDocument();
        expect(screen.getByText('OpenAI')).toBeInTheDocument();
        expect(screen.getByText('GitHub Models')).toBeInTheDocument();
    });

    it('hides GitHub Models provider for non-GitHub users', () => {
        (useAuth as unknown as Mock).mockReturnValue({
            isGithubUser: false,
            githubAccessToken: null,
            loginWithGithub: vi.fn(),
        });

        render(<Settings onClose={() => { }} />);

        expect(screen.queryByText('GitHub Models')).not.toBeInTheDocument();
        expect(
            screen.getByText('Faça login com GitHub para habilitar o provedor GitHub Models.')
        ).toBeInTheDocument();
    });

    it('saves api key for non-GitHub providers', async () => {
        const setApiKeyMock = vi.fn();
        const onCloseMock = vi.fn();
        (useApp as unknown as Mock).mockReturnValue({
            ...baseContext,
            setApiKey: setApiKeyMock,
        });

        const user = userEvent.setup();
        render(<Settings onClose={onCloseMock} />);

        const input = screen.getByPlaceholderText('Insira sua chave de API');
        await user.clear(input);
        await user.type(input, 'new-key');
        await user.click(screen.getByText('Salvar e Continuar'));

        expect(setApiKeyMock).toHaveBeenCalledWith('new-key');
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('loads discovered models for Gemini using typed api key', async () => {
        render(<Settings onClose={() => { }} />);

        await waitFor(() => {
            expect(discoverProviderModels).toHaveBeenCalledWith('gemini', 'key123');
        });
    });

    it('uses oauth token and renders catalog when provider is github-models', async () => {
        (useApp as unknown as Mock).mockReturnValue({
            ...baseContext,
            provider: 'github-models',
            model: 'openai/gpt-4o',
        });
        (discoverProviderModels as unknown as Mock).mockResolvedValue([
            'openai/gpt-4o',
            'openai/gpt-4.1-mini',
        ]);

        render(<Settings onClose={() => { }} />);

        await waitFor(() => {
            expect(discoverProviderModels).toHaveBeenCalledWith('github-models', 'gh-oauth-token');
        });
        expect(screen.queryByPlaceholderText('Insira sua chave de API')).not.toBeInTheDocument();
        expect(screen.getByText('Modelos disponíveis na sua conta')).toBeInTheDocument();
        expect(screen.getAllByText('openai/gpt-4.1-mini').length).toBeGreaterThan(0);
    });

    it('allows refreshing github oauth session from settings', async () => {
        const loginWithGithubMock = vi.fn().mockResolvedValue(undefined);
        (useApp as unknown as Mock).mockReturnValue({
            ...baseContext,
            provider: 'github-models',
            model: 'openai/gpt-4o',
        });
        (useAuth as unknown as Mock).mockReturnValue({
            isGithubUser: true,
            githubAccessToken: null,
            loginWithGithub: loginWithGithubMock,
        });

        const user = userEvent.setup();
        render(<Settings onClose={() => { }} />);

        await user.click(screen.getByText('Atualizar sessão GitHub'));
        expect(loginWithGithubMock).toHaveBeenCalled();
    });
});
