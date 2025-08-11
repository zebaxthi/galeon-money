"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePWA } from "@/hooks/usePWA"
import { Download, X, Smartphone } from "lucide-react"

export function InstallPrompt() {
  const { isInstallable, installApp } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || dismissed) return null

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setDismissed(true)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-violet-200 dark:border-violet-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-sm">Instalar App</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Instala Stonk$ en tu dispositivo para un acceso más rápido
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={handleInstall}
          className="w-full bg-violet-600 hover:bg-violet-700"
          size="sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Instalar Ahora
        </Button>
      </CardContent>
    </Card>
  )
}