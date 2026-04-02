/**
 * Multi-provider support - Core type definitions
 * 
 * This module defines types for the new AI-SDK-based provider system.
 * The legacy Anthropic/Bedrock/Vertex/Foundry system remains untouched.
 */

export type ProviderType = 'legacy' | 'ai-sdk'

export type CredentialType = 'api' | 'oauth' | 'subscription'

export interface ProviderInfo {
  id: string
  name: string
  npm?: string
  api?: string
  env: string[]
  models: Record<string, ModelInfo>
  source: 'env' | 'config' | 'api'
  key?: string
  options?: Record<string, any>
}

export interface ModelInfo {
  id: string
  providerID: string
  name: string
  family?: string
  status: 'alpha' | 'beta' | 'deprecated' | 'active'
  capabilities: ModelCapabilities
  cost: ModelCost
  limit: ModelLimits
  headers?: Record<string, string>
  options?: Record<string, any>
  release_date?: string
}

export interface ModelCapabilities {
  temperature: boolean
  reasoning: boolean
  attachment: boolean
  toolcall: boolean
  input: ModalityCapabilities
  output: ModalityCapabilities
  interleaved: boolean | { field: string }
}

export interface ModalityCapabilities {
  text: boolean
  audio: boolean
  image: boolean
  video: boolean
  pdf: boolean
}

export interface ModelCost {
  input: number
  output: number
  cache?: {
    read: number
    write: number
  }
  experimentalOver200K?: {
    input: number
    output: number
    cache: {
      read: number
      write: number
    }
  }
}

export interface ModelLimits {
  context: number
  input?: number
  output: number
}

export interface Credential {
  type: CredentialType
  key?: string
  access?: string
  refresh?: string
  expires?: number
  subscriptionId?: string
  plan?: 'free' | 'pro' | 'team' | 'enterprise'
  credits?: number
  usedCredits?: number
  billingEmail?: string
  extra?: Record<string, any>
  [key: string]: any
}

export interface ProviderClient {
  readonly type: ProviderType
  getLanguageModel(modelId: string): any
  chat(params: ChatParams): Promise<any>
}

export interface ChatParams {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string | Array<any>
  }>
  model: string
  maxTokens?: number
  temperature?: number
  topP?: number
  topK?: number
  stopSequences?: string[]
  tools?: Array<any>
  toolChoice?: 'auto' | 'required' | 'none' | { type: 'tool'; name: string }
}

export interface ChatDelta {
  type: 'text-delta' | 'tool-call' | 'tool-result' | 'finish'
  text?: string
  toolCallId?: string
  toolName?: string
  args?: any
  result?: string
  finishReason?: 'stop' | 'length' | 'tool-use' | 'error'
}

export interface ProviderTransform {
  variants: (model: ModelInfo) => Record<string, any>
}

export interface ProviderAuthMethod {
  type: 'api' | 'oauth' | 'subscription'
  label: string
  description?: string
  prompts?: Array<{
    type: 'text' | 'select'
    key: string
    message: string
    placeholder?: string
    options?: Array<{ label: string; value: string }>
    when?: { key: string; op: 'eq' | 'neq'; value: string }
  }>
}