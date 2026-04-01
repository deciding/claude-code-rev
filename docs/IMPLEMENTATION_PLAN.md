# Multi-Provider Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for adding multi-provider support to the restored Claude Code CLI. Each phase builds on the previous one and can be tested independently.

**Timeline Estimate**: 3-5 weeks (depending on testing depth)

---

## Phase 1: Provider Abstraction Layer (Week 1)

**Goal**: Create the foundation for multiple providers without breaking existing code.

### Files to Create

#### 1. `src/providers/types.ts`

**Purpose**: Define TypeScript types for all providers

**Key Types**:
```typescript
export type ProviderType = 'legacy' | 'ai-sdk'

export interface ProviderInfo {
  id: string
  name: string
  npm?: string
  env: string[]
  models: Map<string, ModelInfo>
  source: 'env' | 'config' | 'api'
  key?: string
}

export interface ModelInfo {
  id: string
  providerId: string
  name: string
  family: string
  capabilities: ModelCapabilities
  cost: ModelCost
  limit: ModelLimits
}

export interface ModelCapabilities {
  streaming: boolean
  tools: boolean
  vision: boolean
  reasoning: boolean
  audio: boolean
}

export interface ModelCost {
  input: number
  output: number
  cache?: {
    read: number
    write: number
  }
}

export interface ModelLimits {
  context: number
  output: number
}

export interface Credential {
  type: 'api' | 'oauth'
  key?: string
  access?: string
  refresh?: string
  expires?: number
}

export interface ProviderClient {
  readonly type: ProviderType
  chat(params: ChatParams): AsyncGenerator<ChatDelta>
  models(): Promise<ModelInfo[]>
}
```

**Validation**: TypeScript compiles without errors

---

#### 2. `src/providers/registry.ts`

**Purpose**: Maintain a registry of available providers

**Key Functions**:
```typescript
export namespace ProviderRegistry {
  // Register a provider
  export function register(provider: ProviderInfo): void
  
  // Get all registered providers
  export function getAll(): ProviderInfo[]
  
  // Get provider by ID
  export function get(id: string): ProviderInfo | undefined
  
  // Check if provider has credentials
  export function hasCredentials(id: string): boolean
  
  // Get default provider
  export function getDefault(): ProviderInfo
}
```

**Implementation Notes**:
- Store providers in memory Map
- Load from config + env + auth.json
- Merge provider definitions (models.dev + user config)

**Testing**:
```bash
bun test src/providers/registry.test.ts
```

---

#### 3. `src/providers/auth.ts`

**Purpose**: Manage provider credentials securely

**Key Functions**:
```typescript
export namespace Auth {
  const AUTH_FILE = path.join(getClaudeConfigHomeDir(), 'auth.json')
  
  // Get credential for provider
  export async function get(provider: string): Promise<Credential | null>
  
  // Set credential for provider
  export async function set(provider: string, cred: Credential): Promise<void>
  
  // Remove credential
  export async function remove(provider: string): Promise<void>
  
  // List all credentials
  export async function all(): Promise<Record<string, Credential>>
  
  // Check if provider has credential
  export async function has(provider: string): Promise<boolean>
}
```

**Security**:
- File permissions: `0600` (read/write owner only)
- Never log credential values
- Validate format before saving

**Testing**:
- Mock file system
- Test read/write/delete cycles
- Test permission enforcement

---

#### 4. `src/providers/models-dev.ts`

**Purpose**: Fetch and cache models.dev data

**Key Functions**:
```typescript
export namespace ModelsDev {
  const CACHE_FILE = path.join(getClaudeConfigHomeDir(), 'cache', 'models.json')
  const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
  
  // Get all providers with models
  export async function get(): Promise<Record<string, ProviderInfo>>
  
  // Force refresh from API
  export async function refresh(): Promise<void>
  
  // Get specific provider info
  export async function getProvider(id: string): Promise<ProviderInfo | null>
  
  // Get specific model info
  export async function getModel(modelId: string): Promise<ModelInfo | null>
}
```

**Implementation**:
1. Fetch from `https://models.dev/api/models.json`
2. Parse and transform to our types
3. Cache locally with timestamp
4. Use cache if fresh (< 24h old)
5. Background refresh if stale

