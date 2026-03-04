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

interface GithubCatalogResponseItem {
    id?: string;
    name?: string;
    model?: string;
    slug?: string;
    publisher?: string;
    rate_limit_tier?: string;
    supported_input_modalities?: string[];
    supported_output_modalities?: string[];
    capabilities?: {
        input_modalities?: string[];
        output_modalities?: string[];
    };
}

interface GithubInferenceResponseItem {
    id?: string;
    model?: string;
    name?: string;
    owned_by?: string;
    publisher?: string;
    rate_limit_tier?: string;
    supported_input_modalities?: string[];
    supported_output_modalities?: string[];
}

interface GithubInferenceResponse {
    data?: GithubInferenceResponseItem[];
    models?: GithubInferenceResponseItem[];
    items?: GithubInferenceResponseItem[];
}

interface GithubCatalogEnvelope {
    data?: GithubCatalogResponseItem[];
    models?: GithubCatalogResponseItem[];
    items?: GithubCatalogResponseItem[];
}

export interface GithubCatalogModel {
    id: string;
    name: string;
    publisher: string;
    rateLimitTier: string;
    supportedInputModalities: string[];
    supportedOutputModalities: string[];
    isVisionCapable: boolean;
    paidMultiplier: string;
    freeMultiplier: string;
}

interface CopilotMultiplier {
    free: string;
    paid: string;
}

const COPILOT_MODEL_MULTIPLIERS: Array<{ pattern: RegExp; multiplier: CopilotMultiplier }> = [
    { pattern: /claude[-\s]?haiku[-\s]?4\.5/i, multiplier: { free: '1x', paid: '0.33x' } },
    { pattern: /claude[-\s]?opus[-\s]?4\.1/i, multiplier: { free: '-', paid: '10x' } },
    { pattern: /claude[-\s]?opus[-\s]?4\.5/i, multiplier: { free: '-', paid: '3x' } },
    { pattern: /claude[-\s]?opus[-\s]?4\.6/i, multiplier: { free: '-', paid: '3x' } },
    { pattern: /claude[-\s]?sonnet[-\s]?4\.5/i, multiplier: { free: '1x', paid: '1x' } },
    { pattern: /claude[-\s]?sonnet[-\s]?4\.6/i, multiplier: { free: '1x', paid: '1x' } },
    { pattern: /gemini[-\s]?2\.5[-\s]?pro/i, multiplier: { free: '1x', paid: '1x' } },
    { pattern: /gemini[-\s]?3[-\s]?flash/i, multiplier: { free: '1x', paid: '0.33x' } },
    { pattern: /gemini[-\s]?3[-\s]?pro/i, multiplier: { free: '1x', paid: '1x' } },
    { pattern: /gpt[-\s]?4\.1/i, multiplier: { free: '1x', paid: '0x' } },
    { pattern: /gpt[-\s]?4o/i, multiplier: { free: '1x', paid: '0x' } },
    { pattern: /gpt[-\s]?5\.1[-\s]?codex[-\s]?mini/i, multiplier: { free: '-', paid: '0.33x' } },
    { pattern: /gpt[-\s]?5\.1[-\s]?codex[-\s]?max/i, multiplier: { free: '-', paid: '1x' } },
    { pattern: /gpt[-\s]?5\.1[-\s]?codex/i, multiplier: { free: '-', paid: '1x' } },
    { pattern: /gpt[-\s]?5\.2[-\s]?codex/i, multiplier: { free: '-', paid: '1x' } },
    { pattern: /gpt[-\s]?5\.3[-\s]?codex/i, multiplier: { free: '-', paid: '1x' } },
    { pattern: /gpt[-\s]?5[-\s]?mini/i, multiplier: { free: '1x', paid: '0x' } },
    { pattern: /gpt[-\s]?5(?!\.)/i, multiplier: { free: '1x', paid: '1x' } },
    { pattern: /grok[-\s]?code[-\s]?fast[-\s]?1/i, multiplier: { free: '-', paid: '0.25x' } },
    { pattern: /raptor[-\s]?mini/i, multiplier: { free: '1x', paid: '0x' } },
    { pattern: /goldeneye/i, multiplier: { free: '1x', paid: '-' } },
];

