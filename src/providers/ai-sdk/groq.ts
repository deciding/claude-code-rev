/**
 * Groq Provider Module
 * 
 * Wrapper for @ai-sdk/groq provider (fast inference)
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const GROQ_PROVIDER: Partial<ProviderInfo> = {
  id: 'groq',
  name: 'Groq',
  npm: '@ai-sdk/groq',
  env: ['GROQ_API_KEY'],
  source: 'config',
  models: {
    'meta-llama/llama-4-scout-17b-16e-instruct': createModelInfo('meta-llama/llama-4-scout-17b-16e-instruct', 'groq', {
      name: 'Llama 4 Scout',
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
    'meta-llama/llama-4-maverick-17b-128e-instruct': createModelInfo('meta-llama/llama-4-maverick-17b-128e-instruct', 'groq', {
      name: 'Llama 4 Maverick',
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
    'deepseek-r1-distill-llama-70b': createModelInfo('deepseek-r1-distill-llama-70b', 'groq', {
      name: 'DeepSeek R1 Distill',
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
      cost: { input: 0.4, output: 0.4 },
      limit: { context: 128000, output: 16384 }
    }),
    'llama3-70b-8192': createModelInfo('llama3-70b-8192', 'groq', {
      name: 'Llama 3 70B',
      family: 'llama-3',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.7, output: 0.8 },
      limit: { context: 8192, output: 8192 }
    }),
    'llama3.1-70b-versatile': createModelInfo('llama3.1-70b-versatile', 'groq', {
      name: 'Llama 3.1 70B',
      family: 'llama-3.1',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.7, output: 0.8 },
      limit: { context: 32768, output: 8192 }
    }),
    'llama3.1-8b-instant': createModelInfo('llama3.1-8b-instant', 'groq', {
      name: 'Llama 3.1 8B Instant',
      family: 'llama-3.1',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.05, output: 0.08 },
      limit: { context: 32768, output: 8192 }
    }),
    'mixtral-8x7b-32768': createModelInfo('mixtral-8x7b-32768', 'groq', {
      name: 'Mixtral 8x7B',
      family: 'mixtral',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.24, output: 0.24 },
      limit: { context: 32768, output: 4096 }
    })
  }
}

export function isGroqModel(modelId: string): boolean {
  return modelId.startsWith('llama') || modelId.startsWith('mixtral') || modelId.startsWith('deepseek')
}