**Testing**:
- Mock HTTP requests
- Test cache hit/miss
- Test TTL expiration

---

### Files to Modify

#### 1. `src/utils/model/providers.ts`

**Changes**:
```typescript
export type APIProvider = 'firstParty' | 'bedrock' | 'vertex' | 'foundry' | 'aiSDK'

export function getAPIProvider(): APIProvider {
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_BEDROCK)) return 'bedrock'
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_VERTEX)) return 'vertex'
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_FOUNDRY)) return 'foundry'
  
  // NEW: Check if using AI SDK providers
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_AI_SDK)) return 'aiSDK'
  
  return 'firstParty'
}

// NEW: Check if should route to AI SDK
export function shouldUseAISDK(): boolean {
  return getAPIProvider() === 'aiSDK'
}
```

**Validation**:
- Existing tests pass
- No changes to Bedrock/Vertex/Foundry behavior

---

#### 2. `package.json`

**Add dependencies**:
```json
{
  "dependencies": {
    "@ai-sdk/provider": "^1.0.0"
  }
}
```

**Note**: Provider-specific packages loaded dynamically later

---

### Testing Phase 1

**Unit Tests**:
- `src/providers/types.test.ts` - Type validation
- `src/providers/registry.test.ts` - Provider registration
- `src/providers/auth.test.ts` - Credential management
- `src/providers/models-dev.test.ts` - Model discovery

**Integration Tests**:
- Load providers from models.dev
- Store and retrieve credentials
- Cache management

**Manual Verification**:
```bash
# Run existing CLI - should work unchanged
bun run dev

# Type check new providers module
bun run typecheck src/providers
```

---

## Phase 2: Authentication System & Connect Command (Week 2)

**Goal**: Implement `/connect` command for interactive provider setup

### Files to Create

#### 1. `src/commands/providers/connect.tsx`

**Purpose**: Interactive provider connection

**Implementation**:
```tsx
import { Command } from '../../command.js'
import { Auth } from '../../providers/auth.js'
import { ModelsDev } from '../../providers/models-dev.js'
import { prompts } from '@clack/prompts'

export const ConnectCommand = new Command({
  name: 'connect',
  aliases: ['auth', 'login'],
  description: 'Connect to an AI provider',
  
  async run(context) {
    // 1. Fetch available providers
    const providers = await ModelsDev.get()
    
    // 2. Show selection UI
    const provider = await prompts.select({
      message: 'Select provider',
      options: Object.entries(providers)
        .map(([id, info]) => ({
          label: info.name,
          value: id,
          hint: info.env[0] // Show env var hint
        }))
    })
    
    if (!provider) return
    
    // 3. Prompt for credentials
    const cred = await prompts.password({
      message: 'Enter API key',
      validate: (key) => key.length > 0 ? undefined : 'Required'
    })
    
    // 4. Save credentials
    await Auth.set(provider, {
      type: 'api',
      key: cred
    })
    
    // 5. Success message
    prompts.log.success(`Connected to ${providers[provider].name}`)
  }
})
```

**UX Flow**:
1. User types `/connect`
2. CLI shows provider list (fuzzy searchable)
3. User selects provider
4. CLI prompts for API key (hidden input)
5. CLI validates and saves
6. Success message

---

#### 2. `src/commands/providers/disconnect.tsx`

**Purpose**: Remove provider credentials

**Implementation**:
```typescript
export const DisconnectCommand = new Command({
  name: 'disconnect',
  aliases: ['logout'],
  description: 'Disconnect from a provider',
  
  async run(context) {
    const creds = await Auth.all()
    
    if (Object.keys(creds).length === 0) {
      prompts.log.info('No providers connected')
      return
    }
    
    const provider = await prompts.select({
      message: 'Select provider to disconnect',
      options: Object.entries(creds).map(([id, cred]) => ({
        label: id,
        value: id
      }))
    })
    
    await Auth.remove(provider)
    prompts.log.success(`Disconnected from ${provider}`)
  }
})
```

---

#### 3. `src/commands/providers/list.tsx`

**Purpose**: Show connected providers

