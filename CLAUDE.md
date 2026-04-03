# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a restored Claude Code source tree reconstructed from source maps with compatibility shims for missing native modules. The codebase is a TypeScript CLI application using Bun runtime, React/Ink for the TUI, and an extensible tool/command architecture.

## Development Commands

```bash
# Install dependencies (includes local shim packages)
bun install

# Run the CLI interactively
bun run dev

# Start CLI (alias for dev)
bun run start

# Verify CLI boots and print version
bun run version
```

**No dedicated test/lint scripts are configured** - validate changes by running the affected command or flow manually.

## Architecture

### Entry Flow

```
bootstrap-entry.ts 
  → entrypoints/cli.tsx (bootstrap checks, fast paths)
  → main.tsx (full CLI initialization)
  → commands.ts (command routing)
```

### Core Directories

- **`src/commands/`**: 90+ command modules, each in its own directory (e.g., `commit.ts`, `add-dir/`, `review-pr/`). Commands use kebab-case folders.
- **`src/tools/`**: Tool implementations exposed to AI assistant (AgentTool, BashTool, FileEditTool, GrepTool, WebSearchTool, etc.). Each tool follows the Tool interface pattern.
- **`src/services/`**: Business logic modules (analytics, API clients, MCP, OAuth, rate limiting, settings sync, voice).
- **`src/providers/`**: Multi-provider AI model system supporting Anthropic (legacy), OpenAI, Google Gemini, OpenRouter, and dynamically loaded models from models.dev. See `docs/MULTI_PROVIDER_ARCHITECTURE.md`.
- **`src/components/`**: React/Ink UI components for terminal rendering.
- **`src/utils/`**: Shared utilities (config, auth, platform detection, git helpers, format helpers).
- **`shims/`**: Local packages replacing unrecoverable native bindings (`color-diff-napi`, `modifiers-napi`, `url-handler-napi`, MCP compatibility layers).
- **`vendor/`**: Vendored third-party code and resources.

### Provider System

The codebase runs two parallel provider systems:

1. **Legacy Provider System** (Untouched): Direct `@anthropic-ai/sdk` for Claude models via Anthropic API, Bedrock, Vertex, or Foundry.
2. **New Provider System** (Multi-provider): Uses `@ai-sdk/*` packages for OpenAI, Google, OpenRouter, and others. Configured via `src/providers/ai-sdk/` and routed through `src/providers/registry.ts`.

Model routing logic: if model starts with `claude-`, use legacy system; otherwise, use new provider system. Users can explicitly select providers via `/connect` command.

### Tool Architecture

Tools implement the `Tool` interface from `Tool.ts`. Each tool defines:
- `name`: Tool identifier
- `description`: LLM-facing description
- `inputSchema`: JSON schema for parameters
- `execute()`: Implementation

Tools are registered in `tools.ts` and filtered based on feature flags, user permissions, and context.

## Coding Conventions

- **Module System**: ESM imports (`import`/`export`), not CommonJS
- **JSX**: `react-jsx` transform for React components
- **Naming**:
  - Variables/functions: `camelCase`
  - React components/classes: `PascalCase`
  - Command directories: `kebab-case` (e.g., `src/commands/install-slack-app/`)
- **Style**: Many files omit semicolons, use single quotes. Match surrounding file style exactly.
- **Import Ordering**: Do NOT reorder imports where comments warn against it (e.g., `tools.ts`, `main.tsx` have side-effect dependencies).

## Working with Providers

When adding/modifying AI model providers:

1. Define provider in `src/providers/ai-sdk/{provider}.ts` using `createProviderInfo` and `createModelInfo`
2. Register in `src/providers/ai-sdk/index.ts`
3. Add authentication handling in `src/providers/auth.ts` if needed
4. For OpenAI-compatible APIs, use `@ai-sdk/openai-compatible` as the base

Provider definitions include model capabilities (vision, tools, streaming), cost per token, and context limits.

## Restoration Notes

This source tree was reconstructed from bundled source maps. Some modules contain fallback implementations or shims where the original code was unrecoverable:

- Native modules replaced with NAPI shims in `shims/`
- MCP server compatibility layers provide degraded responses for Chrome/Computer Use features
- Build-time constants may use fallback values

When making changes:
- Prefer minimal, auditable modifications
- Document workarounds when you add fallbacks
- Test changes by running `bun run dev` and exercising the affected code path

## Git Workflow

Recent commits show active work on multi-provider support (OpenRouter, OpenCode, models.dev integration) and Google Gemini system message handling. Use imperative commit subjects (e.g., `fix: separate system messages for Google provider`).

## File Path Aliases

`tsconfig.json` maps `src/*` to `./src/*` for cleaner imports. You can import from `src/utils/config.js` without relative paths.

## Dependencies

- **Runtime**: Bun 1.3.5+, Node.js 24+
- **Key packages**: `@ai-sdk/*` for providers, `@anthropic-ai/sdk`, `ink` for TUI, `commander` for CLI, `@modelcontextprotocol/sdk` for MCP
- **Package manager**: Bun (see `packageManager` field in `package.json`)
