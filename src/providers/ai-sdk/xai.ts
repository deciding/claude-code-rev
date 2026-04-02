/**
 * xAI Grok Provider Module
 * 
 * Wrapper for @ai-sdk/xai provider
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const XAI_PROVIDER: Partial<ProviderInfo> = {
  id: 'xai',
  name: 'xAI Grok',
  npm: '@ai-sdk/xai',
  env: ['XAI_API_KEY'],
  source: 'config',
  models: {
    'grok-3': createModelInfo('grok-3', 'xai', {
      name: 'Grok 3',
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
    'grok-3-fast': createModelInfo('grok-3-fast', 'xai', {
      name: 'Grok 3 Fast',
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
      cost: { input: 3, output: 6 },
      limit: { context: 131072, output: 32768 }
    }),
    'grok-3-mini': createModelInfo('grok-3-mini', 'xai', {
      name: 'Grok 3 Mini',
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
    'grok-2-1212': createModelInfo('grok-2-1212', 'xai', {
      name: 'Grok 2',
      family: 'grok-2',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 2, output: 10 },
      limit: { context: 131072, output: 32768 }
    }),
    'grok-2-vision-1212': createModelInfo('grok-2-vision-1212', 'xai', {
      name: 'Grok 2 Vision',
      family: 'grok-2',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: true, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 2, output: 10 },
      limit: { context: 32768, output: 8192 }
    }),
    'grok-beta': createModelInfo('grok-beta', 'xai', {
      name: 'Grok Beta',
      family: 'grok-beta',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 5, output: 15 },
      limit: { context: 131072, output: 32768 }
    }),
    'grok-vision-beta': createModelInfo('grok-vision-beta', 'xai', {
      name: 'Grok Vision Beta',
      family: 'grok-vision',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: true, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 2, output: 10 },
      limit: { context: 16384, output: 4096 }
    })
  }
}

export function isXaiModel(modelId: string): boolean {
  return modelId.startsWith('grok-')
}
