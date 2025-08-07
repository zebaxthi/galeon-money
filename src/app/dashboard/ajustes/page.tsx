"use client"

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/dashboard/profile-settings'
import { FinancialContextsSettings } from '@/components/dashboard/financial-contexts-settings'
import { AppPreferences } from '@/components/dashboard/app-preferences'
import { AccountSecurity } from '@/components/dashboard/account-security'
import { useSettings } from '@/hooks/useSettings'
import { Loader2, User, Folder, Settings, Shield } from 'lucide-react'

export default function AjustesPage() {
  const { loading, error } = useSettings()
  const [activeTab, setActiveTab] = useState("profile")

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive">Error al cargar la configuración</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header fijo */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 max-w-6xl">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              Gestiona tu perfil, contextos financieros y preferencias de la aplicación
            </p>
          </div>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 max-w-6xl pb-20 md:pb-8">
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs List - Mejorado para móviles */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 mb-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                  <TabsTrigger 
                    value="profile" 
                    className="flex flex-col items-center gap-1 p-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Perfil</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="contexts" 
                    className="flex flex-col items-center gap-1 p-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Folder className="h-4 w-4" />
                    <span className="hidden sm:inline">Contextos</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences" 
                    className="flex flex-col items-center gap-1 p-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Preferencias</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="flex flex-col items-center gap-1 p-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Seguridad</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Contents */}
              <TabsContent value="profile" className="mt-0">
                <div className="max-w-4xl">
                  <ProfileSettings />
                </div>
              </TabsContent>

              <TabsContent value="contexts" className="mt-0">
                <div className="max-w-4xl">
                  <FinancialContextsSettings />
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="mt-0">
                <div className="max-w-4xl">
                  <AppPreferences />
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <div className="max-w-4xl">
                  <AccountSecurity />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}