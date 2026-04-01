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
  return modelId.startsWith('gpt-') || modelId.startsWith('o1-') || modelId.startsWith('o3-')
}