import { useContext } from 'react'
import { AuthContext } from '@/providers/auth-provider'
import { User } from '@/entities/user/user.entity'

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context as {
    error: unknown
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    checkAuth: () => Promise<void>
    logout: () => void
  }
} 