import { useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicNav from '../PublicNav/PublicNav';
import './DocsPage.css';

interface DocsPageContent {
    title: string;
    body: ReactNode;
}

const DOCS_PAGES: DocsPageContent[] = [
    {
        title: 'Visão Geral',
        body: (
            <>
                <p>
                    O Descripta gera ALT text e descrições acessíveis de imagens usando IA.
                    O fluxo principal é upload, processamento, revisão e exportação.
                </p>
                <ul>
                    <li>Processamento em lote de imagens.</li>
                    <li>Resultado com ALT text, descrição detalhada e metadados.</li>
                    <li>Edição manual antes do uso final.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Acesso e Autenticação',
        body: (
            <>
                <p>O acesso principal exige autenticação.</p>
                <ol>
                    <li>Abra a home e clique em ENTRAR.</li>
                    <li>Use login com Google ou GitHub.</li>
                    <li>Após login, a tela de Workspace fica disponível.</li>
                </ol>
            </>
        ),
    },
    {
        title: 'Configuração Inicial',
        body: (
            <>
                <p>Na janela de Settings você define provedor, modelo e credencial da API.</p>
                <ul>
                    <li>Provedores: Google Gemini, OpenAI e GitHub Models (quando login via GitHub).</li>
                    <li>Modelos: carregados dinamicamente quando possível.</li>
                    <li>A credencial é armazenada localmente no navegador.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Idioma, Estilo e Glossário',
        body: (
            <>
                <p>Antes de gerar resultados, ajuste idioma, estilo e glossário.</p>
                <ul>
                    <li>Idiomas: pt-BR, en-US e es-ES.</li>
                    <li>Estilos: concise, detailed, formal e informal.</li>
                    <li>Glossário: padroniza termos do seu domínio durante a geração.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Upload e Processamento',
        body: (
            <>
                <p>No Workspace, adicione imagens por clique ou arrastar e soltar.</p>
                <ol>
                    <li>Revise a fila de arquivos.</li>
                    <li>Clique em Gerar Descrições.</li>
                    <li>Acompanhe o progresso por quantidade processada.</li>
                </ol>
            </>
        ),
    },
    {
        title: 'Resultados e Edição',
        body: (
            <>
                <p>Cada resultado possui ações de revisão para publicação segura.</p>
                <ul>
                    <li>Editar ALT text.</li>
                    <li>Copiar conteúdo para clipboard.</li>
                    <li>Visualizar imagem e metadados quando disponíveis.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Histórico e Exportação',
        body: (
            <>
                <p>O app mantém histórico local das gerações da sessão.</p>
                <ul>
                    <li>Aba Histórico para consulta dos itens gerados.</li>
                    <li>Exportação atual em CSV (arquivo, alt, descrição e confiança).</li>
                </ul>
                <p className="docs-note">
                    A exportação em JSON estará disponível nas próximas versões.
                </p>
            </>
        ),
    },
    {
        title: 'Limites e Troubleshooting',
        body: (
            <>
                <ul>
                    <li>Sem chave válida de API, o processamento não inicia.</li>
                    <li>Erros de provedor podem ocorrer por limite, quota ou credencial inválida.</li>
                    <li>A geração por IA exige revisão humana antes de publicar.</li>
                </ul>
                <p>
                    Em caso de falha, revise credencial, provedor/modelo selecionado e conexão.
                </p>
            </>
        ),
    },
];

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

export default function DocsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedPage = Number(searchParams.get('page') || '1');
    const pageIndex = useMemo(() => {
        if (Number.isNaN(requestedPage)) return 0;
        return clamp(requestedPage - 1, 0, DOCS_PAGES.length - 1);
    }, [requestedPage]);

    const page = DOCS_PAGES[pageIndex];

    const goToPage = (index: number) => {
        const nextIndex = clamp(index, 0, DOCS_PAGES.length - 1);
        const nextPage = String(nextIndex + 1);
        setSearchParams(nextPage === '1' ? {} : { page: nextPage });
    };

    return (
        <div className="docs-page">
            <PublicNav active="docs" fixed />

            <main className="docs-main">
                <article className="docs-card">
                    <div className="docs-meta">
                        <span>DOCUMENTAÇÃO</span>
                        <span>Página {pageIndex + 1} de {DOCS_PAGES.length}</span>
                    </div>

                    <h1>{page.title}</h1>

                    <div className="docs-content">{page.body}</div>

                    <div className="docs-pagination">
                        <button
                            type="button"
                            onClick={() => goToPage(pageIndex - 1)}
                            disabled={pageIndex === 0}
                            aria-label="Página anterior"
                        >
                            {'<'}
                        </button>
                        <button
                            type="button"
                            onClick={() => goToPage(pageIndex + 1)}
                            disabled={pageIndex === DOCS_PAGES.length - 1}
                            aria-label="Próxima página"
                        >
                            {'>'}
                        </button>
                    </div>
                </article>
            </main>
        </div>
    );
}
