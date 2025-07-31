"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import type { UserData } from "@/lib/types"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Redirigiendo...
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user as unknown as UserData} />
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 border-r bg-muted/10">
          <DashboardNav />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:pl-0">
          <main className="container mx-auto px-4 py-6 pb-20 lg:pb-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
        <DashboardNav isMobile />
      </div>
    </div>
  )
}