/**
 * OpenRouter Provider Module
 * 
 * Wrapper for @openrouter/ai-sdk-provider (300+ models)
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const OPENROUTER_PROVIDER: Partial<ProviderInfo> = {
  id: 'openrouter',
  name: 'OpenRouter',
  npm: '@openrouter/ai-sdk-provider',
  env: ['OPENROUTER_API_KEY'],
  source: 'config',
  models: {
    // Anthropic via OpenRouter
    'anthropic/claude-3.5-sonnet': createModelInfo('anthropic/claude-3.5-sonnet', 'openrouter', {
      name: 'Claude 3.5 Sonnet (via OpenRouter)',
      family: 'claude-3.5',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 3, output: 15 },
      limit: { context: 200000, output: 8192 }
    }),
    'anthropic/claude-3-opus': createModelInfo('anthropic/claude-3-opus', 'openrouter', {
      name: 'Claude 3 Opus (via OpenRouter)',
      family: 'claude-3',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 15, output: 75 },
      limit: { context: 200000, output: 8192 }
    }),
    // Meta Llama via OpenRouter
    'meta-llama/llama-4-scout-17b-16e-instruct': createModelInfo('meta-llama/llama-4-scout-17b-16e-instruct', 'openrouter', {
      name: 'Llama 4 Scout (via OpenRouter)',
      family: 'llama-4',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.15, output: 0.15 },
      limit: { context: 128000, output: 16384 }
    }),
    'meta-llama/llama-4-maverick-17b-128e-instruct': createModelInfo('meta-llama/llama-4-maverick-17b-128e-instruct', 'openrouter', {
      name: 'Llama 4 Maverick (via OpenRouter)',
      family: 'llama-4',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.35, output: 0.35 },
      limit: { context: 128000, output: 16384 }
    }),
    'meta-llama/llama-3.3-70b-instruct': createModelInfo('meta-llama/llama-3.3-70b-instruct', 'openrouter', {
      name: 'Llama 3.3 70B (via OpenRouter)',
      family: 'llama-3.3',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.4, output: 0.4 },
      limit: { context: 32768, output: 8192 }
    }),
    // DeepSeek via OpenRouter
    'deepseek/deepseek-r1': createModelInfo('deepseek/deepseek-r1', 'openrouter', {
      name: 'DeepSeek R1 (via OpenRouter)',
      family: 'deepseek-r1',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.27, output: 1.27 },
      limit: { context: 128000, output: 32768 }
    }),
    // Qwen via OpenRouter
    'qwen/qwen-2.5-72b-instruct': createModelInfo('qwen/qwen-2.5-72b-instruct', 'openrouter', {
      name: 'Qwen 2.5 72B (via OpenRouter)',
      family: 'qwen-2.5',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.9, output: 0.9 },
      limit: { context: 32768, output: 8192 }
    }),
    'qwen/qwen-2.5-coder-32b-instruct': createModelInfo('qwen/qwen-2.5-coder-32b-instruct', 'openrouter', {
      name: 'Qwen 2.5 Coder 32B (via OpenRouter)',
      family: 'qwen-2.5',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.3, output: 0.3 },
      limit: { context: 32768, output: 8192 }
    }),
    // Google Gemini via OpenRouter
    'google/gemini-2.0-flash-exp': createModelInfo('google/gemini-2.0-flash-exp', 'openrouter', {
      name: 'Gemini 2.0 Flash (via OpenRouter)',
      family: 'gemini-2.0',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: true, image: true, video: true, pdf: true },
        output: { text: true, audio: true, image: true, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 0, output: 0 },
      limit: { context: 1000000, output: 8192 }
    }),
    // OpenAI via OpenRouter
    'openai/gpt-4.1': createModelInfo('openai/gpt-4.1', 'openrouter', {
      name: 'GPT-4.1 (via OpenRouter)',
      family: 'gpt-4.1',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 2, output: 8 },
      limit: { context: 200000, output: 32000 }
    }),
    'openai/gpt-4o': createModelInfo('openai/gpt-4o', 'openrouter', {
      name: 'GPT-4o (via OpenRouter)',
      family: 'gpt-4o',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: true, image: true, video: false, pdf: true },
        output: { text: true, audio: true, image: false, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 2.5, output: 10 },
      limit: { context: 128000, output: 16384 }
    }),
    // xAI Grok via OpenRouter
    'xai/grok-3': createModelInfo('xai/grok-3', 'openrouter', {
      name: 'Grok 3 (via OpenRouter)',
      family: 'grok-3',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: true, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 5, output: 15 },
      limit: { context: 131072, output: 32768 }
    }),
    'xai/grok-3-mini': createModelInfo('xai/grok-3-mini', 'openrouter', {
      name: 'Grok 3 Mini (via OpenRouter)',
      family: 'grok-3',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: true, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.6, output: 1.8 },
      limit: { context: 131072, output: 32768 }
    }),
    // Cohere
    'cohere/command-a': createModelInfo('cohere/command-a', 'openrouter', {
      name: 'Command A (via OpenRouter)',
      family: 'command-a',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 3, output: 15 },
      limit: { context: 256000, output: 16384 }
    }),
    // Mistral
    'mistralai/mistral-large': createModelInfo('mistralai/mistral-large', 'openrouter', {
      name: 'Mistral Large (via OpenRouter)',
      family: 'mistral-large',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 2, output: 6 },
      limit: { context: 128000, output: 16384 }
    })
  }
}

export function isOpenRouterModel(modelId: string): boolean {
  return modelId.includes('/') && (
    modelId.startsWith('anthropic/') ||
    modelId.startsWith('meta-llama/') ||
    modelId.startsWith('deepseek/') ||
    modelId.startsWith('qwen/') ||
    modelId.startsWith('google/') ||
    modelId.startsWith('openai/') ||
    modelId.startsWith('xai/') ||
    modelId.startsWith('cohere/') ||
    modelId.startsWith('mistralai/')
  )
}
