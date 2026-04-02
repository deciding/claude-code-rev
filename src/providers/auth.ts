/**
 * Authentication management for providers
 * 
 * Stores credentials securely in ~/.claude/auth.json
 */

import { getClaudeConfigHomeDir } from '../utils/envUtils.js'
import { writeFileSyncAndFlush_DEPRECATED } from '../utils/file.js'
import type { Credential } from './types.js'
import { existsSync, mkdirSync } from 'fs'
import { readFile, writeFile, unlink } from 'fs/promises'
import { join, dirname } from 'path'
import { chmod } from 'fs/promises'

const AUTH_FILE_NAME = 'auth.json'

function getAuthFilePath(): string {
  return join(getClaudeConfigHomeDir(), AUTH_FILE_NAME)
}

async function ensureAuthFile(): Promise<void> {
  const authPath = getAuthFilePath()
  const authDir = dirname(authPath)
  
  if (!existsSync(authDir)) {
    mkdirSync(authDir, { recursive: true })
  }
  
  if (!existsSync(authPath)) {
    await writeFile(authPath, '{}')
    await chmod(authPath, 0o600)
  }
}

async function readAuthFile(): Promise<Record<string, Credential>> {
  const authPath = getAuthFilePath()
  
  if (!existsSync(authPath)) {
    return {}
  }
  
  try {
    const content = await readFile(authPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to read auth file:', error)
    return {}
  }
}

async function writeAuthFile(credentials: Record<string, Credential>): Promise<void> {
  await ensureAuthFile()
  const authPath = getAuthFilePath()
  const content = JSON.stringify(credentials, null, 2)
  
  try {
    await writeFile(authPath, content, { encoding: 'utf-8', mode: 0o600 })
  } catch (error) {
    console.error('Failed to write auth file:', error)
    throw error
  }
}

export namespace Auth {
  export async function get(provider: string): Promise<Credential | null> {
    const credentials = await readAuthFile()
    return credentials[provider] || null
  }

  export async function set(provider: string, credential: Credential): Promise<void> {
    const credentials = await readAuthFile()
    credentials[provider] = credential
    await writeAuthFile(credentials)
  }

  export async function remove(provider: string): Promise<void> {
    const credentials = await readAuthFile()
    if (credentials[provider]) {
      delete credentials[provider]
      await writeAuthFile(credentials)
    }
  }

  export async function all(): Promise<Record<string, Credential>> {
    return readAuthFile()
  }

  export async function has(provider: string): Promise<boolean> {
    const credentials = await readAuthFile()
    return provider in credentials
  }

  export async function clear(): Promise<void> {
    const authPath = getAuthFilePath()
    if (existsSync(authPath)) {
      await unlink(authPath)
    }
  }
}

export function getCredentialType(credential: Credential): string {
  return credential.type
}

export function isApiKeyCredential(credential: Credential): boolean {
  return credential.type === 'api' && typeof credential.key === 'string'
}

export function isOAuthCredential(credential: Credential): boolean {
  return credential.type === 'oauth' && 
         typeof credential.access === 'string'
}

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