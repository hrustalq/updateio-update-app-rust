import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import {
  Settings,
  Gamepad,
  ScrollText,
  Bell,
  RefreshCw,
  Home,
} from 'lucide-react'
import { UpdateQueueBell } from '@/components/update-queue-bell'
import { RouteContext } from '@/lib/types'

function Layout() {
  const matches = useRouterState({ select: (s) => s.matches })

  const matchWithTitle = [...matches]
    .reverse()
    .find((d) => (d.context as RouteContext)?.header || 'Главная')

  const title = matchWithTitle?.context.header || 'Главная'

  return (
    <>
      <header className="py-2 fixed top-0 inset-x-0 z-20 w-full h-12 border-b overflow-hidden bg-background">
        <div className="flex items-center justify-end gap-2 px-4 py-2">
          <UpdateQueueBell />
        </div>
      </header>
      <SidebarProvider className='min-h-[calc(100dvh-5rem)] py-10'>
        <Sidebar className="fixed top-0 left-0 z-20 w-64 h-full border-r overflow-hidden bg-background">
          <SidebarHeader>
            <span className="text-xl font-bold">UpdateIO</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
            <SidebarGroupLabel>Основное</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Игры">
                  <Link to="/">
                    <Home />
                    <span>Главная</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Приложения">
                  <Link to="/games">
                    <Gamepad />
                    <span>Игры</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Патч-ноты">
                  <Link to="/patch-notes">
                    <ScrollText />
                    <span>Новости</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Управление</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Подписки">
                  <Link to="/subscriptions">
                    <Bell />
                    <span>Подписки</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Обновления">
                  <Link to="/updates">
                    <RefreshCw />
                    <span>Обновления</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Настройки">
                  <Link to="/settings">
                    <Settings />
                    <span>Настройки</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <span className="text-xs text-muted-foreground">UpdateIO v1.0.0</span>
        </SidebarFooter>
        </Sidebar>
        <main className="flex flex-col w-full p-4">
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  )
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
})
