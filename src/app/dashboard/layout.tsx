import { AppLayout } from '@/components/layouts/app-layout'
import { LazyPageWrapper } from '@/components/layouts/lazy-page-wrapper'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout>
      <LazyPageWrapper>
        {children}
      </LazyPageWrapper>
    </AppLayout>
  )
}