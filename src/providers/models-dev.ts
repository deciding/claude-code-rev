/**
 * models.dev integration - discover available models
 * 
 * Fetches and caches model definitions from https://models.dev
 */

import type { ProviderInfo, ModelInfo } from './types.js'
import { createProviderInfo, createModelInfo, ProviderRegistry } from './registry.js'
import { getClaudeConfigHomeDir } from '../utils/envUtils.js'
import { existsSync, mkdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const CACHE_FILE_NAME = 'models-dev-cache.json'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const MODELS_DEV_URL = 'https://models.dev/api.json'

// Bundled models from opencode reference (used as fallback)
const BUNDLED_MODELS: ModelsDevResponse = {
  "opencode": {
    "id": "opencode",
    "name": "OpenCode Zen",
    "api": "https://opencode.ai/zen/v1",
    "npm": "@ai-sdk/openai-compatible",
    "env": ["OPENCODE_API_KEY"],
    "models": [
      {"id": "big-pickle", "name": "Big Pickle", "family": "big-pickle", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0, "output": 0, "cache_read": 0, "cache_write": 0}, "limit": {"context": 200000, "output": 128000}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "claude-3-5-haiku", "name": "Claude 3.5 Haiku", "family": "claude-haiku", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 0.25, "output": 1.25, "cache_read": 0.03}, "limit": {"context": 200000, "output": 8192}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "claude-opus-4-5", "name": "Claude Opus 4.5", "family": "claude-opus", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 5, "output": 25, "cache_read": 0.5}, "limit": {"context": 200000, "output": 64000}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "claude-sonnet-4-5", "name": "Claude Sonnet 4.5", "family": "claude-sonnet", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 3, "output": 15, "cache_read": 0.375}, "limit": {"context": 200000, "output": 64000}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "gemini-3-flash", "name": "Gemini 3 Flash", "family": "gemini-flash", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "video", "pdf"], "output": ["text"]}, "cost": {"input": 0.075, "output": 0.3}, "limit": {"context": 200000, "output": 65536}, "provider": {"npm": "@ai-sdk/google"}},
      {"id": "gemini-3-pro", "name": "Gemini 3 Pro", "family": "gemini-pro", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "video", "pdf"], "output": ["text"]}, "cost": {"input": 1.25, "output": 5}, "limit": {"context": 200000, "output": 65536}, "provider": {"npm": "@ai-sdk/google"}},
      {"id": "glm-4.6", "name": "GLM-4.6", "family": "glm", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0.1, "output": 0.1}, "limit": {"context": 128000, "output": 8192}},
      {"id": "glm-5", "name": "GLM-5", "family": "glm", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 1, "output": 3.2}, "limit": {"context": 204800, "output": 131072}},
      {"id": "glm-5-free", "name": "GLM-5 Free", "family": "glm-free", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0, "output": 0}, "limit": {"context": 128000, "output": 8192}},
      {"id": "gpt-5", "name": "GPT-5", "family": "gpt", "attachment": true, "reasoning": true, "tool_call": true, "temperature": false, "modalities": {"input": ["text", "image"], "output": ["text"]}, "cost": {"input": 1.07, "output": 8.5}, "limit": {"context": 400000, "output": 128000}, "provider": {"npm": "@ai-sdk/openai"}},
      {"id": "gpt-5-codex", "name": "GPT-5 Codex", "family": "gpt-codex", "attachment": true, "reasoning": true, "tool_call": true, "temperature": false, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 1.75, "output": 14}, "limit": {"context": 400000, "output": 128000}, "provider": {"npm": "@ai-sdk/openai"}},
      {"id": "gpt-5.1-codex", "name": "GPT-5.1 Codex", "family": "gpt-codex", "attachment": true, "reasoning": true, "tool_call": true, "temperature": false, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 2.5, "output": 20}, "limit": {"context": 400000, "output": 128000}, "provider": {"npm": "@ai-sdk/openai"}},
      {"id": "gpt-5.1-codex-mini", "name": "GPT-5.1 Codex Mini", "family": "gpt-codex", "attachment": true, "reasoning": true, "tool_call": true, "temperature": false, "modalities": {"input": ["text", "image"], "output": ["text"]}, "cost": {"input": 0.25, "output": 2}, "limit": {"context": 400000, "output": 128000}, "provider": {"npm": "@ai-sdk/openai"}},
      {"id": "gpt-5.2-codex", "name": "GPT-5.2 Codex", "family": "gpt-codex", "attachment": true, "reasoning": true, "tool_call": true, "temperature": false, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 1.75, "output": 14}, "limit": {"context": 400000, "output": 128000}, "provider": {"npm": "@ai-sdk/openai"}},
      {"id": "gpt-5.3-codex", "name": "GPT-5.3 Codex", "family": "gpt-codex", "attachment": true, "reasoning": true, "tool_call": true, "temperature": false, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 1.75, "output": 14}, "limit": {"context": 400000, "output": 128000}, "provider": {"npm": "@ai-sdk/openai"}},
      {"id": "gpt-5.4-mini", "name": "GPT-5.4 Mini", "family": "gpt-mini", "attachment": true, "reasoning": true, "tool_call": true, "temperature": false, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 0.75, "output": 4.5}, "limit": {"context": 400000, "output": 128000}, "provider": {"npm": "@ai-sdk/openai"}},
      {"id": "gpt-5.4-pro", "name": "GPT-5.4 Pro", "family": "gpt-pro", "attachment": true, "reasoning": true, "tool_call": true, "temperature": false, "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}, "cost": {"input": 30, "output": 180}, "limit": {"context": 1050000, "output": 128000}, "provider": {"npm": "@ai-sdk/openai"}},
      {"id": "grok-code", "name": "Grok Code", "family": "grok", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image"], "output": ["text"]}, "cost": {"input": 0.5, "output": 3}, "limit": {"context": 131072, "output": 65536}, "provider": {"npm": "@ai-sdk/xai"}},
      {"id": "kimi-k2", "name": "Kimi K2", "family": "kimi", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "video"], "output": ["text"]}, "cost": {"input": 0.6, "output": 3}, "limit": {"context": 262144, "output": 65536}},
      {"id": "kimi-k2.5", "name": "Kimi K2.5", "family": "kimi", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "video"], "output": ["text"]}, "cost": {"input": 0.6, "output": 3}, "limit": {"context": 262144, "output": 65536}},
      {"id": "kimi-k2-thinking", "name": "Kimi K2 Thinking", "family": "kimi-thinking", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "interleaved": {"field": "reasoning_content"}, "cost": {"input": 0.4, "output": 2.5}, "limit": {"context": 262144, "output": 262144}},
      {"id": "kimi-k2.5-free", "name": "Kimi K2.5 Free", "family": "kimi-free", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0, "output": 0}, "limit": {"context": 262144, "output": 65536}},
      {"id": "minimax-m2.1", "name": "MiniMax M2.1", "family": "minimax", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0.2, "output": 1}, "limit": {"context": 204800, "output": 8192}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "minimax-m2.1-free", "name": "MiniMax M2.1 Free", "family": "minimax-free", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0, "output": 0}, "limit": {"context": 204800, "output": 131072}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "minimax-m2.5", "name": "MiniMax M2.5", "family": "minimax", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0.3, "output": 1.2}, "limit": {"context": 204800, "output": 131072}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "minimax-m2.5-free", "name": "MiniMax M2.5 Free", "family": "minimax-free", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0, "output": 0}, "limit": {"context": 204800, "output": 131072}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "mimo-v2-flash-free", "name": "MiMo V2 Flash Free", "family": "mimo-flash-free", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0, "output": 0}, "limit": {"context": 262144, "output": 65536}},
      {"id": "mimo-v2-omni-free", "name": "MiMo V2 Omni Free", "family": "mimo-omni-free", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "audio"], "output": ["text"]}, "cost": {"input": 0, "output": 0}, "limit": {"context": 262144, "output": 64000}},
      {"id": "qwen3-coder", "name": "Qwen3 Coder", "family": "qwen", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0.5, "output": 2}, "limit": {"context": 131072, "output": 8192}}
    ]
  },
  "opencode-go": {
    "id": "opencode-go",
    "name": "OpenCode Go",
    "api": "https://opencode.ai/zen/go/v1",
    "npm": "@ai-sdk/openai-compatible",
    "env": ["OPENCODEROGO_API_KEY"],
    "models": [
      {"id": "kimi-k2.5", "name": "Kimi K2.5", "family": "kimi", "attachment": true, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text", "image", "video"], "output": ["text"]}, "cost": {"input": 0.6, "output": 3}, "limit": {"context": 262144, "output": 65536}},
      {"id": "minimax-m2.7", "name": "MiniMax M2.7", "family": "minimax", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0.3, "output": 1.2}, "limit": {"context": 204800, "output": 131072}, "provider": {"npm": "@ai-sdk/anthropic"}},
      {"id": "glm-5", "name": "GLM-5", "family": "glm", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 1, "output": 3.2}, "limit": {"context": 204800, "output": 131072}},
      {"id": "minimax-m2.5", "name": "MiniMax M2.5", "family": "minimax", "attachment": false, "reasoning": true, "tool_call": true, "temperature": true, "modalities": {"input": ["text"], "output": ["text"]}, "cost": {"input": 0.3, "output": 1.2}, "limit": {"context": 204800, "output": 131072}, "provider": {"npm": "@ai-sdk/anthropic"}}
    ]
  }
}

