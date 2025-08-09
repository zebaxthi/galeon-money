"use client"

import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface BaseFormFieldProps {
  label: string
  id: string
  error?: string
  required?: boolean
  className?: string
  description?: string
}

interface InputFormFieldProps extends BaseFormFieldProps {
  type: 'text' | 'email' | 'password' | 'number' | 'date'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  min?: string | number
  max?: string | number
  step?: string | number
  icon?: ReactNode
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: 'textarea'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  type: 'select'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

interface CustomFormFieldProps extends BaseFormFieldProps {
  type: 'custom'
  children: ReactNode
}

type FormFieldProps = 
  | InputFormFieldProps 
  | TextareaFormFieldProps 
  | SelectFormFieldProps 
  | CustomFormFieldProps

export function FormField(props: FormFieldProps) {
  const { label, id, error, required, className, description } = props

  const renderField = () => {
    switch (props.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'date':
        return (
          <div className="relative">
            {props.icon && (
              <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">
                {props.icon}
              </div>
            )}
            <Input
              id={id}
              type={props.type}
              value={props.value}
              onChange={(e) => props.onChange(e.target.value)}
              placeholder={props.placeholder}
              maxLength={props.maxLength}
              min={props.min}
              max={props.max}
              step={props.step}
              className={cn(
                props.icon && "pl-10",
                error && "border-destructive focus-visible:ring-destructive"
              )}
              required={required}
            />
          </div>
        )

      case 'textarea':
        return (
          <Textarea
            id={id}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            rows={props.rows}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive"
            )}
            required={required}
          />
        )

      case 'select':
        return (
          <Select value={props.value} onValueChange={props.onChange}>
            <SelectTrigger className={cn(
              error && "border-destructive focus-visible:ring-destructive"
            )}>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'custom':
        return props.children

      default:
        return null
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      {renderField()}
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

// Character counter component for inputs with maxLength
interface CharacterCounterProps {
  current: number
  max: number
  className?: string
}

export function CharacterCounter({ current, max, className }: CharacterCounterProps) {
  const percentage = (current / max) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  return (
    <p className={cn(
      "text-xs",
      isAtLimit ? "text-destructive" : isNearLimit ? "text-yellow-600" : "text-muted-foreground",
      className
    )}>
      {current}/{max} caracteres
    </p>
  )
}