**Implementation**:
```typescript
export const ProvidersListCommand = new Command({
  name: 'providers',
  description: 'List connected providers',
  
  async run(context) {
    const creds = await Auth.all()
    const providers = await ModelsDev.get()
    
    prompts.intro('Connected Providers')
    
    for (const [id, cred] of Object.entries(creds)) {
      const name = providers[id]?.name ?? id
      prompts.log.info(`${name} (${cred.type})`)
    }
    
    prompts.outro(`${Object.keys(creds).length} connected`)
  }
})
```

---

### Files to Modify

#### 1. `src/commands.ts`

**Register new commands**:
```typescript
import { ConnectCommand } from './commands/providers/connect.js'
import { DisconnectCommand } from './commands/providers/disconnect.js'
import { ProvidersListCommand } from './commands/providers/list.js'

export const commands = {
  // ... existing commands
  connect: ConnectCommand,
  disconnect: DisconnectCommand,
  providers: ProvidersListCommand,
}
```

---

### Testing Phase 2

**Unit Tests**:
- Command registration
- Credential flow
- Provider selection

**Integration Tests**:
- `/connect` command full flow
- `/disconnect` command
- `/providers` command

**Manual Testing**:
```bash
# Connect to OpenAI (with test key)
bun run dev
> /connect
# Select OpenAI
# Enter test key: sk-test-...
# Should show success message

# List providers
> /providers
# Should show OpenAI connected

# Disconnect
> /disconnect
# Select OpenAI
# Should show disconnected
```

---

## Phase 3: AI SDK Provider Integration (Week 3)

**Goal**: Integrate Vercel AI SDK for unified model access

### Files to Create

#### 1. `src/providers/ai-sdk/index.ts`

**Purpose**: Main AI SDK provider wrapper

**Implementation**:
```typescript
import type { LanguageModelV1 } from '@ai-sdk/provider'
import { ProviderRegistry } from '../registry.js'
import { Auth } from '../auth.js'

export class AISDKProvider {
  private clients = new Map<string, any>()
  
  async getClient(providerId: string, modelId: string): Promise<LanguageModelV1> {
    // Check cache
    const cacheKey = `${providerId}:${modelId}`
    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey)
    }
    
    // Get provider info
    const provider = ProviderRegistry.get(providerId)
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`)
    }
    
    // Get credentials
    const cred = await Auth.get(providerId)
    if (!cred && provider.env.every(env => !process.env[env])) {
      throw new Error(`No credentials for ${providerId}`)
    }
    
    // Load provider module
    const module = await this.loadProviderModule(provider.npm || `@ai-sdk/${providerId}`)
    const client = module[providerId]({
      apiKey: cred?.key ?? process.env[provider.env[0]]
    })
    
    const model = client.languageModel(modelId)
    this.clients.set(cacheKey, model)
    
    return model
  }
  
  private async loadProviderModule(npm: string): Promise<any> {
    // Dynamic import
    return await import(npm)
  }
  
  // Chat completion wrapper
  async *chat(
    providerId: string,
    modelId: string,
    messages: Message[],
    options?: ChatOptions
  ): AsyncGenerator<ChatDelta> {
    const model = await this.getClient(providerId, modelId)
    
    const stream = await model.doStream({
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: messages,
      ...options
    })
    
    for await (const chunk of stream) {
      yield this.transformChunk(chunk)
    }
  }
}
```

---

#### 2. `src/providers/ai-sdk/anthropic.ts`

**Purpose**: Anthropic provider via AI SDK (alternative to legacy)

**Implementation**:
```typescript
import { createAnthropic } from '@ai-sdk/anthropic'

export function createAnthropicProvider(apiKey?: string) {
  return createAnthropic({
    apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
    // Include same betas as legacy system
    headers: {
      'anthropic-beta': 'interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14'
    }
  })
}
```

**Note**: This is OPTIONAL - kept for compatibility with AI SDK ecosystem

---

#### 3. `src/providers/ai-sdk/openai.ts`

**Purpose**: OpenAI provider

**Implementation**:
```typescript
import { createOpenAI } from '@ai-sdk/openai'

