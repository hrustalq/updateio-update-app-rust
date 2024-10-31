interface SteamCredentials {
  username: string;
  password: string;
}

const STORAGE_KEY = 'steam:credentials';

export function saveSteamCredentials(credentials: SteamCredentials): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Failed to save Steam credentials:', error);
  }
}

export function getSteamCredentials(): SteamCredentials | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get Steam credentials:', error);
    return null;
  }
}

export function clearSteamCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear Steam credentials:', error);
  }
} 