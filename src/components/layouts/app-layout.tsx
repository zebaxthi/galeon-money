import { Sidebar } from '@/components/dashboard/sidebar'
import { BottomNavigation } from '@/components/dashboard/bottom-navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { FinancialContextProvider } from '@/providers/financial-context-provider'

import type { AppLayoutProps } from '@/lib/types'

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <FinancialContextProvider>
        <div className="flex h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex md:flex-col border-r border-border">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 overflow-y-auto overscroll-contain">
              <div className="min-h-full p-4 pb-20 md:pb-4">
                <div className="max-w-full">
                  {children}
                </div>
              </div>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <BottomNavigation />
          </div>
        </div>
      </FinancialContextProvider>
    </AuthGuard>
  )
}