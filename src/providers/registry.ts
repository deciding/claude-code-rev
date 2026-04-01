/**
 * Provider registry - manages available providers
 * 
 * Keeps track of all registered providers and their models.
 */

import type { ProviderInfo, ModelInfo } from './types.js'

class ProviderRegistryClass {
  private providers: Map<string, ProviderInfo> = new Map()
  private initialized = false

  register(provider: ProviderInfo): void {
    if (this.providers.has(provider.id)) {
      const existing = this.providers.get(provider.id)!
      this.providers.set(provider.id, {
        ...existing,
        ...provider,
        models: {
          ...existing.models,
          ...provider.models
        }
      })
    } else {
      this.providers.set(provider.id, provider)
    }
  }

  unregister(providerId: string): boolean {
    return this.providers.delete(providerId)
  }

  get(providerId: string): ProviderInfo | undefined {
    return this.providers.get(providerId)
  }

  getAll(): ProviderInfo[] {
    return Array.from(this.providers.values())
  }

  getAllIds(): string[] {
    return Array.from(this.providers.keys())
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId)
  }

  getModel(providerId: string, modelId: string): ModelInfo | undefined {
    const provider = this.providers.get(providerId)
    return provider?.models[modelId]
  }

  findModel(
    predicate: (model: ModelInfo, providerId: string, modelId: string) => boolean
  ): { providerId: string; modelId: string; model: ModelInfo } | undefined {
    for (const [providerId, provider] of this.providers) {
      for (const [modelId, model] of Object.entries(provider.models)) {
        if (predicate(model, providerId, modelId)) {
          return { providerId, modelId, model }
        }
      }
    }
    return undefined
  }

  findModels(
    predicate: (model: ModelInfo, providerId: string, modelId: string) => boolean
  ): Array<{ providerId: string; modelId: string; model: ModelInfo }> {
    const results: Array<{ providerId: string; modelId: string; model: ModelInfo }> = []
    for (const [providerId, provider] of this.providers) {
      for (const [modelId, model] of Object.entries(provider.models)) {
        if (predicate(model, providerId, modelId)) {
          results.push({ providerId, modelId, model })
        }
      }
    }
    return results
  }

  clear(): void {
    this.providers.clear()
    this.initialized = false
  }

  markInitialized(): void {
    this.initialized = true
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

export const ProviderRegistry = new ProviderRegistryClass()

export function createProviderInfo(
  id: string,
  config: Partial<ProviderInfo>
): ProviderInfo {
  return {
    id,
    name: config.name || id,
    npm: config.npm,
    api: config.api,
    env: config.env || [],
    models: config.models || {},
    source: config.source || 'config',
    key: config.key,
    options: config.options
  }
}

export function createModelInfo(
  id: string,
  providerId: string,
  config: Partial<ModelInfo>
): ModelInfo {
  return {
    id,
    providerID: providerId,
    name: config.name || id,
    family: config.family,
    status: config.status || 'active',
    capabilities: config.capabilities || {
      temperature: true,
      reasoning: false,
      attachment: false,
      toolcall: true,
      input: { text: true, audio: false, image: false, video: false, pdf: false },
      output: { text: true, audio: false, image: false, video: false, pdf: false },
      interleaved: false
    },
    cost: config.cost || { input: 0, output: 0 },
    limit: config.limit || { context: 0, output: 0 },
    headers: config.headers,
    options: config.options,
    release_date: config.release_date
  }
}