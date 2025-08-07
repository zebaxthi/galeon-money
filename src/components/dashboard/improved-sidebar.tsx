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
  LogOut,
  Wallet,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { useSettings } from "@/hooks/useSettings"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ImprovedSidebarProps {
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
    title: "Categorías",
    href: "/dashboard/categorias",
    icon: Folder,
  },
  {
    title: "Presupuestos",
    href: "/dashboard/presupuestos",
    icon: Target,
  },
  {
    title: "Estadísticas",
    href: "/dashboard/estadisticas",
    icon: BarChart3,
  },
  {
    title: "Exportar",
    href: "/dashboard/exportar",
    icon: Download,
  },
]

export function ImprovedSidebar({ className }: ImprovedSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { profile } = useSettings()
  const { toast } = useToast()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive"
      })
    }
  }

  const getUserInitials = () => {
    if (profile?.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r transition-all duration-300 overflow-hidden",
      isCollapsed ? "w-16" : "w-80",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center w-full")}>
            <div className="p-2 bg-violet-600 rounded-lg flex-shrink-0">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold truncate">Galeon Money</h1>
                <p className="text-sm text-muted-foreground truncate">Finanzas Personales</p>
              </div>
            )}
          </div>
          {/* Botón de colapsar siempre visible en desktop */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hidden lg:flex flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Botón de expandir cuando está colapsado */}
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hidden lg:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
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
                  className={cn(
                    "w-full h-12 text-left",
                    isActive && "bg-violet-600 text-white hover:bg-violet-700",
                    isCollapsed ? "justify-center px-0" : "justify-start"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Section - Fixed at bottom */}
      <div className="p-4 border-t flex-shrink-0">
        {/* Settings and Theme */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard/ajustes" className="flex-1 mr-2">
              <Button
                variant={pathname === "/dashboard/ajustes" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full",
                  pathname === "/dashboard/ajustes" && "bg-violet-600 text-white hover:bg-violet-700"
                )}
              >
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Ajustes</span>
              </Button>
            </Link>
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <Link href="/dashboard/ajustes">
              <Button
                variant={pathname === "/dashboard/ajustes" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-center px-0",
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

        {/* User Profile */}
        <div className="space-y-3">
          {!isCollapsed ? (
            <Button
              variant="ghost"
              className="w-full p-3 h-auto justify-start"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-violet-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm truncate">
                    {profile?.name || user?.user_metadata?.name || "Usuario"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {userMenuOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </Button>
          ) : (
            <div className="flex flex-col items-center space-y-2 w-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-violet-600 text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
                title="Cerrar Sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* User Menu Expanded */}
          {!isCollapsed && userMenuOpen && (
            <div className="space-y-2 pl-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Cerrar Sesión</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}