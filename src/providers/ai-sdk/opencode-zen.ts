/**
 * OpenCode Zen Provider Module
 * 
 * Wrapper for @ai-sdk/openai-compatible provider
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const OPENCODE_ZEN_PROVIDER: Partial<ProviderInfo> = {
  id: 'opencode',
  name: 'OpenCode Zen',
  npm: '@ai-sdk/openai-compatible',
  api: 'https://opencode.ai/zen/v1',
  env: ['OPENCODE_API_KEY'],
  source: 'config',
  models: {
    'gpt-5.2-codex': createModelInfo('gpt-5.2-codex', 'opencode', {
      name: 'GPT-5.2 Codex',
      family: 'gpt-codex',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 10, output: 40 },
      limit: { context: 200000, output: 100000 }
    }),
    'gpt-5.1-codex-mini': createModelInfo('gpt-5.1-codex-mini', 'opencode', {
      name: 'GPT-5.1 Codex Mini',
      family: 'gpt-codex',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 1, output: 4 },
      limit: { context: 200000, output: 100000 }
    }),
    'gpt-5.4-pro': createModelInfo('gpt-5.4-pro', 'opencode', {
      name: 'GPT-5.4 Pro',
      family: 'gpt-pro',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: true, image: true, video: false, pdf: true },
        output: { text: true, audio: true, image: false, video: false, pdf: false },
        interleaved: true
      },
      cost: { input: 5, output: 20 },
      limit: { context: 128000, output: 65536 }
    }),
    'gpt-5.4-mini': createModelInfo('gpt-5.4-mini', 'opencode', {
      name: 'GPT-5.4 Mini',
      family: 'gpt-mini',
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
      limit: { context: 128000, output: 65536 }
    }),
    'kimi-k2-thinking': createModelInfo('kimi-k2-thinking', 'opencode', {
      name: 'Kimi K2 Thinking',
      family: 'kimi',
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
      limit: { context: 200000, output: 8192 }
    }),
    'kimi-k2.5': createModelInfo('kimi-k2.5', 'opencode', {
      name: 'Kimi K2.5',
      family: 'kimi',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 1, output: 4 },
      limit: { context: 200000, output: 8192 }
    }),
    'big-pickle': createModelInfo('big-pickle', 'opencode', {
      name: 'Big Pickle',
      family: 'big-pickle',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 3, output: 15 },
      limit: { context: 200000, output: 8192 }
    }),
    'minimax-m2.7': createModelInfo('minimax-m2.7', 'opencode', {
      name: 'MiniMax M2.7',
      family: 'minimax-m2.7',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 1, output: 4 },
      limit: { context: 256000, output: 16384 }
    }),
    'glm-5': createModelInfo('glm-5', 'opencode', {
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
      cost: { input: 0.1, output: 0.1 },
      limit: { context: 128000, output: 8192 }
    }),
    'minimax-m2.5-free': createModelInfo('minimax-m2.5-free', 'opencode', {
      name: 'MiniMax M2.5 Free',
      family: 'minimax-free',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0, output: 0 },
      limit: { context: 204800, output: 131072 }
    })
  }
}

export function isOpenCodeZenModel(modelId: string): boolean {
  return [
    'gpt-5.2-codex',
    'gpt-5.1-codex-mini',
    'gpt-5.4-pro',
    'gpt-5.4-mini',
    'kimi-k2-thinking',
    'kimi-k2.5',
    'big-pickle',
    'minimax-m2.7',
    'glm-5',
    'minimax-m2.5-free'
  ].includes(modelId)
}
