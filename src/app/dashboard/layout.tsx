"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { ImprovedSidebar } from "@/components/dashboard/improved-sidebar"
import { BottomNavigation } from "@/components/dashboard/bottom-navigation"

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
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Desktop Sidebar - Fixed */}
        <div className="fixed left-0 top-0 h-screen w-80 flex-shrink-0 z-30">
          <ImprovedSidebar />
        </div>
        
        {/* Main Content - With left margin for sidebar */}
        <div className="flex-1 ml-80">
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen">
        {/* Main Content - With bottom padding for navigation */}
        <main className="pb-20 p-4 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  )
}