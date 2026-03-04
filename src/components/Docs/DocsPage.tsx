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
        subtitle: 'Guia completo do fluxo de trabalho para gerar ALT text e descrições acessíveis com IA.',
        icon: BookOpenText,
        sections: [
            {
                heading: 'Objetivo da aplicação',
                items: [
                    'Gerar ALT text para acessibilidade e SEO.',
                    'Gerar descrição detalhada para leitura assistiva.',
                    'Retornar metadados de apoio (objetos, presença de pessoas, cores dominantes e confiança).',
                    'Permitir revisão manual antes do uso final.',
                ],
            },
            {
                heading: 'Fluxo recomendado de ponta a ponta',
                items: [
                    'Entrar com Google ou GitHub.',
                    'Abrir Configurações e escolher provedor/modelo.',
                    'Definir idioma, estilo e glossário (opcional).',
                    'Enviar imagens no Workspace e iniciar geração.',
                    'Revisar/editar resultados e validar conteúdo.',
                    'Exportar CSV e armazenar no seu fluxo interno.',
                ],
            },
            {
                heading: 'Persistência local (navegador)',
                items: [
                    'Chaves de API (Gemini/OpenAI), provider e modelo selecionado.',
                    'Idioma, estilo e termos do glossário.',
                    'Histórico de resultados.',
                    'Token OAuth do GitHub Models em armazenamento de sessão.',
                ],
            },
        ],
    },
    {
        title: 'Acesso e Autenticação',
        shortLabel: 'Acesso',
        subtitle: 'Entrada pela home com autenticação social e sessão de usuário.',
        icon: ShieldCheck,
        sections: [
            {
                heading: 'Como entrar no sistema',
                items: [
                    'Na home, clique em ENTRAR para abrir o modal de acesso.',
                    'Escolha um provedor de login: Google ou GitHub.',
                    'Após autenticar, o app redireciona para o Workspace.',
                ],
            },
            {
                heading: 'Sessão e saída',
                items: [
                    'Enquanto a sessão estiver ativa, o usuário permanece autenticado.',
                    'No header da área logada, o botão de logout encerra a sessão.',
                    'Ao sair, dados de autenticação são limpos.',
                ],
            },
            {
                heading: 'GitHub Models com OAuth',
                items: [
                    'O provider GitHub Models aparece somente para conta autenticada via GitHub.',
                    'O app usa token OAuth da sessão GitHub para listar modelos e processar prompts.',
                    'Se o token expirar, use "Atualizar sessão GitHub" nas configurações.',
                ],
            },
            {
                heading: 'Privacidade operacional',
                text: 'Não existe backend próprio para processar suas chaves: as credenciais são usadas no navegador para chamar os provedores selecionados.',
            },
        ],
    },
    {
        title: 'Configuração de Provedor e Modelo',
        shortLabel: 'Provider',
        subtitle: 'Configuração detalhada de engine, autenticação e seleção de modelo.',
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
                heading: 'Como a lista de modelos é carregada',
                items: [
                    'OpenAI: descoberta dinâmica via API de modelos.',
                    'Gemini: descoberta dinâmica filtrando modelos com suporte a geração de conteúdo.',
                    'GitHub Models: catálogo dinâmico da conta autenticada via OAuth.',
                    'GitHub Models: exibe multiplicadores de uso (paid/free) por modelo quando disponíveis.',
                    'Quando não há retorno no OpenAI/Gemini, o app usa fallback mínimo não depreciado.',
                ],
            },
            {
                heading: 'Credenciais',
                items: [
                    'Gemini: exige chave informada no campo de API key.',
                    'OpenAI: exige chave informada no campo de API key.',
                    'GitHub Models: usa OAuth da sessão GitHub, sem campo manual de PAT.',
                ],
            },
            {
                heading: 'Erros comuns de configuração',
                items: [
                    '401: credencial inválida para o provedor selecionado.',
                    '403: conta sem permissão para listar ou usar modelos.',
                    'Sem chave/token: o app não inicia o processamento.',
                ],
            },
        ],
    },
    {
        title: 'Idioma, Estilo e Glossário',
        shortLabel: 'Prompt',
        subtitle: 'Controles aplicados diretamente ao prompt de geração.',
        icon: Languages,
        sections: [
            {
                heading: 'Idioma',
                items: [
                    'Português (Brasil)',
                    'English (US)',
                    'Español',
                ],
            },
            {
                heading: 'Estilo',
                items: [
                    'Conciso: direto ao ponto (ALT com limite recomendado).',
                    'Detalhado: descrição mais extensa e contextual.',
                    'Formal: tom profissional.',
                    'Informal: linguagem mais simples/casual.',
                ],
            },
            {
                heading: 'Glossário',
                items: [
                    'Você define pares termo -> definição para padronizar vocabulário.',
                    'Os termos são injetados no prompt e aplicados quando houver correspondência contextual.',
                    'O glossário fica salvo localmente e pode ser removido termo a termo.',
                ],
            },
            {
                heading: 'Regras internas do prompt',
                items: [
                    'O idioma selecionado é imposto para todos os campos textuais de saída.',
                    'O estilo selecionado é aplicado em ALT e descrição.',
                    'A resposta esperada é JSON estruturado (alt, description, metadata).',
                ],
            },
        ],
    },
    {
        title: 'Upload e Processamento',
        shortLabel: 'Upload',
        subtitle: 'Gerenciamento da fila de imagens e execução do lote.',
        icon: Upload,
        sections: [
            {
                heading: 'Entrada de imagens',
                items: [
                    'Clique na área de upload ou arraste e solte imagens.',
                    'Arquivos não-imagem são ignorados automaticamente.',
                    'A fila mostra nome dos arquivos e permite remoção individual.',
                    'Também existe ação para limpar toda a fila.',
                ],
            },
            {
                heading: 'Processamento',
                items: [
                    'Clique em Gerar Descrições para iniciar o lote.',
                    'Acompanhe progresso por contador processado/total.',
                    'Antes de iniciar, o app limpa os resultados atuais para mostrar apenas o lote novo.',
                    'Se uma imagem falhar, as demais continuam no processamento.',
                ],
            },
            {
                heading: 'Pré-requisitos por provedor',
                items: [
                    'Gemini/OpenAI: chave precisa estar salva em Configurações.',
                    'GitHub Models: sessão OAuth GitHub precisa estar válida.',
                    'Sem credencial, o app exibe toast de erro e não inicia o lote.',
                ],
            },
            {
                heading: 'Saída do processamento',
                items: [
                    'Cada item processado entra em Resultados com ALT, descrição e metadados.',
                    'Ao mesmo tempo, o item é registrado no Histórico.',
                ],
            },
        ],
    },
    {
        title: 'Resultados e Edição',
        shortLabel: 'Resultados',
        subtitle: 'Tela de revisão para garantir qualidade e consistência do conteúdo.',
        icon: PencilLine,
        sections: [
            {
                heading: 'Ações disponíveis por card',
                items: [
                    'Mostrar/ocultar preview da imagem (quando disponível).',
                    'Editar ALT text e salvar alteração.',
                    'Copiar ALT text para clipboard.',
                    'Expandir metadados do item.',
                ],
            },
            {
                heading: 'Metadados exibidos',
                items: [
                    'Confiança da geração em percentual.',
                    'Lista de objetos detectados (até 5 no card).',
                    'Campos técnicos completos permanecem no objeto do resultado para exportação.',
                ],
            },
            {
                heading: 'Ações de lista',
                items: [
                    'Limpar todos os resultados da tela atual.',
                    'Exportar CSV do conjunto carregado em Resultados.',
                ],
            },
            {
                heading: 'Recomendação operacional',
                text: 'Faça revisão humana de todos os textos antes de publicar em produção ou em canais públicos.',
            },
        ],
    },
    {
        title: 'Histórico e Exportação',
        shortLabel: 'Histórico',
        subtitle: 'Consulta de execuções anteriores e formato de exportação disponível.',
        icon: History,
        sections: [
            {
                heading: 'Como o histórico funciona',
                items: [
                    'Cada resultado novo é adicionado automaticamente ao histórico local.',
                    'A aba Histórico permite revisar itens gerados anteriormente.',
                    'A ação Limpar Histórico remove todos os itens salvos localmente.',
                ],
            },
            {
                heading: 'Exportação',
                items: [
                    'Formato atual: CSV.',
                    'Colunas exportadas: Filename, Alt Text, Description, Confidence.',
                    'O arquivo CSV é gerado no navegador e baixado localmente.',
                ],
                note: 'A exportação em JSON estará disponível nas próximas versões.',
            },
            {
                heading: 'Boas práticas de uso',
                items: [
                    'Defina padrão de revisão antes de exportar dados.',
                    'Mantenha rastreabilidade do lote (data, provider, modelo e idioma).',
                    'Regenere itens com baixa confiança quando necessário.',
                ],
            },
        ],
    },
    {
        title: 'Limites e Troubleshooting',
        shortLabel: 'Limites',
        subtitle: 'Diagnóstico rápido para falhas comuns de autenticação, modelo e processamento.',
        icon: TriangleAlert,
        sections: [
            {
                heading: 'Falhas comuns por categoria',
                items: [
                    'Autenticação: sem login ou sessão expirada (GitHub OAuth).',
                    'Credencial: chave inválida para OpenAI/Gemini.',
                    'Permissão: conta sem acesso ao catálogo/modelo selecionado.',
                    'Quota: limite de uso atingido no provedor externo.',
                    'Resposta inválida: erro de parsing do retorno do modelo.',
                ],
            },
            {
                heading: 'Checklist recomendado de diagnóstico',
                items: [
                    'Confirmar login ativo e provider correto.',
                    'Validar chave/tokens atuais em Configurações.',
                    'Trocar o modelo para uma opção conhecida do mesmo provider.',
                    'Testar com uma única imagem para isolar problema.',
                    'Verificar conexão de rede e bloqueios de CORS/proxy no ambiente.',
                    'Executar novo lote após atualizar credencial/sessão.',
                ],
            },
            {
                heading: 'Limitações atuais',
                items: [
                    'A exportação disponível atualmente é CSV.',
                    'Edição manual no card altera ALT text (descrição permanece gerada).',
                    'A execução depende da disponibilidade dos serviços externos (OpenAI, Gemini e GitHub Models).',
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
