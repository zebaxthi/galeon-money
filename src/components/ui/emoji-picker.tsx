"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Smile } from "lucide-react"

import type { EmojiPickerProps } from '@/lib/types'

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  const [customEmoji, setCustomEmoji] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const iconosDisponibles = [
    '🏷️', '🍔', '🚗', '🏠', '💡', '🎮', '👕', '💊', 
    '📚', '🎬', '✈️', '🏋️', '💰', '💼', '🎯', '🛒',
    '🍕', '☕', '🎵', '📱', '💻', '🎨', '🌟', '❤️',
    '🔥', '⚡', '🌈', '🎉', '🎊', '🎁', '🏆', '⭐'
  ]

  const handleCustomEmojiSubmit = () => {
    const trimmedEmoji = customEmoji.trim()
    if (trimmedEmoji) {
      // Tomar el primer carácter/emoji del input
      const firstChar = [...trimmedEmoji][0] // Usar spread para manejar emojis multi-byte correctamente
      onChange(firstChar)
      setCustomEmoji("")
      setShowCustomInput(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomEmojiSubmit()
    }
  }

  return (
    <div className={className}>
      <Label>Icono</Label>
      <div className="space-y-3">
        {/* Emojis predefinidos */}
        <div className="grid grid-cols-8 gap-2">
          {iconosDisponibles.map((icono) => (
            <button
              key={icono}
              type="button"
              className={`w-8 h-8 rounded border-2 flex items-center justify-center text-lg transition-colors ${
                value === icono 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }`}
              onClick={() => onChange(icono)}
            >
              {icono}
            </button>
          ))}
        </div>

        {/* Botón para emoji personalizado */}
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="flex items-center space-x-2"
          >
            <Smile className="h-4 w-4" />
            <span>Emoji personalizado</span>
          </Button>
          
          {/* Mostrar emoji actual si no está en los predefinidos */}
          {value && !iconosDisponibles.includes(value) && (
            <div className="flex items-center space-x-2">
              <span className="text-lg">{value}</span>
              <span className="text-xs text-muted-foreground">(personalizado)</span>
            </div>
          )}
        </div>

        {/* Input para emoji personalizado */}
        {showCustomInput && (
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                <Label htmlFor="custom-emoji" className="text-sm">
                  Ingresa cualquier emoji
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="custom-emoji"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="🎯 Pega aquí cualquier emoji"
                    className="text-center text-lg"
                    maxLength={10} // Aumentar para permitir emojis complejos
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCustomEmojiSubmit}
                    disabled={!customEmoji.trim()}
                  >
                    Usar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Puedes copiar y pegar cualquier emoji. Presiona Enter o haz clic en &quot;Usar&quot; para aplicarlo.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}