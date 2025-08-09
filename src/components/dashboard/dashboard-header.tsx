"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wallet, LogOut, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { DashboardHeaderProps } from "@/lib/types"

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Wallet className="h-8 w-8 text-violet-600" />
          <span className="text-xl font-bold">Galeon Money</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user?.user_metadata?.name || user?.email}</span>
          </div>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  )
}