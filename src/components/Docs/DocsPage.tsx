import {
    BookOpenText,
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
    id: string;
    title: string;
    intro: string;
    icon: LucideIcon;
    paragraphs?: string[];
    items?: string[];
    note?: string;
}

const QUICK_START_STEPS = [
    'Entre com Google ou GitHub na home.',
    'Abra Configurações e escolha provedor e modelo.',
    'Defina idioma, estilo e glossário (opcional).',
    'Envie as imagens no Workspace e inicie a geração.',
    'Revise resultados, edite ALT text quando necessário e exporte CSV.',
];

const DOCS_SECTIONS: DocsSection[] = [
    {
        id: 'visao-geral',
        title: 'Visão Geral',
        icon: BookOpenText,
        intro: 'O Descripta acelera geração de ALT text e descrições acessíveis com revisão humana no fluxo final.',
        items: [
            'Geração de ALT text para acessibilidade e SEO.',
            'Descrição detalhada para leitura assistiva.',
            'Metadados de apoio: objetos, presença de pessoas, cores dominantes e confiança.',
            'Revisão manual antes da publicação.',
        ],
    },
    {
        id: 'acesso-e-autenticacao',
        title: 'Acesso e Autenticação',
        icon: ShieldCheck,
        intro: 'A autenticação é feita pela home, com sessão ativa para uso do Workspace e configurações.',
        items: [
            'Login com Google ou GitHub.',
            'Logout pela área logada encerra sessão atual.',
            'GitHub Models é liberado somente para usuário autenticado via GitHub.',
            'Token OAuth GitHub é armazenado em sessão para uso do provider.',
        ],
    },
    {
        id: 'configuracao-de-provedor-e-modelo',
        title: 'Configuração de Provedor e Modelo',
        icon: SlidersHorizontal,
        intro: 'A tela de configurações define provedor, credenciais e modelo ativo para processamento.',
        paragraphs: [
            'Provedores disponíveis: Google Gemini, OpenAI e GitHub Models.',
            'OpenAI e Gemini usam chave de API informada no cliente. GitHub Models usa OAuth da sessão GitHub.',
            'As listas de modelos são carregadas dinamicamente com fallback técnico para evitar tela vazia.',
        ],
        items: [
            '401: credencial inválida.',
            '403: conta sem permissão para o catálogo/modelo.',
            'Sem credencial: processamento bloqueado até correção.',
        ],
    },
    {
        id: 'idioma-estilo-e-glossario',
        title: 'Idioma, Estilo e Glossário',
        icon: Languages,
        intro: 'Esses controles influenciam diretamente o prompt enviado ao modelo.',
        items: [
            'Idiomas: Português (Brasil), English (US) e Español.',
            'Estilos: conciso, detalhado, formal e informal.',
            'Glossário: termos personalizados aplicados quando houver correspondência contextual.',
            'Saída esperada do modelo em JSON estruturado (alt, description, metadata).',
        ],
    },
    {
        id: 'workspace-e-processamento',
        title: 'Workspace e Processamento',
        icon: Upload,
        intro: 'O Workspace organiza fila de imagens e execução em lote com progresso visível.',
        items: [
            'Upload por clique ou arraste-e-solte.',
            'Remoção individual de arquivo e limpeza total da fila.',
            'Execução do lote com progresso processado/total.',
            'Falha de uma imagem não interrompe as demais.',
        ],
    },
    {
        id: 'resultados-e-edicao',
        title: 'Resultados e Edição',
        icon: PencilLine,
        intro: 'A revisão acontece em cards com ações rápidas para validação e ajustes.',
        items: [
            'Visualizar preview da imagem.',
            'Editar ALT text e salvar.',
            'Copiar ALT text para área de transferência.',
            'Expandir metadados e confiança da geração.',
            'Exportar resultados carregados em CSV.',
        ],
    },
    {
        id: 'historico-e-exportacao',
        title: 'Histórico e Exportação',
        icon: History,
        intro: 'O histórico registra resultados locais e permite revisão posterior sem novo processamento.',
        items: [
            'Novos resultados entram automaticamente no histórico.',
            'Cada item pode ser expandido para visualizar ALT e descrição completos.',
            'Ação Limpar Histórico remove registros locais.',
            'Exportação atual disponível em CSV.',
        ],
        note: 'A exportação em JSON estará disponível nas próximas versões.',
    },
    {
        id: 'limites-e-troubleshooting',
        title: 'Limites e Troubleshooting',
        icon: TriangleAlert,
        intro: 'A operação depende da disponibilidade dos provedores externos e da credencial correta.',
        items: [
            'Verifique login ativo, provider selecionado e credencial válida.',
            'Troque de modelo para isolar erro de catálogo/permite.',
            'Teste com uma imagem para diagnóstico rápido.',
            'Revise conectividade de rede, proxy e políticas CORS do ambiente.',
        ],
    },
];

function renderSection(section: DocsSection) {
    const SectionIcon = section.icon;

    return (
        <section id={section.id} key={section.id} className="docs-section">
            <header className="docs-section__header">
                <span className="docs-section__icon" aria-hidden="true">
                    <SectionIcon size={18} />
                </span>
                <h2>{section.title}</h2>
            </header>

            <p className="docs-section__intro">{section.intro}</p>

            {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="docs-section__paragraph">
                    {paragraph}
                </p>
            ))}

            {section.items && (
                <ul className="docs-section__list">
                    {section.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}

            {section.note && <p className="docs-section__note">{section.note}</p>}
        </section>
    );
}

export default function DocsPage() {
    return (
        <div className="docs-page">
            <PublicNav fixed brandLabel="DESCRIPTA DOCS" />

            <main className="docs-shell">
                <aside className="docs-sidebar" aria-label="Navegação da documentação">
                    <p className="docs-sidebar__kicker">Guia</p>
                    <h2 className="docs-sidebar__title">Documentação</h2>
                    <nav>
                        <ul className="docs-sidebar__list">
                            <li>
                                <a className="docs-sidebar__link" href="#inicio-rapido">Início Rápido</a>
                            </li>
                            {DOCS_SECTIONS.map((section) => (
                                <li key={section.id}>
                                    <a className="docs-sidebar__link" href={`#${section.id}`}>{section.title}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <article className="docs-article">
                    <header className="docs-hero">
                        <p className="docs-hero__kicker">Descripta Docs</p>
                        <h1>Guia de uso do Descripta</h1>
                        <p>
                            Documento completo para configurar o app, gerar descrições de imagens com IA
                            e revisar resultados com consistência.
                        </p>
                    </header>

                    <section id="inicio-rapido" className="docs-section docs-section--quickstart">
                        <header className="docs-section__header">
                            <span className="docs-section__icon" aria-hidden="true">
                                <BookOpenText size={18} />
                            </span>
                            <h2>Início Rápido</h2>
                        </header>
                        <ol className="docs-section__steps">
                            {QUICK_START_STEPS.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ol>
                    </section>

                    {DOCS_SECTIONS.map(renderSection)}
                </article>

                <aside className="docs-outline" aria-label="Resumo da página">
                    <p className="docs-outline__title">Nesta página</p>
                    <ol className="docs-outline__list">
                        <li>
                            <a href="#inicio-rapido">Início Rápido</a>
                        </li>
                        {DOCS_SECTIONS.map((section) => (
                            <li key={`outline-${section.id}`}>
                                <a href={`#${section.id}`}>{section.title}</a>
                            </li>
                        ))}
                    </ol>
                </aside>
            </main>
        </div>
    );
}