export function createOpenAIProvider(apiKey?: string) {
  return createOpenAI({
    apiKey: apiKey ?? process.env.OPENAI_API_KEY
  })
}
```

---

#### 4. `src/providers/ai-sdk/google.ts`

**Purpose**: Google Gemini provider

**Implementation**:
```typescript
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export function createGoogleProvider(apiKey?: string) {
  return createGoogleGenerativeAI({
    apiKey: apiKey ?? process.env.GOOGLE_API_KEY
  })
}
```

---

#### 5. `src/providers/ai-sdk/openrouter.ts`

**Purpose**: OpenRouter (multi-provider aggregator)

**Implementation**:
```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export function createOpenRouterProvider(apiKey?: string) {
  return createOpenRouter({
    apiKey: apiKey ?? process.env.OPENROUTER_API_KEY
  })
}
```

---

### Dependencies to Add

```json
{
  "dependencies": {
    "@ai-sdk/anthropic": "^1.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/google": "^1.0.0",
    "@ai-sdk/amazon-bedrock": "^1.0.0",
    "@ai-sdk/google-vertex": "^1.0.0",
    "@openrouter/ai-sdk-provider": "^0.0.0"
  }
}
```

**Install**:
```bash
bun add @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google @ai-sdk/amazon-bedrock @ai-sdk/google-vertex @openrouter/ai-sdk-provider
```

---

### Files to Modify

#### 1. `src/utils/api.ts`

**Purpose**: Route requests to correct provider

**Changes**:
```typescript
import { shouldUseAISDK } from './model/providers.js'
import { AISDKProvider } from '../providers/ai-sdk/index.js'

// Add at top
const aiSDKProvider = new AISDKProvider()

export async function* streamChat(
  messages: Message[],
  model: string,
  options: ChatOptions
): AsyncGenerator<ChatDelta> {
  // Check if using AI SDK
  if (shouldUseAISDK() || model.includes('/')) {
    // Parse model: "openai/gpt-4" or "google/gemini-pro"
    const [providerId, modelId] = model.includes('/') 
      ? model.split('/') 
      : ['anthropic', model]
    
    yield* aiSDKProvider.chat(providerId, modelId, messages, options)
    return
  }
  
  // Otherwise use legacy system
  // ... existing code ...
}
```

---

### Testing Phase 3

**Unit Tests**:
- AI SDK client creation
- Model routing logic
- Provider loading

**Integration Tests**:
- OpenAI model chat
- Google model chat
- OpenRouter model chat

**Manual Testing**:
```bash
# Set env vars
export OPENAI_API_KEY=sk-...

# Run CLI
bun run dev

# Should be able to use OpenAI models
> model: gpt-4-turbo

# Or with provider prefix
> model: openai/gpt-4-turbo

# Connect Google
> /connect
# Select Google
# Enter API key

# Use Google model
> model: google/gemini-pro
```

---

## Phase 4: Model Selection & Switching (Week 4)

**Goal**: Seamless model selection across providers

### Files to Create

#### 1. `src/commands/model/picker.tsx`

**Purpose**: Interactive model picker UI

**Implementation**:
```tsx
import { prompts } from '@clack/prompts'
import { ModelsDev } from '../../providers/models-dev.js'
import { Auth } from '../../providers/auth.js'

export async function pickModel(): Promise<string | null> {
  const providers = await ModelsDev.get()
  const creds = await Auth.all()
  
  // Filter to only providers with credentials
  const available = Object.entries(providers)
    .filter(([id]) => creds[id] || providers[id].env.some(env => process.env[env]))
  
  // Build model list
  const models: Array<{ label: string, value: string, hint?: string }> = []
  
  for (const [providerId, provider] of available) {
    for (const [modelId, model] of Object.entries(provider.models)) {
      models.push({
        label: model.name,
        value: `${providerId}/${modelId}`,
        hint: provider.name
      })
    }
  }
  
  // Show picker with fuzzy search
  const selected = await prompts.autocomplete({
    message: 'Select model',
    options: models
  })
  
  return selected || null
}
```

---

#### 2. `src/utils/model/selection.ts`

**Purpose**: Track model selection across session

**Implementation**:
```typescript
// Global model selection state
let currentModel: string | null = null
let currentProvider: string | null = null

export function setModel(model: string): void {
  currentModel = model
  
  // Parse provider from model string
  if (model.includes('/')) {
    currentProvider = model.split('/')[0]
  } else {
    // Default to current provider or legacy
    currentProvider = null
  }
}

export function getModel(): string | null {
  return currentModel
}

