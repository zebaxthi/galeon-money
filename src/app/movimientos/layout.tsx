import { AppLayout } from '@/components/layouts/app-layout'

export default function MovimientosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}