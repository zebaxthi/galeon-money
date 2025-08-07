"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Plus, 
  BarChart3, 
  Target,
  Menu
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
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
      <nav className="grid grid-cols-5 gap-0">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href} className="w-full">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col h-auto py-3 px-2 w-full rounded-none",
                  isActive && "text-violet-600 bg-violet-50 dark:bg-violet-950"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1 flex-shrink-0", isActive && "text-violet-600")} />
                <span className="text-xs font-medium truncate leading-tight">{item.title}</span>
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
              className="flex flex-col h-auto py-3 px-2 w-full rounded-none"
            >
              <Menu className="h-5 w-5 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate leading-tight">Más</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-full max-w-xs sm:max-w-sm">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de navegación</SheetTitle>
            </SheetHeader>
            <ImprovedSidebar />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}