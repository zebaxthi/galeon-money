"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Plus, 
  BarChart3, 
  Target, 
  Download, 
  Settings,
  Folder
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { DashboardNavProps } from '@/lib/types'

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
  {
    title: "Ajustes",
    href: "/ajustes",
    icon: Settings,
  },
]

export function DashboardNav({ isMobile = false }: DashboardNavProps) {
  const pathname = usePathname()

  if (isMobile) {
    return (
      <nav className="flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex flex-col h-auto py-2 px-3",
                  isActive && "bg-violet-600 text-white"
                )}
              >
                <Icon className="h-4 w-4 mb-1" />
                <span className="text-xs">{item.title}</span>
              </Button>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="p-4 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Navegación</h2>
      </div>
      
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive && "bg-violet-600 text-white hover:bg-violet-700"
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}