const GITHUB_INFERENCE_MODELS_ENDPOINT = 'https://models.github.ai/inference/models';
const GITHUB_INFERENCE_V1_MODELS_ENDPOINT = 'https://models.github.ai/inference/v1/models';
const GITHUB_CATALOG_MODELS_ENDPOINT = 'https://models.github.ai/catalog/models';

function dedupeAndSort(models: string[]): string[] {
    return Array.from(new Set(models.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

async function buildProviderError(response: Response, fallback: string): Promise<string> {
    let detail = '';

    try {
        const data = await response.clone().json() as { message?: string; error?: { message?: string } };
        detail = data.error?.message || data.message || '';
    } catch {
        try {
            detail = (await response.clone().text()).trim();
        } catch {
            detail = '';
        }
    }

    if (response.status === 401) {
        return detail || 'Credencial inválida para o provedor selecionado.';
    }

    if (response.status === 403) {
        return detail || 'Acesso negado para listar modelos deste provedor.';
    }

    if (response.status === 404) {
        return detail || 'Endpoint de modelos não encontrado para esta sessão/provedor.';
    }

    return detail || fallback;
}

function isLikelyChatModel(modelId: string): boolean {
    const id = modelId.toLowerCase();
    const blockedHints = ['audio', 'realtime', 'transcribe', 'tts', 'embedding', 'moderation'];
    if (blockedHints.some((hint) => id.includes(hint))) return false;
    return id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4');
}

function extractGithubModelId(item: GithubCatalogResponseItem): string {
    return item.id || item.model || item.slug || item.name || '';
}

function normalizeModalities(modalities: string[] | undefined): string[] {
    return dedupeAndSort((modalities || []).map((value) => value.toLowerCase()));
}

function resolveCopilotMultiplier(model: { id: string; name: string }): CopilotMultiplier {
    const key = `${model.id} ${model.name}`.toLowerCase();

    for (const entry of COPILOT_MODEL_MULTIPLIERS) {
        if (entry.pattern.test(key)) {
            return entry.multiplier;
        }
    }

    return { free: '-', paid: '-' };
}

function normalizeGithubCatalogItem(item: GithubCatalogResponseItem): GithubCatalogModel | null {
    const id = extractGithubModelId(item);
    if (!id) return null;

    const name = item.name || id;
    const supportedInputModalities = normalizeModalities(
        item.supported_input_modalities || item.capabilities?.input_modalities
    );
    const supportedOutputModalities = normalizeModalities(
        item.supported_output_modalities || item.capabilities?.output_modalities
    );
    const isVisionCapable = supportedInputModalities.includes('image');
    const multiplier = resolveCopilotMultiplier({ id, name });

    return {
        id,
        name,
        publisher: item.publisher || '-',
        rateLimitTier: item.rate_limit_tier || '-',
        supportedInputModalities,
        supportedOutputModalities,
        isVisionCapable,
        paidMultiplier: multiplier.paid,
        freeMultiplier: multiplier.free,
    };
}

function normalizeGithubInferenceItem(item: GithubInferenceResponseItem): GithubCatalogModel | null {
    const id = item.id || item.model || item.name || '';
    if (!id) return null;

    const name = item.name || id;
    const supportedInputModalities = normalizeModalities(item.supported_input_modalities);
    const supportedOutputModalities = normalizeModalities(item.supported_output_modalities);
    const isVisionCapable = supportedInputModalities.includes('image');
    const multiplier = resolveCopilotMultiplier({ id, name });

    return {
        id,
        name,
        publisher: item.publisher || item.owned_by || '-',
        rateLimitTier: item.rate_limit_tier || '-',
        supportedInputModalities,
        supportedOutputModalities,
        isVisionCapable,
        paidMultiplier: multiplier.paid,
        freeMultiplier: multiplier.free,
    };
}

function normalizeGithubInferencePayload(payload: unknown): GithubCatalogModel[] {
    const data = payload as GithubInferenceResponse | GithubInferenceResponseItem[];
    const rawItems = Array.isArray(data)
        ? data
        : data.data || data.models || data.items || [];

    const normalized = rawItems
        .map(normalizeGithubInferenceItem)
        .filter((item): item is GithubCatalogModel => Boolean(item));

    return normalized.sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeGithubCatalogPayload(payload: unknown): GithubCatalogModel[] {
    const data = payload as GithubCatalogEnvelope | GithubCatalogResponseItem[];
    const rawItems = Array.isArray(data)
        ? data
        : data.items || data.models || data.data || [];

    const normalized = rawItems
        .map(normalizeGithubCatalogItem)
        .filter((item): item is GithubCatalogModel => Boolean(item));

    return normalized.sort((a, b) => a.name.localeCompare(b.name));
}

export async function discoverOpenAIModels(apiKey: string): Promise<string[]> {
    const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(await buildProviderError(response, 'Falha ao carregar modelos da OpenAI.'));
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
        throw new Error(await buildProviderError(response, 'Falha ao carregar modelos do Google Gemini.'));
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

export async function discoverGithubModelCatalog(oauthToken: string): Promise<GithubCatalogModel[]> {
    try {
        let modelsFromInference: GithubCatalogModel[] = [];
        let inferenceError: Error | null = null;

        for (const endpoint of [GITHUB_INFERENCE_MODELS_ENDPOINT, GITHUB_INFERENCE_V1_MODELS_ENDPOINT]) {
            try {
                const inferenceResponse = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${oauthToken}`,
                        Accept: 'application/json',
                    },
                });

                if (!inferenceResponse.ok) {
                    inferenceError = new Error(
                        await buildProviderError(inferenceResponse, 'Falha ao carregar modelos do GitHub Models.')
                    );
                    continue;
                }

                const inferencePayload = await inferenceResponse.json();
                modelsFromInference = normalizeGithubInferencePayload(inferencePayload);
                if (modelsFromInference.length > 0) {
                    break;
                }
            } catch (error) {
                inferenceError = error instanceof Error
                    ? error
                    : new Error('Falha de rede ao carregar modelos do GitHub Models.');
            }
        }

        if (modelsFromInference.length === 0) {
            if (inferenceError) {
                throw inferenceError;
            }
            return getProviderFallbackModels('github-models').map((id) => {
                const multiplier = resolveCopilotMultiplier({ id, name: id });
                return {
                    id,
                    name: id,
                    publisher: '-',
                    rateLimitTier: '-',
                    supportedInputModalities: [],
                    supportedOutputModalities: [],
                    isVisionCapable: false,
                    paidMultiplier: multiplier.paid,
                    freeMultiplier: multiplier.free,
                };
            });
        }

        // The public catalog endpoint provides richer metadata, but may be blocked by browser CORS.
        // Use it as best-effort enrichment and keep inference list as the source of truth.
        try {
            const catalogResponse = await fetch(GITHUB_CATALOG_MODELS_ENDPOINT, {
                headers: {
                    Authorization: `Bearer ${oauthToken}`,
                    Accept: 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            if (!catalogResponse.ok) {
                return modelsFromInference;
            }

            const catalogPayload = await catalogResponse.json();
            const catalogModels = normalizeGithubCatalogPayload(catalogPayload);
            if (catalogModels.length === 0) {
                return modelsFromInference;
            }

            const catalogById = new Map(catalogModels.map((model) => [model.id, model]));
            return modelsFromInference.map((model) => catalogById.get(model.id) || model);
        } catch {
            return modelsFromInference;
        }
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error('Falha de rede/CORS ao listar modelos GitHub. Atualize a sessão GitHub e tente novamente.');
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Falha de rede ao acessar catálogo do GitHub Models.');
    }
}

export async function discoverGithubModels(oauthToken: string): Promise<string[]> {
    const catalog = await discoverGithubModelCatalog(oauthToken);
    return catalog.map((model) => model.id);
}

export async function discoverProviderModels(provider: AIProvider, credential: string): Promise<string[]> {
    if (!credential.trim()) {
        if (provider === 'github-models') {
            return [];
        }
        return getProviderFallbackModels(provider);
    }

    if (provider === 'openai') return discoverOpenAIModels(credential);
    if (provider === 'gemini') return discoverGeminiModels(credential);
    return discoverGithubModels(credential);
}
