import React, { createContext, useCallback, useMemo } from 'react'
import { User } from '@/entities/user/user.entity'
import { getCurrentUser } from '@/entities/user/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  checkAuth: () => Promise<void>
  logout: () => void
  error: unknown
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
  })

  const checkAuth = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['currentUser'] })
  }, [queryClient])

  const logout = useCallback(() => {
    queryClient.setQueryData(['currentUser'], null)
  }, [queryClient])

  const value: AuthContextType = useMemo(() => ({
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    checkAuth,
    logout,
    error
  }), [user, isLoading, error])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 