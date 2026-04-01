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

const MODELS_DEV_URL = 'https://models.dev/api/models.json'
const CACHE_FILE_NAME = 'models-dev-cache.json'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

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
      if (cache) {
        cachedProviders = {}
        for (const [id, provider] of Object.entries(cache.data)) {
          cachedProviders[id] = transformProvider(provider)
        }
        return cachedProviders
      }
      
      throw error
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