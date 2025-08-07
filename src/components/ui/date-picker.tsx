"use client"

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  disabled
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    value ? new Date(value) : null
  )
  const [currentMonth, setCurrentMonth] = React.useState(
    selectedDate || new Date()
  )

  // Sincronizar el estado interno con el prop value
  React.useEffect(() => {
    if (value) {
      const newDate = new Date(value)
      setSelectedDate(newDate)
      setCurrentMonth(newDate)
    } else {
      setSelectedDate(null)
    }
  }, [value])

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ""
    return date.toISOString().split('T')[0]
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const formattedDate = formatDateForInput(date)
    onChange?.(formattedDate)
    setOpen(false)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const days = getDaysInMonth(currentMonth)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0 pointer-events-none z-10" />
          <Input
            className={cn("pl-10 cursor-pointer", className)}
            value={formatDate(selectedDate)}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="w-[320px] sm:w-auto p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Seleccionar fecha</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-10 w-10 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-base">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-10 w-10 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-10 w-10 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-10 w-10" />
              }

              const isSelected = selectedDate && 
                day.getDate() === selectedDate.getDate() &&
                day.getMonth() === selectedDate.getMonth() &&
                day.getFullYear() === selectedDate.getFullYear()

              const isToday = 
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear()

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-10 w-10 p-0 font-normal text-sm",
                    isToday && !isSelected && "bg-accent text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleDateSelect(day)}
                >
                  {day.getDate()}
                </Button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}