import { invoke } from '@tauri-apps/api/core'
import { getSteamCredentials } from '@/entities/steam/storage'

export async function updateGame(appId: number): Promise<string> {
  const credentials = getSteamCredentials();
  
  if (!credentials) {
    // Если нет сохраненных данных, используем анонимный вход
    return invoke('update_game', { appId })
  }

  // Если есть сохраненные данные, используем их
  return invoke('update_game_authenticated', { 
    appId,
    credentials 
  })
} 