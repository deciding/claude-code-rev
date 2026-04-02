/**
 * DeepSeek Provider Module
 * 
 * Wrapper for @ai-sdk/deepseek provider
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const DEEPSEEK_PROVIDER: Partial<ProviderInfo> = {
  id: 'deepseek',
  name: 'DeepSeek',
  npm: '@ai-sdk/deepseek',
  env: ['DEEPSEEK_API_KEY'],
  source: 'config',
  models: {
    'deepseek-chat': createModelInfo('deepseek-chat', 'deepseek', {
      name: 'DeepSeek Chat',
      family: 'deepseek-chat',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.14, output: 0.28 },
      limit: { context: 64000, output: 8192 }
    }),
    'deepseek-reasoner': createModelInfo('deepseek-reasoner', 'deepseek', {
      name: 'DeepSeek Reasoner',
      family: 'deepseek-reasoner',
      capabilities: {
        temperature: false,
        reasoning: true,
        attachment: false,
        toolcall: false,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.14, output: 0.28 },
      limit: { context: 64000, output: 8192 }
    }),
    'deepseek-coder': createModelInfo('deepseek-coder', 'deepseek', {
      name: 'DeepSeek Coder',
      family: 'deepseek-coder',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.14, output: 0.28 },
      limit: { context: 16000, output: 4096 }
    })
  }
}

export function isDeepSeekModel(modelId: string): boolean {
  return modelId.startsWith('deepseek-')
}