export function getProvider(): string | null {
  return currentProvider
}

export function isModelFromProvider(model: string, provider: string): boolean {
  return model.startsWith(`${provider}/`)
}
```

---

### Files to Modify

#### 1. `src/commands/model/model.tsx`

**Add provider info to model switcher**:
```typescript
// In model command handler
if (!args.model) {
  // Show interactive picker
  const selected = await pickModel()
  if (selected) {
    setModel(selected)
    prompts.log.success(`Switched to ${selected}`)
  }
  return
}

// Parse provider prefix
if (args.model.includes('/')) {
  const [provider, model] = args.model.split('/')
  setModel(args.model)
  // ... continue
}
```

---

### Testing Phase 4

**Manual Testing**:
```bash
# Switch models interactively
bun run dev
> /model

# Should show picker with all available models
# Select "openai/gpt-4-turbo"
# Should switch successfully

# Switch via command
> /model google/gemini-pro

# Switch back to Anthropic
> /model claude-sonnet-4-6
```

---

## Phase 5: Documentation & Polish (Week 5)

**Goal**: Complete documentation and edge cases

### Files to Create

#### 1. `docs/PROVIDERS.md`

**Content**:
- How to connect providers
- Supported providers list
- Environment variables
- Configuration options
- Troubleshooting

---

#### 2. `docs/MIGRATION.md`

**Content**:
- No migration needed for existing users
- How to opt-in to new providers
- Differences between legacy vs new system

---

### Files to Modify

#### 1. `README.md`

**Add section**:
```markdown
## Multi-Provider Support

Claude Code now supports multiple AI providers:

### Connecting Providers

```bash
# Interactive connection
claude
> /connect

# List connected providers
> /providers

# Disconnect
> /disconnect openai
```

### Supported Providers

- Anthropic (Claude)
- OpenAI (GPT)
- Google (Gemini)
- OpenRouter (Multi-provider)
- AWS Bedrock
- Google Vertex
- Azure

### Model Selection

```bash
# Use specific model
> model: openai/gpt-4-turbo

# Interactive model picker
> /model
```
```

---

### Testing Phase 5

**Documentation Review**:
- All commands documented
- All examples work
- No broken links

**End-to-End Testing**:
- Fresh install
- Connect each provider
- Use each provider
- Disconnect
- Legacy system still works

---

## Risk Mitigation

### Risk: Breaking existing users

**Mitigation**:
- Keep legacy system completely separate
- No changes to existing env vars
- No changes to existing code paths
- Extensive testing with existing configurations

### Risk: AI SDK dependency conflicts

**Mitigation**:
- Pin specific versions
- Load dynamically only when needed
- Test with bundling

### Risk: Credential security

**Mitigation**:
- Use file permissions 0600
- Never log credentials
- Validate before storing
- Clear memory after use

### Risk: Provider API changes

**Mitigation**:
- Use stable AI SDK versions
- Subscribe to AI SDK changelog
- Test each provider regularly

---

## Success Metrics

1. ✅ All existing tests pass
2. ✅ Can connect to 3+ providers
3. ✅ Can switch between providers
4. ✅ Credentials persist across sessions
5. ✅ No performance regression
6. ✅ Zero breaking changes for existing users
7. ✅ Documentation complete

---

## Rollback Plan

If critical issues arise:

1. **Phase 1**: Remove `src/providers/` directory - no impact
2. **Phase 2**: Remove `/connect` command - no impact
3. **Phase 3**: Remove AI SDK deps - revert package.json
4. **Phase 4**: Remove model picker - no impact

Legacy system continues working through all rollback scenarios.

---

## Dependencies Summary

**Phase 1**: `@ai-sdk/provider` (types only, ~KB)
**Phase 2**: No new dependencies
**Phase 3**: 
- `@ai-sdk/anthropic` (~MB)
- `@ai-sdk/openai` (~MB)
- `@ai-sdk/google` (~MB)
- `@openrouter/ai-sdk-provider` (~KB)

**Total bundle increase**: ~5-10MB (lazy loaded)

---

## Next Steps After Completion

1. Add OAuth flows for providers that support it
2. Add provider usage metrics
3. Add cost tracking per provider
4. Add automatic provider failover
5. Support custom providers via config