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
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 max-w-6xl">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              Gestiona tu perfil, contextos financieros y preferencias de la aplicación
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tabs List - Responsivo */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 md:mb-8 h-auto">
              <TabsTrigger 
                value="profile" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm"
              >
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden md:inline">Perfil de Usuario</span>
                <span className="xs:hidden sm:inline md:hidden">Perfil</span>
                <span className="xs:hidden">👤</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contexts" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm"
              >
                <Folder className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden md:inline">Contextos Financieros</span>
                <span className="xs:hidden sm:inline md:hidden">Contextos</span>
                <span className="xs:hidden">📁</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden md:inline">Preferencias</span>
                <span className="xs:hidden sm:inline md:hidden">Prefs</span>
                <span className="xs:hidden">⚙️</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm"
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline">Seguridad</span>
                <span className="xs:hidden">🛡️</span>
              </TabsTrigger>
            </TabsList>

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
  )
}