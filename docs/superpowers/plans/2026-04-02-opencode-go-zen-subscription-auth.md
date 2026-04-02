# OpenCode Go + Zen + Subscription Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OpenCode Go and Zen providers with subscription-based authentication, replicating opencode's multi-provider auth system.

**Architecture:** 
- Add new provider modules for `opencode` (Zen) and `opencode-go` using `@ai-sdk/openai-compatible`
- Both use OpenAI-compatible APIs at different endpoints
- Extend auth system to support subscription/credits-based auth
- Models are defined statically (mirroring opencode's models.json)

**Tech Stack:** Vercel AI SDK, @ai-sdk/openai-compatible

---

### Task 1: Create OpenCode Zen Provider Module

**Files:**
- Create: `src/providers/ai-sdk/opencode-zen.ts`

- [ ] **Step 1: Create the opencode-zen.ts file**

```typescript
/**
 * OpenCode Zen Provider Module
 * 
 * Provider for OpenCode Zen - subscription-based AI models
 * API: https://opencode.ai/zen/v1
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const OPENCODEROV_PROVIDER: Partial<ProviderInfo> = {
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
        temperature: false,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 1.75, output: 14 },
      limit: { context: 400000, output: 128000 },
      options: { provider: { npm: '@ai-sdk/openai' } }
    }),
    'gpt-5.1-codex-mini': createModelInfo('gpt-5.1-codex-mini', 'opencode', {
      name: 'GPT-5.1 Codex Mini',
      family: 'gpt-codex',
      capabilities: {
        temperature: false,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.25, output: 2 },
      limit: { context: 400000, output: 128000 },
      options: { provider: { npm: '@ai-sdk/openai' } }
    }),
    'gpt-5.4-pro': createModelInfo('gpt-5.4-pro', 'opencode', {
      name: 'GPT-5.4 Pro',
      family: 'gpt-pro',
      capabilities: {
        temperature: false,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 30, output: 180 },
      limit: { context: 1050000, output: 128000 },
      options: { provider: { npm: '@ai-sdk/openai' } }
    }),
    'gpt-5.4-mini': createModelInfo('gpt-5.4-mini', 'opencode', {
      name: 'GPT-5.4 Mini',
      family: 'gpt-mini',
      capabilities: {
        temperature: false,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.75, output: 4.5 },
      limit: { context: 400000, output: 128000 },
      options: { provider: { npm: '@ai-sdk/openai' } }
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
        interleaved: { field: 'reasoning_content' }
      },
      cost: { input: 1, output: 5 },
      limit: { context: 262144, output: 65536 }
    }),
    'kimi-k2.5': createModelInfo('kimi-k2.5', 'opencode', {
      name: 'Kimi K2.5',
      family: 'kimi',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: true, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: { field: 'reasoning_content' }
      },
      cost: { input: 0.6, output: 3 },
      limit: { context: 262144, output: 65536 }
    }),
    'big-pickle': createModelInfo('big-pickle', 'opencode', {
      name: 'Big Pickle',
      family: 'big-pickle',
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
      limit: { context: 200000, output: 128000 },
      options: { provider: { npm: '@ai-sdk/anthropic' } }
    }),
    'minimax-m2.7': createModelInfo('minimax-m2.7', 'opencode', {
      name: 'MiniMax M2.7',
      family: 'minimax-m2.7',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.3, output: 1.2 },
      limit: { context: 204800, output: 131072 },
      options: { provider: { npm: '@ai-sdk/anthropic' } }
    }),
    'glm-5': createModelInfo('glm-5', 'opencode', {
      name: 'GLM-5',
      family: 'glm',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: { field: 'reasoning_content' }
      },
      cost: { input: 1, output: 3.2 },
      limit: { context: 204800, output: 131072 }
    })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/providers/ai-sdk/opencode-zen.ts
git commit -m "feat: add OpenCode Zen provider with models"
```

---

### Task 2: Create OpenCode Go Provider Module

**Files:**
- Create: `src/providers/ai-sdk/opencode-go.ts`

- [ ] **Step 1: Create the opencode-go.ts file**

```typescript
/**
 * OpenCode Go Provider Module
 * 
 * Provider for OpenCode Go - low-cost subscription ($10/month)
 * API: https://opencode.ai/zen/go/v1
 */

import type { ProviderInfo, ModelInfo } from '../types.js'
import { createModelInfo } from '../registry.js'

export const OPENCODEROGO_PROVIDER: Partial<ProviderInfo> = {
  id: 'opencode-go',
  name: 'OpenCode Go',
  npm: '@ai-sdk/openai-compatible',
  api: 'https://opencode.ai/zen/go/v1',
  env: ['OPENCODEROGO_API_KEY'],
  source: 'config',
  models: {
    'kimi-k2.5': createModelInfo('kimi-k2.5', 'opencode-go', {
      name: 'Kimi K2.5',
      family: 'kimi',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: true, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: { field: 'reasoning_content' }
      },
      cost: { input: 0.6, output: 3 },
      limit: { context: 262144, output: 65536 },
      release_date: '2026-01-27'
    }),
    'minimax-m2.7': createModelInfo('minimax-m2.7', 'opencode-go', {
      name: 'MiniMax M2.7',
      family: 'minimax-m2.7',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.3, output: 1.2 },
      limit: { context: 204800, output: 131072 },
      release_date: '2026-03-18',
      options: { provider: { npm: '@ai-sdk/anthropic' } }
    }),
    'glm-5': createModelInfo('glm-5', 'opencode-go', {
      name: 'GLM-5',
      family: 'glm',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: { field: 'reasoning_content' }
      },
      cost: { input: 1, output: 3.2 },
      limit: { context: 204800, output: 131072 },
      release_date: '2026-02-11'
    }),
    'minimax-m2.5': createModelInfo('minimax-m2.5', 'opencode-go', {
      name: 'MiniMax M2.5',
      family: 'minimax-m2.5',
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false
      },
      cost: { input: 0.3, output: 1.2 },
      limit: { context: 204800, output: 131072 },
      release_date: '2026-02-12',
      options: { provider: { npm: '@ai-sdk/anthropic' } }
    })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/providers/ai-sdk/opencode-go.ts
git commit -m "feat: add OpenCode Go provider with models"
```

---

### Task 3: Register Providers in Routing

**Files:**
- Modify: `src/utils/model/routing.ts:1-28`

- [ ] **Step 1: Add imports for new providers**

Add after line 18:
```typescript
import { OPENCODEROV_PROVIDER } from '../../providers/ai-sdk/opencode-zen.js'
import { OPENCODEROGO_PROVIDER } from '../../providers/ai-sdk/opencode-go.js'
```

- [ ] **Step 2: Register new providers**

Add after line 28 (before the comment):
```typescript
ProviderRegistry.register(OPENCODEROV_PROVIDER as any)
ProviderRegistry.register(OPENCODEROGO_PROVIDER as any)
```

- [ ] **Step 3: Add provider detection for opencode models**

Modify `detectProviderFromModel` function (around line 72), add before "Unknown" return:

```typescript
  // OpenCode Zen/Go models
  if (model.startsWith('kimi-') || model.startsWith('glm-') || model.startsWith('minimax-') || model.startsWith('big-')) {
    return 'opencode'
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/model/routing.ts
git commit -m "feat: register OpenCode Zen and Go providers"
```

---

### Task 4: Extend Auth Types for Subscription Support

**Files:**
- Modify: `src/providers/types.ts`

- [ ] **Step 1: Add subscription credential type**

Modify `CredentialType` (line 10):
```typescript
export type CredentialType = 'api' | 'oauth' | 'subscription'
```

- [ ] **Step 2: Add subscription fields to Credential interface**

Modify `Credential` interface (lines 79-86):
```typescript
export interface Credential {
  type: CredentialType
  key?: string
  access?: string
  refresh?: string
  expires?: number
  // Subscription-specific fields
  subscriptionId?: string
  plan?: 'free' | 'pro' | 'team' | 'enterprise'
  credits?: number
  usedCredits?: number
  billingEmail?: string
  // Provider-specific extra fields
  extra?: Record<string, any>
  [key: string]: any
}
```

- [ ] **Step 3: Add provider auth method types**

Add new interface after `Credential`:
```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add src/providers/types.ts
git commit -m "feat: extend auth types for subscription support"
```

---

### Task 5: Add Subscription Auth Methods to Auth Service

**Files:**
- Modify: `src/providers/auth.ts`

- [ ] **Step 1: Add helper functions for subscription credentials**

Add at end of file (after line 110):
```typescript
export function isSubscriptionCredential(credential: Credential): boolean {
  return credential.type === 'subscription'
}

export function getSubscriptionInfo(credential: Credential): {
  plan: string
  credits: number
  usedCredits: number
  remainingCredits: number
} | null {
  if (credential.type !== 'subscription') return null
  return {
    plan: credential.plan || 'free',
    credits: credential.credits || 0,
    usedCredits: credential.usedCredits || 0,
    remainingCredits: (credential.credits || 0) - (credential.usedCredits || 0)
  }
}

export async function updateSubscriptionUsage(
  provider: string, 
  usedCredits: number
): Promise<void> {
  const credential = await Auth.get(provider)
  if (!credential || credential.type !== 'subscription') return
  
  const updated: Credential = {
    ...credential,
    usedCredits: (credential.usedCredits || 0) + usedCredits
  }
  await Auth.set(provider, updated)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/providers/auth.ts
git commit -m "feat: add subscription auth helpers"
```

---

### Task 6: Update AI SDK Provider Manager for OpenAI-Compatible

**Files:**
- Modify: `src/providers/ai-sdk/index.ts`

- [ ] **Step 1: Update provider module loading**

Modify `loadProviderModule` (around line 73) to handle openai-compatible providers:

```typescript
private async loadProviderModule(provider: ProviderInfo): Promise<ProviderFunction> {
  const npm = provider.npm || `@ai-sdk/${provider.id}`
  
  if (this.providerModules.has(npm)) {
    return this.providerModules.get(npm)!
  }

  try {
    const module = await import(npm)
    
    let createFn = module.default
    
    if (typeof createFn !== 'function') {
      // Try common create function names
      const possibleFns = [
        'createOpenAICompatible',
        'createAnthropic',
        'createOpenAI', 
        'createGoogleGenerativeAI',
        'createMistral',
        'createGroq',
        'createDeepSeek',
        'createXai'
      ]
      
      for (const fnName of possibleFns) {
        if (module[fnName]) {
          createFn = module[fnName]
          break
        }
      }
    }
    
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
```

- [ ] **Step 2: Update getProviderClient to use baseURL**

Modify `getProviderClient` (around line 26):

```typescript
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
  
  // For subscription providers, allow without key (uses account-based auth)
  if (!apiKey && provider.env.length > 0 && provider.id !== 'opencode' && provider.id !== 'opencode-go') {
    throw new Error(
      `No API key found for ${provider.name}. ` +
      `Set ${provider.env[0]} environment variable or run /connect ${providerId}`
    )
  }

  const providerModule = await this.loadProviderModule(provider)
  
  // Build options - include baseURL for openai-compatible providers
  const options: any = {
    apiKey: apiKey || 'dummy', // Allow dummy key for subscription auth
    ...(provider.options || {})
  }
  
  // Add baseURL if provider has API endpoint
  if (provider.api) {
    options.baseURL = provider.api
  }
  
  const client = providerModule(options)

  const model = client.languageModel(modelId)
  
  this.clients.set(cacheKey, {
    provider: model,
    timestamp: Date.now()
  })

  return model
}
```

- [ ] **Step 3: Commit**

```bash
git add src/providers/ai-sdk/index.ts
git commit -m "feat: update AI SDK manager for openai-compatible providers"
```

---

### Task 7: Verify Build

**Files:**
- Test: Build verification

- [ ] **Step 1: Run build**

```bash
cd /mnt/ssd1/zining/claude-code-rev && bun run dev --version 2>&1 | head -20
```

Expected: No TypeScript errors, version info displayed

- [ ] **Step 2: Commit**

```bash
git commit -m "build: verify implementation compiles"
```

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-02-opencode-go-zen-subscription-auth.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
