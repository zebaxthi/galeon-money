"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Plus, 
  Target,
  Menu,
  Folder
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { ImprovedSidebar } from "./improved-sidebar"

const mainNavItems = [
  {
    title: "Movimientos",
    href: "/movimientos",
    icon: Plus,
  },
  {
    title: "Presupuestos",
    href: "/presupuestos",
    icon: Target,
  },
  {
    title: "Inicio",
    href: "/dashboard",
    icon: Home,
    isCenter: true,
  },
  {
    title: "Categorías",
    href: "/categorias",
    icon: Folder,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Gradient overlay for better visual separation */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
      
      <div className="relative bg-background/80 backdrop-blur-md border-t border-border/50">
        <div className="safe-area-inset-bottom">
          <nav className="flex items-center justify-center px-4 py-3">
            <div className="flex items-center justify-between w-full max-w-md mx-auto">
              {mainNavItems.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const isCenter = 'isCenter' in item && item.isCenter
                
                return (
                  <Link key={item.href} href={item.href} className={cn(
                    "relative",
                    isCenter && "mx-2"
                  )}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex flex-col items-center justify-center h-auto transition-all duration-300 ease-out",
                        "hover:scale-105 active:scale-95",
                        isCenter ? (
                          "w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg hover:shadow-xl"
                        ) : (
                          "w-12 h-12 rounded-xl px-2 py-1.5"
                        ),
                        isActive && !isCenter && "bg-violet-50 text-violet-600 dark:bg-violet-950/50",
                        !isActive && !isCenter && "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && !isCenter && (
                        <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-violet-600 rounded-full" />
                      )}
                      
                      <Icon className={cn(
                        "flex-shrink-0 transition-all duration-200", 
                        isCenter ? "h-6 w-6" : "h-5 w-5 mb-0.5",
                        isActive && !isCenter && "text-violet-600",
                        isCenter && "text-white drop-shadow-sm"
                      )} />
                      
                      {!isCenter && (
                        <span className={cn(
                          "text-[10px] font-medium leading-tight transition-all duration-200",
                          isActive && "text-violet-600 font-semibold"
                        )}>
                          {item.title}
                        </span>
                      )}
                      
                      {/* Center button label */}
                      {isCenter && (
                        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] font-semibold text-violet-600 whitespace-nowrap">
                          {item.title}
                        </span>
                      )}
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
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Menu className="h-5 w-5 mb-0.5 flex-shrink-0" />
                    <span className="text-[10px] font-medium leading-tight">Más</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-full max-w-xs sm:max-w-sm z-60">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menú de navegación</SheetTitle>
                  </SheetHeader>
                  <ImprovedSidebar />
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}