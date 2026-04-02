/**
 * Model routing utilities
 * 
 * Determines whether a model should use the legacy Anthropic system
 * or the new AI SDK provider system.
 */

import { shouldUseAISDK } from './providers.js'
import { ProviderRegistry } from '../../providers/registry.js'
import { Auth } from '../../providers/auth.js'
import { OPENAI_PROVIDER } from '../../providers/ai-sdk/openai.js'
import { GOOGLE_PROVIDER } from '../../providers/ai-sdk/google.js'
import { ANTHROPIC_PROVIDER } from '../../providers/ai-sdk/anthropic.js'
import { MISTRAL_PROVIDER } from '../../providers/ai-sdk/mistral.js'
import { GROQ_PROVIDER } from '../../providers/ai-sdk/groq.js'
import { DEEPSEEK_PROVIDER } from '../../providers/ai-sdk/deepseek.js'
import { XAI_PROVIDER } from '../../providers/ai-sdk/xai.js'

// Register bundled providers at module load so they're available everywhere
ProviderRegistry.register(OPENAI_PROVIDER as any)
ProviderRegistry.register(GOOGLE_PROVIDER as any)
ProviderRegistry.register(ANTHROPIC_PROVIDER as any)
ProviderRegistry.register(MISTRAL_PROVIDER as any)
ProviderRegistry.register(GROQ_PROVIDER as any)
ProviderRegistry.register(DEEPSEEK_PROVIDER as any)
ProviderRegistry.register(XAI_PROVIDER as any)

/**
 * Check if a model should use the AI SDK provider system
 * 
 * @param model - Model name (e.g., "claude-3-5-sonnet" or "openai/gpt-4")
 * @returns true if should use AI SDK, false for legacy system
 */
export async function shouldUseAISDKForModel(model: string | null): Promise<boolean> {
  // If explicitly set to use AI SDK
  if (shouldUseAISDK()) {
    return true
  }

  // If no model specified, use legacy
  if (!model) {
    return false
  }

  // Check for explicit provider prefix (e.g., "openai/gpt-4")
  if (model.includes('/')) {
    const [provider] = model.split('/')
    const providerInfo = ProviderRegistry.get(provider)
    if (providerInfo) {
      return true
    }
  }

  // Check if model is from a known AI SDK provider
  const provider = detectProviderFromModel(model)
  if (provider && provider !== 'anthropic') {
    return true
  }

  // Default to legacy Anthropic system
  return false
}

/**
 * Detect provider from model name
 * 
 * @param model - Model name
 * @returns Provider ID or null if unknown
 */
export function detectProviderFromModel(model: string): string | null {
  // OpenAI models
  if (model.startsWith('gpt-') || model.startsWith('o1-') || model.startsWith('o3') || model.startsWith('o4')) {
    return 'openai'
  }

  // Google/Gemini models
  if (model.startsWith('gemini-')) {
    return 'google'
  }

  // Anthropic models (Claude)
  if (model.startsWith('claude-')) {
    return 'anthropic'
  }

  // Mistral models
  if (model.startsWith('mistral-') || model.startsWith('pixtral-')) {
    return 'mistral'
  }

  // Groq models (Llama, Mixtral)
  if (model.startsWith('llama') || model.startsWith('mixtral-')) {
    return 'groq'
  }

  // DeepSeek models
  if (model.startsWith('deepseek-')) {
    return 'deepseek'
  }

  // xAI Grok models
  if (model.startsWith('grok-')) {
    return 'xai'
  }

  // Unknown - will use legacy system
  return null
}

/**
 * Parse model string into provider and model components
 * 
 * @param model - Model string (e.g., "openai/gpt-4" or "claude-3-5-sonnet")
 * @returns Tuple of [providerId, modelId]
 */
export function parseModelString(model: string): [string, string] {
  if (model.includes('/')) {
    const [provider, modelId] = model.split('/')
    return [provider, modelId]
  }

  // Detect provider from model name
  const provider = detectProviderFromModel(model)
  if (provider) {
    return [provider, model]
  }

  // Default to anthropic for legacy system
  return ['anthropic', model]
}

/**
 * Get the appropriate API key for a provider
 * 
 * @param providerId - Provider ID
 * @returns API key or undefined
 */
export async function getAPIKeyForProvider(providerId: string): Promise<string | undefined> {
  // Check stored credentials first
  const credential = await Auth.get(providerId)
  if (credential?.key) {
    return credential.key
  }

  // Fall back to environment variables
  const provider = ProviderRegistry.get(providerId)
  if (provider) {
    for (const envVar of provider.env) {
      const value = process.env[envVar]
      if (value) return value
    }
  }

  return undefined
}

/**
 * Check if a provider is available (has credentials)
 * 
 * @param providerId - Provider ID
 * @returns true if provider is available
 */
export async function isProviderAvailable(providerId: string): Promise<boolean> {
  const key = await getAPIKeyForProvider(providerId)
  return key !== undefined
}

/**
 * Get the full model name for display
 * 
 * @param providerId - Provider ID
 * @param modelId - Model ID
 * @returns Display name
 */
export function getModelDisplayName(providerId: string, modelId: string): string {
  const provider = ProviderRegistry.get(providerId)
  const model = provider?.models[modelId]
  
  if (model) {
    return model.name
  }
  
  // Fallback to combined name
  return `${providerId}/${modelId}`
}