interface ModelsDevModel {
  id: string
  name: string
  family?: string
  status?: 'alpha' | 'beta' | 'deprecated' | 'active'
  temperature?: boolean
  reasoning?: boolean
  attachment?: boolean
  tool_call?: boolean
  modalities?: {
    input?: string[]
    output?: string[]
  }
  interleaved?: boolean | { field: string }
  cost?: {
    input: number
    output: number
    cache_read?: number
    cache_write?: number
    context_over_200k?: {
      input: number
      output: number
      cache_read?: number
      cache_write?: number
    }
  }
  limit?: {
    context: number
    input?: number
    output: number
  }
  provider?: {
    api?: string
    npm?: string
  }
  headers?: Record<string, string>
  options?: Record<string, any>
  release_date?: string
}

interface ModelsDevProvider {
  id: string
  name: string
  api?: string
  npm?: string
  env?: string[]
  models: ModelsDevModel[]
}

interface ModelsDevResponse {
  [providerId: string]: ModelsDevProvider
}

interface CacheEntry {
  data: ModelsDevResponse
  timestamp: number
}

function getCacheFilePath(): string {
  return join(getClaudeConfigHomeDir(), 'cache', CACHE_FILE_NAME)
}

async function ensureCacheDir(): Promise<void> {
  const cachePath = getCacheFilePath()
  const cacheDir = join(cachePath, '..')
  
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true })
  }
}

