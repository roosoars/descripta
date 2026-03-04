import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import ToastComponent, { type ToastType } from '../components/UI/Toast';
import { useAuth } from './AuthContext';
import {
    type Result,
    type AIProvider,
    type Language,
    type DescriptionStyle,
    getProviderFallbackModels,
} from '../types';

interface AppContextType {
    apiKey: string;
    setApiKey: (key: string) => void;
    provider: AIProvider;
    setProvider: (provider: AIProvider) => void;
    model: string;
    setModel: (model: string) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    style: DescriptionStyle;
    setStyle: (style: DescriptionStyle) => void;
    results: Result[];
    addResult: (result: Result) => void;
    updateResult: (index: number, result: Partial<Result>) => void;
    clearResults: () => void;
    showToast: (message: string, type: ToastType) => void;
    history: Result[];
    clearHistory: () => void;
    glossary: { term: string; definition: string }[];
    addGlossaryTerm: (term: string, definition: string) => void;
    removeGlossaryTerm: (index: number) => void;
    user: User | null;
    logout: () => void;
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    handleDownloadCSV: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
    const [provider, setProvider] = useState<AIProvider>(() => (localStorage.getItem('provider') as AIProvider) || 'gemini');
    const [model, setModel] = useState(() => localStorage.getItem('model') || getProviderFallbackModels('gemini')[0]);
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'pt-BR');
    const [style, setStyle] = useState<DescriptionStyle>(() => (localStorage.getItem('style') as DescriptionStyle) || 'concise');
    const [results, setResults] = useState<Result[]>([]);
    const [history, setHistory] = useState<Result[]>(() => {
        const saved = localStorage.getItem('history');
        return saved ? JSON.parse(saved) : [];
    });
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        localStorage.setItem('apiKey', apiKey);
    }, [apiKey]);

    useEffect(() => {
        localStorage.setItem('provider', provider);
    }, [provider]);

    useEffect(() => {
        localStorage.setItem('model', model);
    }, [model]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('style', style);
    }, [style]);

    useEffect(() => {
        localStorage.setItem('history', JSON.stringify(history));
    }, [history]);

    const [glossary, setGlossary] = useState<{ term: string; definition: string }[]>(() => {
        const saved = localStorage.getItem('glossary') || localStorage.getItem('descripta_glossary');
        return saved ? JSON.parse(saved) : [];
    });
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        localStorage.setItem('glossary', JSON.stringify(glossary));
        localStorage.removeItem('descripta_glossary');
    }, [glossary]);

    const addGlossaryTerm = (term: string, definition: string) => {
        setGlossary(prev => [...prev, { term, definition }]);
    };

    const removeGlossaryTerm = (index: number) => {
        setGlossary(prev => prev.filter((_, i) => i !== index));
    };

    const handleDownloadCSV = () => {
        if (results.length === 0) return;

        const headers = ['Filename', 'Alt Text', 'Description', 'Confidence'];
        const rows = results.map(r => [
            r.filename,
            `"${r.alt.replace(/"/g, '""')}"`,
            `"${r.description.replace(/"/g, '""')}"`,
            r.metadata?.confidence ? (r.metadata.confidence * 100).toFixed(0) + '%' : ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `descripta_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const addResult = (result: Result) => {
        setResults((prev) => [...prev, result]);
        setHistory((prev) => [result, ...prev]);
    };

    const updateResult = (index: number, updates: Partial<Result>) => {
        setResults((prev) => prev.map((r, i) => (i === index ? { ...r, ...updates, status: 'edited' } : r)));
    };

    const clearResults = () => {
        setResults([]);
    };

    const clearHistory = () => {
        setHistory([]);
        showToast('Histórico limpo!', 'success');
    };

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type });
    };

    const value = {
        apiKey,
        setApiKey,
        provider,
        setProvider,
        model,
        setModel,
        language,
        setLanguage,
        style,
        setStyle,
        addResult,
        results,
        updateResult,
        clearResults,
        showToast,
        history,
        clearHistory,
        glossary,
        addGlossaryTerm,
        removeGlossaryTerm,
        user,
        logout,
        showSettings,
        setShowSettings,
        handleDownloadCSV
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            {toast && (
                <ToastComponent
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </AppContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
