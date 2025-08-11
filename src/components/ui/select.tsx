"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
    value: string
    onValueChange: (value: string) => void
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    disabled?: boolean
    displayValue?: string
    setDisplayValue?: (display: string) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
    const context = React.useContext(SelectContext)
    if (!context) {
        throw new Error("Select components must be used within a Select")
    }
    return context
}

const Select = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value?: string
        onValueChange?: (value: string) => void
        disabled?: boolean
    }
>(({ className, children, value = "", onValueChange = () => { }, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [displayValue, setDisplayValue] = React.useState("")

    const contextValue: SelectContextType = {
        value,
        onValueChange: (newValue: string) => {
            onValueChange(newValue)
            setIsOpen(false)
        },
        isOpen,
        setIsOpen,
        disabled,
        displayValue,
        setDisplayValue
    }

    return (
        <SelectContext.Provider value={contextValue}>
            <div ref={ref} className={cn("relative", className)} {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen, disabled } = useSelectContext()

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & {
        placeholder?: string
    }
>(({ className, placeholder, ...props }, ref) => {
    const { displayValue } = useSelectContext()

    return (
        <span
            ref={ref}
            className={cn("block truncate", className)}
            {...props}
        >
            {displayValue || placeholder}
        </span>
    )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = useSelectContext()

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
            />
            <div
                ref={ref}
                className={cn(
                    "absolute z-50 mt-1 max-h-60 w-full min-w-max overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
                    className
                )}
                style={{
                    left: 0,
                    right: 'auto'
                }}
                {...props}
            >
                {children}
            </div>
        </>
    )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value: string
    }
>(({ className, children, value: itemValue, ...props }, ref) => {
    const { value, onValueChange, setDisplayValue } = useSelectContext()

    // Función auxiliar para extraer texto de elementos React
    const extractTextFromChildren = (
        element: React.ReactElement<{ children?: React.ReactNode }>
    ): string => {
        const children = element.props.children;

        if (typeof children === 'string') {
            return children;
        }

        if (Array.isArray(children)) {
            return children
                .map((child) => {
                    if (typeof child === 'string') return child;

                    if (React.isValidElement(child)) {
                        const childElement = child as React.ReactElement<{ children?: React.ReactNode }>;
                        if (typeof childElement.props.children === 'string') {
                            return childElement.props.children;
                        }
                    }

                    return '';
                })
                .join(' ')
                .trim();
        }

        return '';
    }



    const handleClick = () => {
        onValueChange(itemValue)
        // Extraer el texto del children para mostrarlo
        if (React.isValidElement(children)) {
            const textContent = extractTextFromChildren(children as React.ReactElement<{ children?: React.ReactNode }>)
            setDisplayValue?.(textContent)
        } else if (typeof children === 'string') {
            setDisplayValue?.(children)
        }
    }

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            onClick={handleClick}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {value === itemValue && <Check className="h-4 w-4" />}
            </span>
            {children}
        </div>
    )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }