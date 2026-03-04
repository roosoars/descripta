import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DocsPage from '../../../components/Docs/DocsPage';

vi.mock('../../../components/PublicNav/PublicNav', () => ({
    default: () => <div data-testid="public-nav">PUBLIC NAV</div>,
}));

describe('DocsPage', () => {
    it('renders first page and pagination state', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Visão Geral')).toBeInTheDocument();
        expect(screen.getByText('Página 1 de 8')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Página anterior/i })).toBeDisabled();
    });

    it('navigates between pages using next and previous buttons', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: /Próxima página/i }));
        expect(screen.getByText('Acesso e Autenticação')).toBeInTheDocument();
        expect(screen.getByText('Página 2 de 8')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Página anterior/i }));
        expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    it('navigates using page markers and highlights active marker', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: 'Ir para página 4' }));
        expect(screen.getByText('Idioma, Estilo e Glossário')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ir para página 4' })).toHaveAttribute('aria-current', 'page');
    });

    it('does not mention support or feature request', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        expect(screen.queryByText(/SUPORTE/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/SOLICITAR FUNCIONALIDADE/i)).not.toBeInTheDocument();
    });
});
