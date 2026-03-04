import { useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    BookOpenText,
    ChevronLeft,
    ChevronRight,
    History,
    Languages,
    PencilLine,
    ShieldCheck,
    SlidersHorizontal,
    TriangleAlert,
    Upload,
    type LucideIcon,
} from 'lucide-react';
import PublicNav from '../PublicNav/PublicNav';
import './DocsPage.css';

interface DocsSection {
    heading: string;
    text?: string;
    items?: string[];
    note?: string;
}

interface DocsPageContent {
    title: string;
    shortLabel: string;
    subtitle: string;
    icon: LucideIcon;
    sections: DocsSection[];
}

const DOCS_PAGES: DocsPageContent[] = [
    {
        title: 'Visão Geral',
        shortLabel: 'Início',
        subtitle: 'Fluxo base do Descripta para gerar ALT text e descrições acessíveis com IA.',
        icon: BookOpenText,
        sections: [
            {
                heading: 'O que o aplicativo faz',
                items: [
                    'Processa imagens em lote para gerar ALT text e descrição detalhada.',
                    'Entrega metadados por resultado, como objetos detectados e confiança.',
                    'Permite revisão e edição manual antes da publicação.',
                ],
            },
            {
                heading: 'Fluxo recomendado',
                items: [
                    'Configurar provedor, modelo e idioma/estilo.',
                    'Enviar as imagens no Workspace.',
                    'Gerar, revisar, editar e exportar resultados.',
                ],
            },
        ],
    },
    {
        title: 'Acesso e Autenticação',
        shortLabel: 'Acesso',
        subtitle: 'Entrada pela home com login social integrado ao Firebase Authentication.',
        icon: ShieldCheck,
        sections: [
            {
                heading: 'Como entrar',
                items: [
                    'Clique em ENTRAR na home.',
                    'Escolha login com Google ou GitHub.',
                    'Após autenticar, o Workspace é carregado.',
                ],
            },
            {
                heading: 'GitHub Models e OAuth',
                text: 'Quando a conta está logada via GitHub, o provider GitHub Models pode usar autenticação OAuth da própria sessão GitHub.',
            },
        ],
    },
    {
        title: 'Configuração de Provedor e Modelo',
        shortLabel: 'Provider',
        subtitle: 'Ajustes feitos em Settings para escolher engine, credencial e modelo ativo.',
        icon: SlidersHorizontal,
        sections: [
            {
                heading: 'Provedores disponíveis',
                items: [
                    'Google Gemini',
                    'OpenAI',
                    'GitHub Models (apenas para sessão autenticada com GitHub)',
                ],
            },
            {
                heading: 'Descoberta de modelos',
                text: 'OpenAI, Gemini e GitHub Models usam descoberta dinâmica de catálogo para listar modelos suportados pela credencial atual.',
            },
            {
                heading: 'Credenciais',
                items: [
                    'Gemini e OpenAI: chave informada nas configurações.',
                    'GitHub Models: token OAuth da sessão GitHub.',
                ],
            },
        ],
    },
    {
        title: 'Idioma, Estilo e Glossário',
        shortLabel: 'Prompt',
        subtitle: 'Controles de saída textual aplicados ao prompt enviado ao modelo.',
        icon: Languages,
        sections: [
            {
                heading: 'Idioma',
                items: ['Português (Brasil)', 'English (US)', 'Español'],
            },
            {
                heading: 'Estilo',
                items: ['Conciso', 'Detalhado', 'Formal', 'Informal'],
            },
            {
                heading: 'Glossário',
                text: 'Termos adicionados no glossário são injetados no prompt e aplicados quando houver correspondência contextual.',
            },
        ],
    },
    {
        title: 'Upload e Processamento',
        shortLabel: 'Upload',
        subtitle: 'Envio de arquivos e execução de geração em lote no Workspace.',
        icon: Upload,
        sections: [
            {
                heading: 'Entrada de imagens',
                items: [
                    'Clique na área de upload ou arraste e solte imagens.',
                    'A fila exibe nome dos arquivos e permite remoção individual.',
                ],
            },
            {
                heading: 'Processamento',
                items: [
                    'Clique em Gerar Descrições para iniciar o lote.',
                    'Acompanhe progresso por contador processado/total.',
                ],
            },
        ],
    },
    {
        title: 'Resultados e Edição',
        shortLabel: 'Resultados',
        subtitle: 'Revisão dos textos gerados antes de uso final em produção.',
        icon: PencilLine,
        sections: [
            {
                heading: 'Ações no resultado',
                items: [
                    'Editar ALT text.',
                    'Copiar texto para clipboard.',
                    'Visualizar conteúdo gerado e metadados.',
                ],
            },
            {
                heading: 'Recomendação',
                text: 'Faça revisão humana em todos os textos antes de publicar em ambiente final.',
            },
        ],
    },
    {
        title: 'Histórico e Exportação',
        shortLabel: 'Histórico',
        subtitle: 'Consulta de gerações anteriores e exportação de dados.',
        icon: History,
        sections: [
            {
                heading: 'Histórico',
                text: 'A aba Histórico mantém os itens gerados localmente para consulta durante a sessão.',
            },
            {
                heading: 'Exportação',
                items: ['Formato atual: CSV com arquivo, ALT text, descrição e confiança.'],
                note: 'A exportação em JSON estará disponível nas próximas versões.',
            },
        ],
    },
    {
        title: 'Limites e Troubleshooting',
        shortLabel: 'Limites',
        subtitle: 'Cenários comuns de falha e verificação rápida.',
        icon: TriangleAlert,
        sections: [
            {
                heading: 'Falhas comuns',
                items: [
                    'Sem credencial válida, o processamento não inicia.',
                    'Erros 401/403 indicam token/chave inválido ou sem permissão.',
                    'Erros de quota/limite dependem do provedor selecionado.',
                ],
            },
            {
                heading: 'Checklist de diagnóstico',
                items: [
                    'Revisar provedor e modelo ativos.',
                    'Validar autenticação/chave atual.',
                    'Confirmar conectividade de rede antes de reenviar o lote.',
                ],
            },
        ],
    },
];

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function renderSection(section: DocsSection): ReactNode {
    return (
        <section key={section.heading} className="docs-section">
            <h2>{section.heading}</h2>
            {section.text && <p>{section.text}</p>}
            {section.items && (
                <ul>
                    {section.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
            {section.note && <p className="docs-note">{section.note}</p>}
        </section>
    );
}

export default function DocsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedPage = Number(searchParams.get('page') || '1');
    const pageIndex = useMemo(() => {
        if (Number.isNaN(requestedPage)) return 0;
        return clamp(requestedPage - 1, 0, DOCS_PAGES.length - 1);
    }, [requestedPage]);

    const totalPages = DOCS_PAGES.length;
    const page = DOCS_PAGES[pageIndex];
    const canGoPrev = pageIndex > 0;
    const canGoNext = pageIndex < totalPages - 1;
    const progress = ((pageIndex + 1) / totalPages) * 100;
    const PageIcon = page.icon;

    const goToPage = (index: number) => {
        const nextIndex = clamp(index, 0, totalPages - 1);
        const nextPage = String(nextIndex + 1);
        setSearchParams(nextPage === '1' ? {} : { page: nextPage });
    };

    return (
        <div className="docs-page">
            <PublicNav fixed brandLabel="DESCRIPTA DOCS" />

            <main className="docs-main">
                <article className="docs-card">
                    <div className="docs-progress">
                        <span className="docs-progress__label">Página {pageIndex + 1} de {totalPages}</span>
                        <div className="docs-progress__track" aria-hidden="true">
                            <span className="docs-progress__fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <header className="docs-hero">
                        <div className="docs-hero__icon" aria-hidden="true">
                            <PageIcon size={22} />
                        </div>
                        <div className="docs-hero__text">
                            <p className="docs-hero__kicker">Documentação do Usuário</p>
                            <h1>{page.title}</h1>
                            <p>{page.subtitle}</p>
                        </div>
                    </header>

                    <div className="docs-content">
                        {page.sections.map(renderSection)}
                    </div>

                    <nav className="docs-pagination" aria-label="Navegação de páginas da documentação">
                        <button
                            type="button"
                            onClick={() => goToPage(pageIndex - 1)}
                            disabled={!canGoPrev}
                            aria-label="Página anterior"
                            className="docs-pagination__nav"
                        >
                            <ChevronLeft size={18} />
                            <span>{'<'} Anterior</span>
                        </button>

                        <div className="docs-pagination__markers">
                            {DOCS_PAGES.map((docsPage, index) => {
                                const active = index === pageIndex;
                                return (
                                    <button
                                        key={docsPage.title}
                                        type="button"
                                        onClick={() => goToPage(index)}
                                        aria-label={`Ir para página ${index + 1}`}
                                        aria-current={active ? 'page' : undefined}
                                        className={`docs-pagination__marker ${active ? 'is-active' : ''}`}
                                    >
                                        <span className="docs-pagination__marker-number">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className="docs-pagination__marker-label">{docsPage.shortLabel}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => goToPage(pageIndex + 1)}
                            disabled={!canGoNext}
                            aria-label="Próxima página"
                            className="docs-pagination__nav"
                        >
                            <span>Próxima {'>'}</span>
                            <ChevronRight size={18} />
                        </button>
                    </nav>
                </article>
            </main>
        </div>
    );
}
