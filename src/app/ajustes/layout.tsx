import { AppLayout } from '@/components/layouts/app-layout'

export default function AjustesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}

