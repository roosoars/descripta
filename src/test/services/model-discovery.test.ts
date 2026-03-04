import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    discoverGeminiModels,
    discoverGithubModelCatalog,
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

    it('discovers GitHub catalog models with multipliers and modalities', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        data: [
                            {
                                id: 'openai/gpt-4.1',
                                name: 'OpenAI GPT-4.1',
                                owned_by: 'openai',
                                supported_input_modalities: ['text', 'image'],
                                supported_output_modalities: ['text'],
                            },
                        ],
                    }),
                    { status: 200 }
                )
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify([
                        {
                            id: 'openai/gpt-4.1',
                            name: 'OpenAI GPT-4.1',
                            publisher: 'OpenAI',
                            rate_limit_tier: 'high',
                            supported_input_modalities: ['text', 'image'],
                            supported_output_modalities: ['text'],
                        },
                    ]),
                    { status: 200 }
                )
            );

        const catalog = await discoverGithubModelCatalog('github-token');
        expect(catalog[0].id).toBe('openai/gpt-4.1');
        expect(catalog[0].isVisionCapable).toBe(true);
        expect(catalog[0].paidMultiplier).toBe('0x');
        expect(catalog[0].freeMultiplier).toBe('1x');
        expect(fetchSpy).toHaveBeenNthCalledWith(
            1,
            'https://models.github.ai/inference/models',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer github-token',
                    Accept: 'application/json',
                }),
            })
        );
        expect(fetchSpy).toHaveBeenNthCalledWith(
            2,
            'https://models.github.ai/catalog/models',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer github-token',
                    Accept: 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28',
                }),
            })
        );
    });

    it('returns GitHub model id list from catalog', async () => {
        vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        data: [
                            { id: 'openai/gpt-4o' },
                            { id: 'openai/gpt-4.1-mini' },
                        ],
                    }),
                    { status: 200 }
                )
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify([
                        { id: 'openai/gpt-4o' },
                        { id: 'openai/gpt-4.1-mini' },
                    ]),
                    { status: 200 }
                )
            );

        const models = await discoverGithubModels('github-token');
        expect(models).toEqual(['openai/gpt-4.1-mini', 'openai/gpt-4o']);
    });

    it('keeps inference models when catalog endpoint fails (CORS/network)', async () => {
        vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        data: [
                            {
                                id: 'openai/gpt-4o',
                                name: 'OpenAI GPT-4o',
                                owned_by: 'openai',
                            },
                        ],
                    }),
                    { status: 200 }
                )
            )
            .mockRejectedValueOnce(new TypeError('Load failed'));

        const catalog = await discoverGithubModelCatalog('github-token');
        expect(catalog).toHaveLength(1);
        expect(catalog[0].id).toBe('openai/gpt-4o');
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
