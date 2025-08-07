"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Home, 
  Plus, 
  BarChart3, 
  Target, 
  Download, 
  Settings,
  Folder,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { useSettings } from "@/hooks/useSettings"
import { supabase } from "@/lib/supabase"

interface SidebarProps {
  className?: string
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Movimientos",
    href: "/dashboard/movimientos",
    icon: Plus,
  },
  {
    title: "Estadísticas",
    href: "/dashboard/estadisticas",
    icon: BarChart3,
  },
  {
    title: "Presupuestos",
    href: "/dashboard/presupuestos",
    icon: Target,
  },
  {
    title: "Categorías",
    href: "/dashboard/categorias",
    icon: Folder,
  },
  {
    title: "Exportar",
    href: "/dashboard/exportar",
    icon: Download,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { profile } = useSettings()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const getUserInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return profile?.email?.slice(0, 2).toUpperCase() || 'U'
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r transition-all duration-300 overflow-hidden relative",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "space-x-3")}>
            <div className="flex items-center justify-center w-8 h-8 bg-violet-600 rounded-lg flex-shrink-0">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground">Galeon</h1>
                <p className="text-xs text-muted-foreground">Money Manager</p>
              </div>
            )}
          </div>
          
          {/* Botón de colapsar - visible tanto expandido como colapsado */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "h-8 w-8 p-0 hidden lg:flex flex-shrink-0",
              isCollapsed && "absolute top-4 right-2"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full",
                    isActive && "bg-violet-600 text-white hover:bg-violet-700",
                    isCollapsed ? "justify-center px-2" : "justify-start"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-2")} />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard/ajustes" className="flex-1 mr-2">
              <Button
                variant={pathname === "/dashboard/ajustes" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  pathname === "/dashboard/ajustes" && "bg-violet-600 text-white hover:bg-violet-700"
                )}
              >
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Ajustes</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/dashboard/ajustes">
              <Button
                variant={pathname === "/dashboard/ajustes" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-center px-2",
                  pathname === "/dashboard/ajustes" && "bg-violet-600 text-white hover:bg-violet-700"
                )}
                title="Ajustes"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        )}

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            className={cn(
              "w-full h-auto",
              isCollapsed ? "p-2 justify-center" : "p-3 justify-start"
            )}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title={isCollapsed ? (profile?.name || user?.email || 'Usuario') : undefined}
          >
            <div className={cn(
              "flex items-center flex-1 min-w-0",
              isCollapsed ? "justify-center" : "space-x-3"
            )}>
              <div className="relative flex-shrink-0">
                <Avatar className={cn(isCollapsed ? "h-8 w-8" : "h-10 w-10")}>
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-violet-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.name || user?.email || 'Usuario'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </Button>

          {userMenuOpen && (
            <div className={cn(
              "absolute bottom-full mb-2 bg-background border rounded-lg shadow-lg p-2 z-50",
              isCollapsed ? "left-0 w-48" : "left-0 right-0"
            )}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}