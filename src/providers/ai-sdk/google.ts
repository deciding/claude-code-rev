/**
 * Google Generative AI Provider Module
 * 
 * Wrapper for @ai-sdk/google provider (Gemini models)
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const GOOGLE_PROVIDER: Partial<ProviderInfo> = {
  id: 'google',
  name: 'Google',
  npm: '@ai-sdk/google',
  env: ['GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY'],
  source: 'config',
  models: {
    'gemini-pro': createModelInfo('gemini-pro', 'google', {
      name: 'Gemini Pro',
      family: 'gemini',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.5, output: 1.5 },
      limit: { context: 30720, output: 2048 }
    }),
    'gemini-1.5-pro': createModelInfo('gemini-1.5-pro', 'google', {
      name: 'Gemini 1.5 Pro',
      family: 'gemini-1.5',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: true, image: true, video: true, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 1.25, output: 5 },
      limit: { context: 1000000, output: 8192 }
    }),
    'gemini-1.5-flash': createModelInfo('gemini-1.5-flash', 'google', {
      name: 'Gemini 1.5 Flash',
      family: 'gemini-1.5',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: true, image: true, video: true, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.075, output: 0.3 },
      limit: { context: 1000000, output: 8192 }
    })
  }
}

export function isGoogleModel(modelId: string): boolean {
  return modelId.startsWith('gemini-') || modelId.startsWith('gemini')
}