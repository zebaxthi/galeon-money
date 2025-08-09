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
  variant = 'default',
  collapsedWidth = 16,
  expandedWidth = variant === 'improved' ? 64 : 56
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
  const headerTitle = isImproved ? "Galeon Money" : "Galeon"
  const headerSubtitle = isImproved ? "Finanzas Personales" : "Money Manager"
  const iconSize = isImproved ? "h-6 w-6" : "h-5 w-5"
  const avatarSize = isCollapsed ? "h-8 w-8" : (isImproved ? "h-10 w-10" : "h-10 w-10")
  const buttonHeight = isImproved ? "lg" : "sm"

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300 overflow-hidden",
        !isImproved && "relative",
        className
      )}
      style={{
        width: isCollapsed ? `${collapsedWidth * 0.25}rem` : `${expandedWidth * 0.25}rem`
      }}
    >
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center w-full" : "space-x-3"
          )}>
            <div className={cn(
              "bg-violet-600 rounded-lg flex-shrink-0 flex items-center justify-center",
              isImproved ? "p-2" : "w-8 h-8"
            )}>
              <Wallet className={cn("text-white", iconSize)} />
            </div>
            {!isCollapsed && (
              <div className={cn("min-w-0", isImproved && "flex-1")}>
                <h1 className={cn(
                  "font-bold text-foreground truncate",
                  isImproved ? "text-xl" : "text-lg"
                )}>
                  {headerTitle}
                </h1>
                <p className={cn(
                  "text-muted-foreground truncate",
                  isImproved ? "text-sm" : "text-xs"
                )}>
                  {headerSubtitle}
                </p>
              </div>
            )}
          </div>
          
          {/* Collapse Button */}
          {(!isCollapsed || !isImproved) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "h-8 w-8 p-0 hidden lg:flex flex-shrink-0",
                !isImproved && isCollapsed && "absolute top-4 right-2"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        {/* Expand Button for Improved Variant */}
        {isImproved && isCollapsed && (
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

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
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
      <div className="p-4 border-t flex-shrink-0">
        {/* Settings and Theme */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between mb-4">
            <Link href="/ajustes" className="flex-1 mr-2">
              <Button
                variant={pathname === "/ajustes" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full",
                  pathname === "/ajustes" && "bg-violet-600 text-white hover:bg-violet-700",
                  !isImproved && "justify-start"
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
            <Link href="/ajustes">
              <Button
                variant={pathname === "/ajustes" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-center",
                  pathname === "/ajustes" && "bg-violet-600 text-white hover:bg-violet-700",
                  !isImproved ? "px-2" : "px-0"
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
        {isImproved ? (
          <div className="space-y-3">
            {!isCollapsed ? (
              <Button
                variant="ghost"
                className="w-full p-3 h-auto justify-start"
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
              <div className="flex flex-col items-center space-y-2 w-full">
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
        ) : (
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
                <Avatar className={avatarSize}>
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-violet-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
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
        )}
      </div>
    </div>
  )
}