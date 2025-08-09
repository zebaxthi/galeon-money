import { BaseSidebar } from './base-sidebar'
import type { ImprovedSidebarProps } from '@/lib/types'

export function ImprovedSidebar({ className }: ImprovedSidebarProps) {
  return (
    <BaseSidebar 
      className={className} 
      variant="improved"
      collapsedWidth={16}
      expandedWidth={64}
    />
  )
}