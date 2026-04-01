/**
 * Anthropic Provider Module (AI SDK)
 * 
 * Wrapper for @ai-sdk/anthropic provider
 * This is an alternative to the legacy Anthropic system.
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const ANTHROPIC_PROVIDER: Partial<ProviderInfo> = {
  id: 'anthropic',
  name: 'Anthropic',
  npm: '@ai-sdk/anthropic',
  env: ['ANTHROPIC_API_KEY'],
  source: 'config',
  options: {
    headers: {
      'anthropic-beta': 'interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14'
    }
  },
  models: {
    'claude-3-5-sonnet-20241022': createModelInfo('claude-3-5-sonnet-20241022', 'anthropic', {
      name: 'Claude 3.5 Sonnet',
      family: 'claude-3.5',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 3, output: 15 },
      limit: { context: 200000, output: 8192 }
    }),
    'claude-3-opus-20240229': createModelInfo('claude-3-opus-20240229', 'anthropic', {
      name: 'Claude 3 Opus',
      family: 'claude-3',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 15, output: 75 },
      limit: { context: 200000, output: 4096 }
    }),
    'claude-3-sonnet-20240229': createModelInfo('claude-3-sonnet-20240229', 'anthropic', {
      name: 'Claude 3 Sonnet',
      family: 'claude-3',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 3, output: 15 },
      limit: { context: 200000, output: 4096 }
    }),
    'claude-3-haiku-20240307': createModelInfo('claude-3-haiku-20240307', 'anthropic', {
      name: 'Claude 3 Haiku',
      family: 'claude-3',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.25, output: 1.25 },
      limit: { context: 200000, output: 4096 }
    })
  }
}

export function isAnthropicModel(modelId: string): boolean {
  return modelId.startsWith('claude-')
}

export const ANTHROPIC_BETA_HEADERS = {
  'anthropic-beta': 'interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14'
}