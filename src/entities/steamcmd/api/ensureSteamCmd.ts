import { invoke } from '@tauri-apps/api/core'

export const ensureSteamCmd = async () => {
  const response = await invoke<string>('ensure_steamcmd')
  return response
}
