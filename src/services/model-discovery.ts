import {
    type AIProvider,
    getProviderFallbackModels,
} from '../types';

interface OpenAIModelsResponse {
    data?: Array<{ id?: string }>;
}

interface GeminiModelsResponse {
    models?: Array<{
        name?: string;
        supportedGenerationMethods?: string[];
    }>;
}

interface GithubModelsResponse {
    data?: Array<{ id?: string }>;
}

function dedupeAndSort(models: string[]): string[] {
    return Array.from(new Set(models.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function toErrorMessage(response: Response, fallback: string): string {
    if (response.status === 401) return 'Credencial inválida para o provedor selecionado.';
    if (response.status === 403) return 'Acesso negado para listar modelos deste provedor.';
    return fallback;
}

function isLikelyChatModel(modelId: string): boolean {
    const id = modelId.toLowerCase();
    const blockedHints = ['audio', 'realtime', 'transcribe', 'tts', 'embedding', 'moderation'];
    if (blockedHints.some((hint) => id.includes(hint))) return false;
    return id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4');
}

export async function discoverOpenAIModels(apiKey: string): Promise<string[]> {
    const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(toErrorMessage(response, 'Falha ao carregar modelos da OpenAI.'));
    }

    const data = (await response.json()) as OpenAIModelsResponse;
    const models = dedupeAndSort(
        (data.data || [])
            .map((item) => item.id || '')
            .filter(isLikelyChatModel)
    );

    return models.length > 0 ? models : getProviderFallbackModels('openai');
}

export async function discoverGeminiModels(apiKey: string): Promise<string[]> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(toErrorMessage(response, 'Falha ao carregar modelos do Google Gemini.'));
    }

    const data = (await response.json()) as GeminiModelsResponse;
    const models = dedupeAndSort(
        (data.models || [])
            .filter((model) => model.name?.startsWith('models/gemini'))
            .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
            .map((model) => (model.name || '').replace('models/', ''))
    );

    return models.length > 0 ? models : getProviderFallbackModels('gemini');
}

export async function discoverGithubModels(apiKey: string): Promise<string[]> {
    const response = await fetch('https://models.github.ai/inference/models', {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(toErrorMessage(response, 'Falha ao carregar modelos do GitHub Models.'));
    }

    const data = (await response.json()) as GithubModelsResponse;
    const models = dedupeAndSort((data.data || []).map((item) => item.id || ''));
    return models.length > 0 ? models : getProviderFallbackModels('github-models');
}

export async function discoverProviderModels(provider: AIProvider, apiKey: string): Promise<string[]> {
    if (!apiKey.trim()) {
        return getProviderFallbackModels(provider);
    }

    if (provider === 'openai') return discoverOpenAIModels(apiKey);
    if (provider === 'gemini') return discoverGeminiModels(apiKey);
    return discoverGithubModels(apiKey);
}
