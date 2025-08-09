"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ImprovedSidebar } from "./improved-sidebar"
import { Menu } from "lucide-react"

import type { MobileSidebarProps } from '@/lib/types'

export function MobileSidebar({ className }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("lg:hidden fixed top-4 left-4 z-50", className)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <ImprovedSidebar />
      </SheetContent>
    </Sheet>
  )
}