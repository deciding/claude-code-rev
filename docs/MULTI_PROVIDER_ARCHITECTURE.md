# Multi-Provider Architecture Design

## Executive Summary

Add support for multiple AI model providers (OpenAI, Google Gemini, OpenRouter, etc.) while preserving the existing Anthropic/Bedrock/Vertex/Foundry system as a separate, untouched subsystem.

## Design Goals

1. **No Breaking Changes**: Existing Anthropic/Bedrock/Vertex/Foundry users see zero changes
2. **Clean Separation**: Two independent provider systems run side-by-side  
3. **Extensibility**: Easy to add new providers via configuration
4. **OpenCode Compatibility**: Match OpenCode's `/connect` command behavior

## Architecture Overview

### Two Provider Systems

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code CLI                         │
├────────────────────────────┬────────────────────────────────┤
│   Legacy Provider System    │    New Provider System         │
│   (Untouched)               │    (New Addition)               │
│                             │                                 │
│   • Anthropic API           │    • AI SDK-based providers    │
│   • AWS Bedrock             │    • /connect command          │
│   • Google Vertex           │    • Config-driven             │
│   • Azure Foundry           │    • models.dev integration    │
│                             │                                 │
│   Uses:                     │    Uses:                        │
│   @anthropic-ai/sdk         │    @ai-sdk/* packages          │
│   Direct API calls          │    Unified interface            │
└────────────────────────────┴────────────────────────────────┘
```

### When Each System Is Used

The system determines which provider to use at runtime:

```typescript
// Pseudocode for provider selection
if (model.startsWith('claude-')) {
  // Route to legacy system if configured
  if (CLAUDE_CODE_USE_BEDROCK) return bedrockClient
  if (CLAUDE_CODE_USE_VERTEX) return vertexClient  
  if (CLAUDE_CODE_USE_FOUNDRY) return foundryClient
  return anthropicClient
} else {
  // Route to new provider system
  return aiSDKProvider.getModel(model)
}

// User explicitly selects provider via /connect
if (connectedProvider) {
  return aiSDKProvider.getModel(model, connectedProvider)
}
```

## File Structure

### New Files

```
src/
├── providers/
│   ├── registry.ts          # Provider registry and discovery
│   ├── types.ts              # Shared provider types
│   ├── auth.ts               # Authentication management
│   ├── models-dev.ts         # models.dev integration
│   └── ai-sdk/
│       ├── index.ts          # AI SDK provider wrapper
│       ├── anthropic.ts      # Anthropic via AI SDK
│       ├── openai.ts         # OpenAI provider
│       ├── google.ts         # Google/Gemini provider
│       ├── bedrock.ts        # Bedrock via AI SDK
│       ├── vertex.ts         # Vertex via AI SDK
│       └── openrouter.ts     # OpenRouter provider
├── commands/
│   └── providers/
│       ├── connect.tsx       # /connect command
│       ├── disconnect.tsx   # /disconnect command
│       └── list.tsx          # /providers command
```

### Modified Files

```
src/utils/model/providers.ts
  - Add: 'aiSDK' as APIProvider type option
  - Keep: existing 'firstParty', 'bedrock', 'vertex', 'foundry'
  
src/utils/api.ts
  - Route calls to appropriate provider system
  - Detect model type and route accordingly
```

## Implementation Details

### Phase 1: Provider Abstraction Layer

**Goal**: Create the interface that all providers implement

```typescript
// src/providers/types.ts
export interface ProviderInfo {
  id: string           // Provider ID: 'openai', 'anthropic', etc.
  name: string         // Display name: 'OpenAI', 'Anthropic', etc.
  npm?: string         // NPM package: '@ai-sdk/openai'
  env: string[]        // Env vars: ['OPENAI_API_KEY']
  models: Map<string, ModelInfo>
}

export interface ModelInfo {
  id: string           // Model ID: 'gpt-4-turbo'
  name: string         // Display name: 'GPT-4 Turbo'
  context: number      // Context window size
  capabilities: {
    streaming: boolean
    tools: boolean
    vision: boolean
    // ...
  }
  cost: {
    input: number
    output: number
  }
}

export interface ProviderClient {
  chat(params: ChatParams): AsyncGenerator<ChatDelta>
  complete?(params: CompleteParams): Promise<CompleteResponse>
  models(): Promise<ModelInfo[]>
}
```

### Phase 2: Authentication System

**Goal**: Manage provider credentials securely

```typescript
// src/providers/auth.ts
export namespace Auth {
  // Store credentials in ~/.claude/auth.json (same as OpenCode)
  // Format: { [providerId]: { type: 'api' | 'oauth', key: string } }
  
  export async function set(provider: string, credential: Credential): Promise<void>
  export async function get(provider: string): Promise<Credential | null>
  export async function remove(provider: string): Promise<void>
  export async function all(): Promise<Record<string, Credential>>
  export async function has(provider: string): Promise<boolean>
}
```

**File location**: `~/.claude/auth.json` (same as OpenCode)

### Phase 3: `/connect` Command

**Goal**: Interactive provider connection

```typescript
// src/commands/providers/connect.tsx
export const ConnectCommand = {
  command: 'connect [provider]',
  aliases: ['auth', 'login'],
  describe: 'Connect to an AI provider',
  
  async handler(args) {
    // 1. Show provider list (from models.dev)
    // 2. Prompt for credential type (API key / OAuth)
    // 3. Securely save credentials
    // 4. Load provider models
  }
}
```

User flow:
1. User types `/connect`
2. CLI shows list: `[OpenAI, Anthropic, Google, OpenRouter, ...]`
3. User selects provider
4. CLI prompts for credential (API key or OAuth flow)
5. Credential stored in `~/.claude/auth.json`
6. Models loaded and made available

### Phase 4: AI SDK Integration

**Goal**: Use Vercel AI SDK for unified provider interface

**Dependencies to add**:
```json
{
  "dependencies": {
    "@ai-sdk/provider": "^1.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/google": "^1.0.0",
    "@ai-sdk/amazon-bedrock": "^1.0.0",
    "@ai-sdk/google-vertex": "^1.0.0",
    "@openrouter/ai-sdk-provider": "^0.0.0"
  }
}
```

**Provider instantiation**:
```typescript
// src/providers/ai-sdk/index.ts
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const BUNDLED_PROVIDERS = {
  anthropic: (opts) => createAnthropic(opts),
  openai: (opts) => createOpenAI(opts),
  google: (opts) => createGoogleGenerativeAI(opts),
  // ...
}

export async function getProviderClient(providerId: string, config: ProviderConfig) {
  const provider = BUNDLED_PROVIDERS[providerId]
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`)
  }
  return provider(config)
}
```

**Model routing**:
```typescript
// Decide which system to use based on model prefix
function getChatClient(model: string): ProviderClient {
  const [provider] = model.split('/')
  
  // Legacy system for Anthropic models
  if (provider === 'claude' || provider === 'anthropic') {
    return getLegacyAnthropicClient()
  }
  
  // Legacy system if explicitly configured
  if (getAPIProvider() !== 'aiSDK') {
    return getLegacyClient()
  }
  
  // New AI SDK system
  return aiSDKProvider.getClient(model)
}
```

### Phase 5: models.dev Integration

**Goal**: Auto-discover available models

```typescript
// src/providers/models-dev.ts
export namespace ModelsDev {
  // Fetch from https://models.dev/api/models.json
  // Cache locally with TTL
  
  export async function get(): Promise<Record<string, ProviderInfo>>
  export async function refresh(): Promise<void>
  export async function getModel(modelId: string): Promise<ModelInfo | null>
}
```

models.dev provides:
- Provider metadata (name, API URL, npm package)
- Model definitions (context window, capabilities, pricing)
- Credential requirements (env vars needed)

## Configuration

### User Configuration

**File**: `~/.claude.json` (existing config file)

Add new section for provider preferences:

```json
{
  "providers": {
    "default": "anthropic",
    "anthropic": {
      "apiKey": "env://ANTHROPIC_API_KEY"
    },
    "openai": {
      "apiKey": "env://OPENAI_API_KEY"
    },
    "openrouter": {
      "apiKey": "env://OPENROUTER_API_KEY"
    }
  }
}
```

### Environment Variables

Support both old and new:

**Legacy (unchanged)**:
- `ANTHROPIC_API_KEY`
- `CLAUDE_CODE_USE_BEDROCK`
- `CLAUDE_CODE_USE_VERTEX`
- `CLAUDE_CODE_USE_FOUNDRY`

**New (additional)**:
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`
- `OPENROUTER_API_KEY`
- `ANTHROPIC_API_KEY` (also works with AI SDK)

## Backward Compatibility

### Preserved Behavior

1. **No changes to existing flags**:
   - `--model claude-3-sonnet` still works exactly as before
   - `CLAUDE_CODE_USE_BEDROCK` still routes to Bedrock
   - All existing auth flows unchanged

2. **No changes to existing code paths**:
   - `src/utils/api.ts` continues to use `@anthropic-ai/sdk`
   - `src/utils/model/providers.ts` unchanged
   - Bedrock/Vertex/Foundry code paths untouched

3. **No new dependencies for default install**:
   - AI SDK packages are lazy-loaded
   - Only loaded when user uses `/connect` or non-Anthropic model

### Migration Path

Users can opt-in:

**Option 1**: Keep using existing setup (no action needed)
```bash
# Uses legacy Anthropic system
claude --model claude-sonnet-4-6
```

**Option 2**: Connect new provider
```bash
# Connect OpenAI via /connect
claude
> /connect

# Now can use OpenAI models
> model: gpt-4-turbo
```

## Testing Strategy

### Unit Tests

1. **Provider abstraction**: Test that all providers implement interface correctly
2. **Auth system**: Test credential storage and retrieval
3. **Model routing**: Test that correct provider is selected based on model prefix

### Integration Tests

1. **Legacy system**: Verify no regressions in Anthropic/Bedrock/Vertex
2. **New providers**: Test each bundled provider
3. **Mixed usage**: Test switching between providers in same session

### Manual Testing Checklist

- [ ] Existing Anthropic API users see no difference
- [ ] Existing Bedrock users still work with env vars
- [ ] `/connect` command works for OpenAI
- [ ] `/connect` command works for Anthropic (AI SDK version)
- [ ] `/connect` command works for OpenRouter
- [ ] Credentials stored securely
- [ ] Credentials persist across sessions
- [ ] `/providers list` shows all connected providers
- [ ] `/disconnect` removes credentials

## Security Considerations

1. **Credential Storage**: 
   - Use `~/.claude/auth.json` with mode `0600`
   - Never log API keys
   - Encrypt sensitive data if needed

2. **Key Validation**:
   - Validate API key format before storing
   - Test credential on connect before persisting

3. **Scope**:
   - Only store credentials, never read other files
   - OAuth tokens get refresh tokens for longevity

## Performance Considerations

1. **Lazy Loading**: AI SDK packages loaded only when needed
2. **Model Caching**: models.dev data cached locally
3. **Credential caching**: Auth data cached in memory after first read

## Success Criteria

1. ✅ Existing users see zero changes
2. ✅ New users can `/connect` to multiple providers
3. ✅ Switching providers is seamless
4. ✅ All bundled providers work correctly
5. ✅ No performance regression for default usage
6. ✅ Credentials stored securely
7. ✅ Clear error messages for connection issues

## Future Enhancements

1. **Custom providers**: Allow users to define their own providers in config
2. **OAuth flows**: Better OAuth support for providers that support it
3. **Provider health checks**: Monitor provider availability
4. **Automatic failover**: Switch to backup provider if primary fails
5. **Cost tracking**: Per-provider cost monitoring
6. **Rate limiting**: Respect provider rate limits