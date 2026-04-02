/**
 * AI SDK Provider Manager
 * 
 * Manages provider instances using Vercel AI SDK.
 * Supports OpenAI, Google, Anthropic, and other providers via AI SDK.
 */

import type { ProviderInfo, ModelInfo, Credential } from '../types.js'
import { ProviderRegistry } from '../registry.js'
import { Auth } from '../auth.js'
import { ModelsDev } from '../models-dev.js'

type LanguageModelV1 = any // Simplified for now
type ProviderFunction = (options: { apiKey?: string; baseURL?: string }) => any

interface CachedClient {
  provider: any
  timestamp: number
}

class AISDKProviderManager {
  private clients: Map<string, CachedClient> = new Map()
  private providerModules: Map<string, ProviderFunction> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  async getProviderClient(providerId: string, modelId: string): Promise<LanguageModelV1> {
    const cacheKey = `${providerId}:${modelId}`
    
    const cached = this.clients.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.provider
    }

    const provider = ProviderRegistry.get(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    const credential = await Auth.get(providerId)
    const apiKey = credential?.key || this.getEnvApiKey(provider)
    
    if (!apiKey && provider.env.length > 0) {
      throw new Error(
        `No API key found for ${provider.name}. ` +
        `Set ${provider.env[0]} environment variable or run /connect ${providerId}`
      )
    }

    const providerModule = await this.loadProviderModule(provider)
    const client = providerModule({
      apiKey,
      ...(provider.options || {})
    })

    const model = client.languageModel(modelId)
    
    this.clients.set(cacheKey, {
      provider: model,
      timestamp: Date.now()
    })

    return model
  }

  private getEnvApiKey(provider: ProviderInfo): string | undefined {
    for (const envVar of provider.env) {
      const value = process.env[envVar]
      if (value) return value
    }
    return undefined
  }

  private async loadProviderModule(provider: ProviderInfo): Promise<ProviderFunction> {
    const npm = provider.npm || `@ai-sdk/${provider.id}`
    
    if (this.providerModules.has(npm)) {
      return this.providerModules.get(npm)!
    }

    try {
      const module = await import(npm)
      
      // Find the correct create function for each provider
      let createFn = module.default
      
      // If default is not a function, look for provider-specific create functions
      if (typeof createFn !== 'function') {
        // Try common create function names
        const possibleFns = [
          'createAnthropic',
          'createOpenAI', 
          'createGoogleGenerativeAI',
          'createMistral',
          'createGroq',
          'createDeepSeek',
          'createXai',
          'createGoogleVertex'
        ]
        
        for (const fnName of possibleFns) {
          if (module[fnName]) {
            createFn = module[fnName]
            break
          }
        }
      }
      
      // For some providers, the default export might be the function directly
      if (!createFn && typeof module === 'function') {
        createFn = module
      }
      
      if (typeof createFn !== 'function') {
        throw new Error(`Provider module ${npm} does not export a valid create function`)
      }

      this.providerModules.set(npm, createFn)
      return createFn
    } catch (error) {
      throw new Error(
        `Failed to load provider module ${npm}. ` +
        `Make sure it's installed: bun add ${npm}`
      )
    }
  }

  async chat(
    providerId: string,
    modelId: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: {
      maxTokens?: number
      temperature?: number
      topP?: number
      stopSequences?: string[]
    }
  ): Promise<string> {
    const model = await this.getProviderClient(providerId, modelId)
    
    const result = await model.doStream({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt: messages.map(m => ({
        role: m.role,
        content: [{ type: 'text', text: m.content }]
      })),
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      topP: options?.topP,
      stopSequences: options?.stopSequences
    })

    let fullText = ''
    for await (const chunk of result.stream) {
      if (chunk.type === 'text-delta') {
        fullText += chunk.textDelta
      }
    }

    return fullText
  }

  async *streamChat(
    providerId: string,
    modelId: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: {
      maxTokens?: number
      temperature?: number
      topP?: number
      stopSequences?: string[]
    }
  ): AsyncGenerator<string> {
    const model = await this.getProviderClient(providerId, modelId)
    
    const result = await model.doStream({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt: messages.map(m => ({
        role: m.role,
        content: [{ type: 'text', text: m.content }]
      })),
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      topP: options?.topP,
      stopSequences: options?.stopSequences
    })

    for await (const chunk of result.stream) {
      if (chunk.type === 'text-delta') {
        yield chunk.textDelta
      }
    }
  }

  clearCache(): void {
    this.clients.clear()
  }
}

export const aiSDKProvider = new AISDKProviderManager()

export async function isProviderAvailable(providerId: string): Promise<boolean> {
  const credential = await Auth.get(providerId)
  if (credential) return true

  const provider = ProviderRegistry.get(providerId)
  if (!provider) return false
  
  return provider.env.some(envVar => !!process.env[envVar])
}

export async function getAvailableProviders(): Promise<string[]> {
  const providers = await ModelsDev.get()
  const available: string[] = []

  for (const [id, provider] of Object.entries(providers)) {
    if (await isProviderAvailable(id)) {
      available.push(id)
    }
  }

  return available
}