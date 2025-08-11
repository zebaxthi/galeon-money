"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/dashboard/profile-settings'
import { FinancialContextsSettings } from '@/components/dashboard/financial-contexts-settings'
import { AppPreferences } from '@/components/dashboard/app-preferences'
import { AccountSecurity } from '@/components/dashboard/account-security'
import { useSettings } from '@/hooks/useSettings'
import { Loader2, User, Folder, Settings, Shield } from 'lucide-react'

export default function AjustesPage() {
  const { 
    profile, 
    preferences, 
    loading, 
    error, 
    updateProfile, 
    updatePreferences, 
    signOut, 
    deleteAccount, 
    clearError 
  } = useSettings()
  const [activeTab, setActiveTab] = useState("profile")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive">Error al cargar la configuración</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Configuración</h1>
        <p className="text-muted-foreground text-xs sm:text-sm lg:text-base truncate mt-1">
          Gestiona tu perfil, contextos financieros y preferencias de la aplicación
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm">
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="contexts" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm">
            <Folder className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Contextos</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Preferencias</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          {profile ? (
            <ProfileSettings 
              profile={profile} 
              updateProfile={updateProfile} 
              clearError={clearError} 
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="contexts" className="mt-6">
          <FinancialContextsSettings />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <AppPreferences 
            preferences={preferences}
            updatePreferences={updatePreferences}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <AccountSecurity 
            signOut={signOut}
            deleteAccount={deleteAccount}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}