import createFetchClient from 'openapi-fetch'
import type { paths } from './v1'
import { fetch } from '@tauri-apps/plugin-http'
import refresh from '@/entities/auth/api/refresh'

// List of endpoints that should bypass refresh token logic
const PUBLIC_ENDPOINTS = [
  '/auth/qr-code/generate',
  '/auth/qr-code/login',
  '/auth/refresh'
]

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

// Custom fetch implementation that handles token refresh
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' 
    ? input 
    : input instanceof URL 
      ? input.toString()
      : input.url
  
  try {
    const response = await fetch(input, init)
    
    if (response.status !== 401) {
      return response
    }

    if (isPublicEndpoint(url)) {
      throw new Error(await response.text())
    }

    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
        return fetch(input, init)
      } catch (err) {
        throw err
      }
    }

    isRefreshing = true

    try {
      await refresh()
      processQueue(null, 'refreshed')
      return fetch(input, init)
    } catch (refreshError) {
      processQueue(refreshError, null)
      failedQueue = []
      throw refreshError
    } finally {
      isRefreshing = false
    }
  } catch (error) {
    throw error
  }
}

// Create API client with custom fetch implementation
const fetchClient = createFetchClient<paths>({
  baseUrl: `${import.meta.env.VITE_API_URL}`,
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  },
  fetch: customFetch
})

export default fetchClient