async function readCache(): Promise<CacheEntry | null> {
  const cachePath = getCacheFilePath()
  
  if (!existsSync(cachePath)) {
    return null
  }
  
  try {
    const content = await readFile(cachePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

async function writeCache(data: ModelsDevResponse): Promise<void> {
  await ensureCacheDir()
  const cachePath = getCacheFilePath()
  const cacheEntry: CacheEntry = {
    data,
    timestamp: Date.now()
  }
  await writeFile(cachePath, JSON.stringify(cacheEntry, null, 2), 'utf-8')
}

function transformModel(model: ModelsDevModel, providerId: string): ModelInfo {
  return createModelInfo(model.id, providerId, {
    name: model.name,
    family: model.family,
    status: model.status || 'active',
    capabilities: {
      temperature: model.temperature ?? true,
      reasoning: model.reasoning ?? false,
      attachment: model.attachment ?? false,
      toolcall: model.tool_call ?? true,
      input: {
        text: model.modalities?.input?.includes('text') ?? true,
        audio: model.modalities?.input?.includes('audio') ?? false,
        image: model.modalities?.input?.includes('image') ?? false,
        video: model.modalities?.input?.includes('video') ?? false,
        pdf: model.modalities?.input?.includes('pdf') ?? false
      },
      output: {
        text: model.modalities?.output?.includes('text') ?? true,
        audio: model.modalities?.output?.includes('audio') ?? false,
        image: model.modalities?.output?.includes('image') ?? false,
        video: model.modalities?.output?.includes('video') ?? false,
        pdf: model.modalities?.output?.includes('pdf') ?? false
      },
      interleaved: model.interleaved ?? false
    },
    cost: {
      input: model.cost?.input ?? 0,
      output: model.cost?.output ?? 0,
      cache: model.cost?.cache_read !== undefined && model.cost?.cache_write !== undefined
        ? {
            read: model.cost.cache_read,
            write: model.cost.cache_write
          }
        : undefined
    },
    limit: {
      context: model.limit?.context ?? 0,
      input: model.limit?.input,
      output: model.limit?.output ?? 0
    },
    headers: model.headers,
    options: model.options,
    release_date: model.release_date
  })
}

function transformProvider(provider: ModelsDevProvider): ProviderInfo {
  const models: Record<string, ModelInfo> = {}
  
  for (const model of provider.models) {
    models[model.id] = transformModel(model, provider.id)
  }
  
  return createProviderInfo(provider.id, {
    name: provider.name,
    api: provider.api,
    npm: provider.npm,
    env: provider.env || [],
    models,
    source: 'api'
  })
}

let cachedProviders: Record<string, ProviderInfo> | null = null

export namespace ModelsDev {
  export async function get(): Promise<Record<string, ProviderInfo>> {
    if (cachedProviders) {
      return cachedProviders
    }
    
    const cache = await readCache()
    
    if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
      cachedProviders = {}
      for (const [id, provider] of Object.entries(cache.data)) {
        cachedProviders[id] = transformProvider(provider)
      }
      return cachedProviders
    }
    
    try {
      const response = await fetch(MODELS_DEV_URL)
      if (!response.ok) {
        throw new Error(`Failed to fetch models.dev: ${response.status}`)
      }
      
      const data: ModelsDevResponse = await response.json()
      await writeCache(data)
      
      cachedProviders = {}
      for (const [id, provider] of Object.entries(data)) {
        cachedProviders[id] = transformProvider(provider)
      }
      
      return cachedProviders
    } catch (error) {
      console.warn('Failed to fetch models.dev, using fallback:', error)
      
      // Use fallback with cached data if available
      const cache = await readCache()
      if (cache && cache.data && Object.keys(cache.data).length > 0) {
        cachedProviders = {}
        for (const [id, provider] of Object.entries(cache.data)) {
          cachedProviders[id] = transformProvider(provider)
        }
        return cachedProviders
      }
      
      // Return bundled providers as fallback
      cachedProviders = {}
      for (const [id, provider] of Object.entries(BUNDLED_MODELS)) {
        cachedProviders[id] = transformProvider(provider)
      }
      return cachedProviders
    }
  }
  
  export async function refresh(): Promise<Record<string, ProviderInfo>> {
    cachedProviders = null
    
    try {
      const response = await fetch(MODELS_DEV_URL)
      if (!response.ok) {
        throw new Error(`Failed to fetch models.dev: ${response.status}`)
      }
      
      const data: ModelsDevResponse = await response.json()
      await writeCache(data)
      
      cachedProviders = {}
      for (const [id, provider] of Object.entries(data)) {
        cachedProviders[id] = transformProvider(provider)
      }
      
      return cachedProviders
    } catch (error) {
      console.error('Failed to refresh models.dev data:', error)
      throw error
    }
  }
  
  export async function getProvider(providerId: string): Promise<ProviderInfo | null> {
    const providers = await get()
    return providers[providerId] || null
  }
  
  export async function getModel(
    providerId: string,
    modelId: string
  ): Promise<ModelInfo | null> {
    const provider = await getProvider(providerId)
    return provider?.models[modelId] || null
  }
  
  export function clearCache(): void {
    cachedProviders = null
  }
}