import type { LocalJSXCommandCall } from '../../types/command.js'
import * as React from 'react'
import { Text, Box } from '../../ink.js'
import { Auth } from '../../providers/auth.js'
import { ModelsDev } from '../../providers/models-dev.js'
import { getClaudeConfigHomeDir } from '../../utils/envUtils.js'
import { ProviderRegistry } from '../../providers/registry.js'
import { OPENAI_PROVIDER } from '../../providers/ai-sdk/openai.js'
import { GOOGLE_PROVIDER } from '../../providers/ai-sdk/google.js'
import { ANTHROPIC_PROVIDER } from '../../providers/ai-sdk/anthropic.js'
import os from 'os'
import path from 'path'

// Register bundled providers
try {
  ProviderRegistry.register(OPENAI_PROVIDER as any)
  ProviderRegistry.register(GOOGLE_PROVIDER as any)
  ProviderRegistry.register(ANTHROPIC_PROVIDER as any)
} catch (error) {
  console.error('Failed to register providers:', error)
}

async function handleConnect(
  providerArg?: string,
): Promise<React.ReactNode> {
  try {
    // Initialize models from models.dev
    try {
      await ModelsDev.get()
    } catch (modelError) {
      console.error('Failed to load models.dev data:', modelError)
      // Continue without models.dev data - we'll just show registered providers
    }
    
    const creds = await Auth.all().catch(() => ({}))
    const homedir = os.homedir()
    const authPath = path.join(getClaudeConfigHomeDir(), 'auth.json')
    const displayPath = authPath.startsWith(homedir) 
      ? authPath.replace(homedir, '~') 
      : authPath

    const availableProviders = ProviderRegistry.getAll()
    const connectedCount = Object.keys(creds).length

    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold>AI Provider Management</Text>
        <Text dimColor>  Credentials: {displayPath}</Text>
        <Text> </Text>
        
        {connectedCount === 0 && (
          <Box flexDirection="column">
            <Text color="yellow">No providers connected.</Text>
            <Text dimColor>  Set environment variables or use /connect interactively:</Text>
            <Text dimColor>  </Text>
            <Text dimColor>  Environment variables:</Text>
            <Text dimColor>    ANTHROPIC_API_KEY=sk-ant-...</Text>
            <Text dimColor>    OPENAI_API_KEY=sk-...</Text>
            <Text dimColor>    GOOGLE_API_KEY=...</Text>
            <Text dimColor>  </Text>
            <Text dimColor>  Interactive connection (coming soon):</Text>
            <Text dimColor>    /connect openai</Text>
            <Text dimColor>    /connect google</Text>
          </Box>
        )}

        {connectedCount > 0 && (
          <Box flexDirection="column">
            <Text bold>Connected Providers ({connectedCount}):</Text>
            {Object.entries(creds).map(([id, cred]) => {
              const provider = ProviderRegistry.get(id)
              const name = provider?.name || id
              return (
                <Box key={id}>
                  <Text>  • {name}</Text>
                  {cred.type === 'api' && <Text dimColor> (API key)</Text>}
                  {cred.type === 'oauth' && <Text dimColor> (OAuth)</Text>}
                </Box>
              )
            })}
            <Text> </Text>
          </Box>
        )}

        <Text bold>Available Providers:</Text>
        {availableProviders.slice(0, 10).map(provider => {
          const hasAuth = creds[provider.id]
          const hasEnv = provider.env.some(envVar => process.env[envVar])
          const available = hasAuth || hasEnv
          
          return (
            <Box key={provider.id}>
              <Text>  • {provider.name}</Text>
              {!available && <Text dimColor> (not configured)</Text>}
              {hasAuth && <Text color="green"> ✓</Text>}
              {!hasAuth && hasEnv && <Text color="yellow"> (env)</Text>}
            </Box>
          )
        })}
        
        <Text> </Text>
        <Text dimColor>To connect a provider interactively:</Text>
        <Text dimColor>  /connect [provider-name]</Text>
        <Text dimColor>  Example: /connect openai</Text>
      </Box>
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Auth command error:', errorMessage)
    if (errorStack) {
      console.error('Stack:', errorStack)
    }
    
    return (
      <Box flexDirection="column">
        <Text color="red">Error loading providers: {errorMessage}</Text>
        <Text dimColor>Please check your configuration and try again.</Text>
      </Box>
    )
  }
}

export const call: LocalJSXCommandCall = async (onDone, context, args) => {
  const providerArg = args?.trim() || undefined
  const result = await handleConnect(providerArg)
  onDone('Provider information displayed', { display: 'system' })
  return result
}