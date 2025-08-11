"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BaseSidebar } from "./base-sidebar"
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
          className={cn(
            "lg:hidden fixed top-4 left-4 z-40",
            "bg-background/80 backdrop-blur-sm border border-border/50",
            "hover:bg-background/90 transition-all duration-200",
            "rounded-xl shadow-lg",
            className
          )}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="p-0 w-80 max-w-[85vw] border-0 bg-transparent flex items-center justify-center"
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <BaseSidebar 
            variant="improved"
            className="w-full max-w-sm"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}