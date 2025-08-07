"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Plus, 
  BarChart3, 
  Target, 
  Settings,
  Menu
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ImprovedSidebar } from "./improved-sidebar"

const mainNavItems = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Movimientos",
    href: "/dashboard/movimientos",
    icon: Plus,
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
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden">
      <nav className="flex items-center justify-around py-2 px-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href} className="flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col h-auto py-2 px-1 w-full min-w-0",
                  isActive && "text-violet-600"
                )}
              >
                <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 mb-1 flex-shrink-0", isActive && "text-violet-600")} />
                <span className="text-xs font-medium truncate">{item.title}</span>
              </Button>
            </Link>
          )
        })}
        
        {/* Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col h-auto py-2 px-1 flex-1 min-w-0"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate">Más</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-full max-w-xs sm:max-w-sm">
            <ImprovedSidebar />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}