import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    discoverGeminiModels,
    discoverGithubModels,
    discoverOpenAIModels,
    discoverProviderModels,
} from '../../services/model-discovery';

describe('model-discovery', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('discovers and filters OpenAI models', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify({
                    data: [
                        { id: 'gpt-4o' },
                        { id: 'gpt-4o-mini' },
                        { id: 'text-embedding-3-small' },
                    ],
                }),
                { status: 200 }
            )
        );

        const models = await discoverOpenAIModels('openai-key');
        expect(models).toContain('gpt-4o');
        expect(models).not.toContain('text-embedding-3-small');
    });

    it('discovers Gemini models with generateContent support', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify({
                    models: [
                        { name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] },
                        { name: 'models/embedding-001', supportedGenerationMethods: ['embedContent'] },
                    ],
                }),
                { status: 200 }
            )
        );

        const models = await discoverGeminiModels('gemini-key');
        expect(models).toEqual(['gemini-2.5-flash']);
    });

    it('discovers GitHub models from catalog endpoint', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify([
                    { id: 'openai/gpt-4o' },
                    { id: 'openai/gpt-4.1-mini' },
                ]),
                { status: 200 }
            )
        );

        const models = await discoverGithubModels('github-token');
        expect(models).toContain('openai/gpt-4o');
    });

    it('uses fallback models when api key is empty', async () => {
        const models = await discoverProviderModels('openai', '');
        expect(models).toContain('gpt-4o');
    });

    it('returns empty list for github-models when oauth token is missing', async () => {
        const models = await discoverProviderModels('github-models', '');
        expect(models).toEqual([]);
    });
});
