/**
 * Mistral AI Provider Module
 * 
 * Wrapper for @ai-sdk/mistral provider
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const MISTRAL_PROVIDER: Partial<ProviderInfo> = {
  id: 'mistral',
  name: 'Mistral AI',
  npm: '@ai-sdk/mistral',
  env: ['MISTRAL_API_KEY'],
  source: 'config',
  models: {
    'pixtral-large-2411': createModelInfo('pixtral-large-2411', 'mistral', {
      name: 'Pixtral Large',
      family: 'pixtral',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 2, output: 6 },
      limit: { context: 128000, output: 16384 }
    }),
    'mistral-large-latest': createModelInfo('mistral-large-latest', 'mistral', {
      name: 'Mistral Large',
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
    }),
    'mistral-small-latest': createModelInfo('mistral-small-latest', 'mistral', {
      name: 'Mistral Small',
      family: 'mistral-small',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.2, output: 0.6 },
      limit: { context: 128000, output: 16384 }
    }),
    'mistral-nemo': createModelInfo('mistral-nemo', 'mistral', {
      name: 'Mistral Nemo',
      family: 'mistral-nemo',
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
      limit: { context: 128000, output: 8192 }
    })
  }
}

export function isMistralModel(modelId: string): boolean {
  return modelId.startsWith('mistral-') || modelId.startsWith('pixtral-')
}
