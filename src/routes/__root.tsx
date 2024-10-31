import { createRootRoute, Navigate, Outlet, useNavigate } from '@tanstack/react-router'
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel
} from "../components/ui/sidebar"
import { 
  Settings, 
  Gamepad, 
  AppWindow, 
  ScrollText, 
  Bell, 
  RefreshCw, 
  LoaderCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import { isResponseError } from '@/api/types'
import { UpdateQueueBell } from '@/components/update-queue-bell'

function App() {
  const { isLoading, isAuthenticated, error } = useAuth()
  const navigate = useNavigate()

  // Handle auth-related navigation
  useEffect(() => {
    if (!isResponseError(error)) return
    if (error.statusCode === 401) {
      navigate({ to: '/login' })
    }
  }, [error, navigate])

  useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/login') {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, navigate])

  // Показываем лоадер пока проверяем авторизацию
  if (isLoading) {
    return <div className='flex justify-center items-center h-screen w-screen absolute top-0 left-0 z-50'>
      <LoaderCircle className='animate-spin text-primary size-12' />
    </div>
  }
  // Если не авторизован и это не страница логина, редиректим
  if (!isAuthenticated && window.location.pathname !== '/login') {
    return <Navigate to="/login" />
  }

  // Если это страница логина, показываем только контент без сайдбара
  if (window.location.pathname === '/login') {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <span className="text-xl font-bold">UpdateIO</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Основное</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Игры">
                  <a href="/#games">
                    <Gamepad />
                    <span>Игры</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Приложения">
                  <a href="/#apps">
                    <AppWindow />
                    <span>Приложения</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Патч-ноты">
                  <a href="/#patch-notes">
                    <ScrollText />
                    <span>Патч-ноты</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Управление</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Подписки">
                  <a href="/#subscriptions">
                    <Bell />
                    <span>Подписки</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Обновления">
                  <a href="/#updates">
                    <RefreshCw />
                    <span>Обновления</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Настройки">
                  <a href="/#settings">
                    <Settings />
                    <span>Настройки</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <span className="text-xs text-muted-foreground">UpdateIO v1.0.0</span>
        </SidebarFooter>
      </Sidebar>
      <main className="container p-0 h-screen overflow-hidden relative">
        <header className="py-2 sticky top-0 inset-x-0 z-20 w-full h-14 border-b overflow-hidden bg-background">
          <div className="flex items-center justify-end gap-2 px-4">
            <UpdateQueueBell />
          </div>
        </header>
        <div>
          <Outlet />
        </div>
      </main>
      <Breadcrumbs />
    </SidebarProvider>
  )
}

export const Route = createRootRoute({
  component: App,
})
