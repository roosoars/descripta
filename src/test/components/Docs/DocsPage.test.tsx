import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocsPage from '../../../components/Docs/DocsPage';

vi.mock('../../../components/PublicNav/PublicNav', () => ({
    default: () => <div data-testid="public-nav">PUBLIC NAV</div>,
}));

describe('DocsPage', () => {
    it('renders docs hero and primary sections', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        expect(screen.queryByRole('heading', { name: 'Guia Definitivo do Descripta' })).not.toBeInTheDocument();
        expect(screen.queryByText(/Guia completo para configurar autenticação/i)).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Início Rápido' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Visão Geral' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Acesso e Autenticação' })).toBeInTheDocument();
    });

    it('renders sidebar links for section anchors and removes "Nesta página"', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        const quickStartLink = screen.getByRole('link', { name: 'Início Rápido' });
        expect(quickStartLink).toHaveAttribute('href', '#inicio-rapido');

        const overviewLink = screen.getByRole('link', { name: 'Visão Geral' });
        expect(overviewLink).toHaveAttribute('href', '#visao-geral');
        expect(screen.queryByText('Nesta página')).not.toBeInTheDocument();
    });

    it('does not render legacy page navigation controls', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        expect(screen.queryByRole('button', { name: /Página anterior/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Próxima página/i })).not.toBeInTheDocument();
        expect(screen.queryByText(/Página \d+ de \d+/i)).not.toBeInTheDocument();
    });

    it('does not mention support or feature request', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        expect(screen.queryByText(/^SUPORTE$/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/SOLICITAR FUNCIONALIDADE/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/\/contato/i)).not.toBeInTheDocument();
    });
});
