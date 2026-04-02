/**
 * OpenCode Go Provider Module
 * 
 * Wrapper for @ai-sdk/openai-compatible provider
 * Low-cost subscription ($10/month)
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const OPENCODIGO_PROVIDER: Partial<ProviderInfo> = {
  id: 'opencode-go',
  name: 'OpenCode Go',
  npm: '@ai-sdk/openai-compatible',
  api: 'https://opencode.ai/zen/go/v1',
  env: ['OPENCODEROGO_API_KEY'],
  source: 'config',
  models: {
    'kimi-k2.5': createModelInfo('kimi-k2.5', 'opencode-go', {
      name: 'Kimi K2.5',
      family: 'kimi',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.5, output: 1.5 },
      limit: { context: 128000, output: 16384 }
    }),
    'minimax-m2.7': createModelInfo('minimax-m2.7', 'opencode-go', {
      name: 'MiniMax M2.7',
      family: 'minimax-m2.7',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 1, output: 4 },
      limit: { context: 200000, output: 16384 }
    }),
    'glm-5': createModelInfo('glm-5', 'opencode-go', {
      name: 'GLM-5',
      family: 'glm',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.5, output: 1.5 },
      limit: { context: 128000, output: 16384 }
    }),
    'minimax-m2.5': createModelInfo('minimax-m2.5', 'opencode-go', {
      name: 'MiniMax M2.5',
      family: 'minimax-m2.5',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.5, output: 2 },
      limit: { context: 128000, output: 16384 }
    })
  }
}

export function isOpenCodeGoModel(modelId: string): boolean {
  return modelId === 'kimi-k2.5' || modelId === 'minimax-m2.7' || modelId === 'glm-5' || modelId === 'minimax-m2.5'
}