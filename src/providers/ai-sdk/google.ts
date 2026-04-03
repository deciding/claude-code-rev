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
    }),
    'gemini-2.0-flash': createModelInfo('gemini-2.0-flash', 'google', {
      name: 'Gemini 2.0 Flash',
      family: 'gemini-2.0',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: true, image: true, video: true, pdf: true },
        output: { text: true, audio: true, image: false, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 0.1, output: 0.4 },
      limit: { context: 1000000, output: 8192 }
    }),
    'gemini-2.5-pro': createModelInfo('gemini-2.5-pro', 'google', {
      name: 'Gemini 2.5 Pro',
      family: 'gemini-2.5',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: true, image: true, video: true, pdf: true },
        output: { text: true, audio: true, image: true, video: true, pdf: true },
        interleaved: true
      },
      cost: { input: 1.25, output: 5 },
      limit: { context: 2000000, output: 8192 }
    }),
    'gemini-2.5-flash': createModelInfo('gemini-2.5-flash', 'google', {
      name: 'Gemini 2.5 Flash',
      family: 'gemini-2.5',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: true, image: true, video: true, pdf: true },
        output: { text: true, audio: true, image: false, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 0.075, output: 0.3 },
      limit: { context: 1000000, output: 8192 }
    })
  }
}

export function isGoogleModel(modelId: string): boolean {
  return modelId.startsWith('gemini-') || modelId.startsWith('gemini')
}