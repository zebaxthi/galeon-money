import { BaseSidebar } from './base-sidebar'
import type { SidebarProps } from '@/lib/types'

export function Sidebar({ className }: SidebarProps) {
  return (
    <BaseSidebar 
      className={className} 
      variant="default"
      collapsedWidth={16}
      expandedWidth={56}
    />
  )
}