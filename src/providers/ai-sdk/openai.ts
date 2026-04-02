/**
 * OpenAI Provider Module
 * 
 * Wrapper for @ai-sdk/openai provider
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const OPENAI_PROVIDER: Partial<ProviderInfo> = {
  id: 'openai',
  name: 'OpenAI',
  npm: '@ai-sdk/openai',
  env: ['OPENAI_API_KEY'],
  source: 'config',
  models: {
    'gpt-4.1': createModelInfo('gpt-4.1', 'openai', {
      name: 'GPT-4.1',
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
    'gpt-4.1-mini': createModelInfo('gpt-4.1-mini', 'openai', {
      name: 'GPT-4.1 Mini',
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
      cost: { input: 0.1, output: 0.4 },
      limit: { context: 200000, output: 32000 }
    }),
    'gpt-4.1-nano': createModelInfo('gpt-4.1-nano', 'openai', {
      name: 'GPT-4.1 Nano',
      family: 'gpt-4.1',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.03, output: 0.1 },
      limit: { context: 200000, output: 32000 }
    }),
    'gpt-4o': createModelInfo('gpt-4o', 'openai', {
      name: 'GPT-4o',
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
    'gpt-4o-mini': createModelInfo('gpt-4o-mini', 'openai', {
      name: 'GPT-4o Mini',
      family: 'gpt-4o',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.15, output: 0.6 },
      limit: { context: 128000, output: 16384 }
    }),
    'gpt-4o-mini-2025-01-27': createModelInfo('gpt-4o-mini-2025-01-27', 'openai', {
      name: 'GPT-4o Mini (Jan 2025)',
      family: 'gpt-4o',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.15, output: 0.6 },
      limit: { context: 128000, output: 16384 }
    }),
    'o3': createModelInfo('o3', 'openai', {
      name: 'OpenAI o3',
      family: 'o3',
      capabilities: {
        temperature: false,
        reasoning: true,
        attachment: true,
        toolcall: false,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 10, output: 40 },
      limit: { context: 200000, output: 100000 }
    }),
    'o3-mini': createModelInfo('o3-mini', 'openai', {
      name: 'OpenAI o3 Mini',
      family: 'o3',
      capabilities: {
        temperature: false,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 1.1, output: 4.4 },
      limit: { context: 200000, output: 100000 }
    }),
    'o4-mini': createModelInfo('o4-mini', 'openai', {
      name: 'OpenAI o4 Mini',
      family: 'o4',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: true, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.4, output: 1.6 },
      limit: { context: 100000, output: 100000 }
    }),
    'gpt-4-turbo': createModelInfo('gpt-4-turbo', 'openai', {
      name: 'GPT-4 Turbo',
      family: 'gpt-4',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 10, output: 30 },
      limit: { context: 128000, output: 4096 }
    }),
    'gpt-4': createModelInfo('gpt-4', 'openai', {
      name: 'GPT-4',
      family: 'gpt-4',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 30, output: 60 },
      limit: { context: 8192, output: 4096 }
    }),
    'gpt-3.5-turbo': createModelInfo('gpt-3.5-turbo', 'openai', {
      name: 'GPT-3.5 Turbo',
      family: 'gpt-3.5',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.5, output: 1.5 },
      limit: { context: 16385, output: 4096 }
    })
  }
}

export function isOpenAIModel(modelId: string): boolean {
  return modelId.startsWith('gpt-') || modelId.startsWith('o1-') || modelId.startsWith('o3') || modelId.startsWith('o4')
}