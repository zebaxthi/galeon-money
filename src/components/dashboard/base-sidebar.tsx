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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { useSettings } from "@/hooks/useSettings"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export interface BaseSidebarProps {
  className?: string
  variant?: 'default' | 'improved'
  collapsedWidth?: number
  expandedWidth?: number
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Movimientos",
    href: "/movimientos",
    icon: Plus,
  },
  {
    title: "Categorías",
    href: "/categorias",
    icon: Folder,
  },
  {
    title: "Presupuestos",
    href: "/presupuestos",
    icon: Target,
  },
  {
    title: "Estadísticas",
    href: "/estadisticas",
    icon: BarChart3,
  },
  {
    title: "Exportar",
    href: "/exportar",
    icon: Download,
  },
]

export function BaseSidebar({ 
  className, 
  variant = 'default'
}: BaseSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { profile } = useSettings()
  const { toast } = useToast()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch {
      if (variant === 'improved') {
        toast({
          title: "Error",
          description: "No se pudo cerrar la sesión",
          variant: "destructive"
        })
      }
    }
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
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const isImproved = variant === 'improved'
  const headerTitle = isImproved ? "Stonk$" : "Stonk$"
  const headerSubtitle = isImproved ? "Finanzas Personales" : "Money Manager"
  const avatarSize = isCollapsed ? "h-8 w-8" : (isImproved ? "h-10 w-10" : "h-10 w-10")
  const buttonHeight = isImproved ? "lg" : "sm"

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-background/80 backdrop-blur-sm transition-all duration-300 overflow-hidden",
        "relative",
        "max-w-full", // Prevent overflow on mobile
        // Dynamic width classes based on state
        isCollapsed ? "w-16" : (isImproved ? "w-64" : "w-56"),
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center min-w-0",
            isCollapsed ? "justify-center w-full" : "space-x-3"
          )}>
            <div className="bg-violet-600 rounded-lg p-2 flex-shrink-0">
              <Wallet className="text-white h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-foreground truncate text-lg">
                  {headerTitle}
                </h1>
                <p className="text-muted-foreground truncate text-sm">
                  {headerSubtitle}
                </p>
              </div>
            )}
          </div>
          
          {/* Collapse Button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hidden lg:flex flex-shrink-0 hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Expand Button for Collapsed State */}
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hidden lg:flex hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size={buttonHeight}
                  className={cn(
                    "w-full",
                    isActive && "bg-violet-600 text-white hover:bg-violet-700",
                    isCollapsed ? "justify-center px-0" : "justify-start",
                    isImproved && "text-left"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn(
                    "flex-shrink-0",
                    isImproved ? "h-5 w-5" : "h-4 w-4",
                    !isCollapsed && (isImproved ? "mr-3" : "mr-2")
                  )} />
                  {!isCollapsed && (
                    <span className={cn(
                      "truncate",
                      isImproved && "font-medium"
                    )}>
                      {item.title}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t flex-shrink-0">
        {/* Settings and Theme */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between mb-2">
            <Link href="/ajustes" className="flex-1 mr-2">
              <Button
                variant={pathname === "/ajustes" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  pathname === "/ajustes" && "bg-violet-600 text-white hover:bg-violet-700"
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
          <div className="space-y-2 mb-2">
            <Link href="/ajustes">
              <Button
                variant={pathname === "/ajustes" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-center px-0",
                  pathname === "/ajustes" && "bg-violet-600 text-white hover:bg-violet-700"
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

        {/* User Section */}
        <div className="space-y-2">
          {!isCollapsed ? (
            <Button
              variant="ghost"
              className="w-full p-2 h-auto justify-start"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className={avatarSize}>
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-violet-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
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
            <div className="flex flex-col items-center space-y-2">
              <Avatar className={avatarSize}>
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

          {!isCollapsed && userMenuOpen && (
            <div className="pl-2">
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