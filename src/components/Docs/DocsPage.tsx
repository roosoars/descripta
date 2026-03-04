import {
    BookOpenText,
    History,
    Languages,
    ShieldCheck,
    SlidersHorizontal,
    TriangleAlert,
    Upload,
    Volume2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
    'Faça login com sua conta do Google ou GitHub na tela inicial.',
    'Acesse as Configurações (ícone de engrenagem) e selecione o provedor de IA.',
    'Ajuste o idioma de saída, o estilo da descrição e o glossário.',
    'Faça o upload de imagens na página inicial (Workspace).',
    'Revise os resultados, use o áudio para ouvir as descrições e exporte para CSV.',
];

const DOCS_SECTIONS: DocsSection[] = [
    {
        id: 'visao-geral',
        title: 'Visão Geral',
        icon: BookOpenText,
        intro: 'O Descripta é a sua ferramenta inteligente para gerar textos alternativos (ALT Text) e descrições detalhadas de imagens, otimizadas para acessibilidade e SEO.',
        items: [
            'Geração automática usando os melhores modelos de IA do mercado.',
            'Descrições ricas identificando objetos, cores dominantes e contexto.',
            'Interface rápida, em abas e focada em produtividade.',
            'Narração de áudio nativa com vozes realistas (Gemini Live).',
        ],
    },
    {
        id: 'acesso-e-autenticacao',
        title: 'Acesso e Autenticação',
        icon: ShieldCheck,
        intro: 'Acesse facilmente a plataforma para manter suas configurações locais salvas e liberar os modelos.',
        items: [
            'Login em um clique usando Google ou GitHub.',
            'O uso dos modelos do GitHub Copilot é liberado automaticamente ao entrar com o GitHub.',
            'Sua sessão e configurações são mantidas localmente de forma segura.',
        ],
    },
    {
        id: 'configuracoes-da-api',
        title: 'Configurações de IA',
        icon: SlidersHorizontal,
        intro: 'Personalize o motor de Inteligência Artificial em uma janela organizada em abas:',
        items: [
            'Provedor & API: Escolha entre Google, OpenAI, Anthropic e GitHub Copilot. Cada provedor possui seu melhor modelo pré-selecionado (ex: GPT-4o, Gemini 2.5 Flash, Claude 3.5 Sonnet).',
            'Saída & Formato: Escolha o idioma (Português, Inglês ou Espanhol) e o estilo da escrita (Conciso, Detalhado, Formal ou Informal).',
            'Glossário: Defina termos específicos ou nomes de marcas que a IA deve respeitar.',
            'Uso & Informações: Acompanhe gráficos limpos sobre o uso de cada provedor.',
        ],
    },
    {
        id: 'workspace-e-processamento',
        title: 'Upload e Processamento',
        icon: Upload,
        intro: 'Gerencie e processe suas imagens em lote com facilidade e rapidez.',
        items: [
            'Arraste e solte ou clique para adicionar imagens.',
            'A IA é instruída a analisar as imagens rigorosamente sem inventar ou "alucinar" informações.',
            'Processamento paralelo com feedback visual.',
        ],
    },
    {
        id: 'resultados-e-audio',
        title: 'Resultados e Áudio',
        icon: Volume2,
        intro: 'Revise, edite e ouça os resultados gerados.',
        items: [
            'Edição Rápida: Altere o ALT Text ou a descrição clicando diretamente no texto gerado.',
            'Narração Inteligente: Clique no botão flutuante de áudio para ouvir as descrições na voz do modelo Gemini Live (uma voz clara, pausada e natural).',
            'Ações Práticas: Copie para a área de transferência ou exporte tudo em formato CSV.',
            'Confiança da IA: Veja as tags, cores e o grau de confiança da IA na imagem.',
        ],
    },
    {
        id: 'historico-de-geracao',
        title: 'Histórico de Gerações',
        icon: History,
        intro: 'Nunca perca um trabalho anterior.',
        items: [
            'Todos os seus resultados são salvos localmente de forma automática.',
            'Você pode revisitar os resultados, usar a narração em áudio ou copiar os textos novamente sem refazer as requisições.',
            'Limpe seu histórico apenas quando desejar.',
        ],
    },
    {
        id: 'troubleshooting',
        title: 'Problemas Comuns',
        icon: TriangleAlert,
        intro: 'Dicas para resolver problemas durante o uso:',
        items: [
            'Se a API do GitHub retornar erro de login: Atualize sua sessão no botão "Atualizar Sessão" ou verifique sua conexão.',
            'Se uma imagem não processar: Verifique o tamanho do arquivo ou o suporte do modelo escolhido.',
            'Nenhuma voz de áudio tocando: Verifique o volume do sistema ou a permissão de reprodução automática no navegador.',
        ],
    },
];

export default function DocsPage() {
    return (
        <div className="docs-page">
            <PublicNav fixed brandLabel="DESCRIPTA DOCS" />

            <main className="docs-shell">
                <aside className="docs-sidebar" aria-label="Navegação da documentação">
                    <div className="docs-sidebar__header">
                        <p className="docs-sidebar__kicker">Guia do Usuário</p>
                        <h2 className="docs-sidebar__title">Documentação</h2>
                    </div>

                    <nav className="docs-sidebar__menu">
                        <p className="docs-sidebar__menu-title">Conteúdo</p>
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
                    <header className="docs-hero" />

                    <section id="inicio-rapido" className="docs-section docs-section--quickstart">
                        <header className="docs-section__header">
                            <span className="docs-section__icon" aria-hidden="true">
                                <Languages size={18} />
                            </span>
                            <h2>Início Rápido</h2>
                        </header>

                        <p className="docs-section__intro">
                            Siga os passos abaixo para começar a usar a ferramenta em menos de 1 minuto:
                        </p>

                        <ul className="docs-section__list">
                            {QUICK_START_STEPS.map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}
                        </ul>
                    </section>

                    {DOCS_SECTIONS.map((section) => (
                        <section id={section.id} key={section.id} className="docs-section">
                            <header className="docs-section__header">
                                <span className="docs-section__icon" aria-hidden="true">
                                    <section.icon size={18} />
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
                    ))}
                </article>
            </main>
        </div>
    );
}
