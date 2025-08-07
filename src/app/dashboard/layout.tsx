import { Sidebar } from '@/components/dashboard/sidebar'
import { BottomNavigation } from '@/components/dashboard/bottom-navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { FinancialContextProvider } from '@/providers/financial-context-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <FinancialContextProvider>
        <div className="flex h-screen bg-background">
          {/* Desktop Sidebar - Sin ancho fijo, se adapta al estado del sidebar */}
          <div className="hidden md:flex md:flex-col">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <div className="h-full">
                {children}
              </div>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden">
            <BottomNavigation />
          </div>
        </div>
      </FinancialContextProvider>
    </AuthGuard>
  )
}