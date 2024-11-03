import { createRootRouteWithContext, Outlet, useNavigate } from '@tanstack/react-router'
import { 
  LoaderCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'
import { isResponseError } from '@/api/types'
import { RouteContext } from '@/lib/types'
import Breadcrumbs from '@/components/breadcrumbs'

function App() {
  const { isLoading, isAuthenticated, error } = useAuth()
  const navigate = useNavigate()

  // Handle auth-related navigation
  useEffect(() => {
    if (!isResponseError(error)) return
    if (error.statusCode === 401 && window.location.pathname !== '/auth/login') {
      navigate({ to: '/auth/login' })
    }
  }, [error, navigate])

  useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== '/auth/login') {
      navigate({ to: '/auth/login' })
    }
  }, [isAuthenticated, navigate])

  // Показываем лоадер пока проверяем авторизацию
  if (isLoading) {
    return <div className='flex justify-center items-center h-screen w-screen absolute top-0 left-0 z-50'>
      <LoaderCircle className='animate-spin text-primary size-12' />
    </div>
  }

  return (
    <div className='flex flex-col relative'>
      <Outlet />
      <Breadcrumbs />
    </div>
  )
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: App,
})
