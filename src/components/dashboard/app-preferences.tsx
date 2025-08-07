'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Palette, 
  DollarSign, 
  Globe, 
  Bell,
  Mail,
  TrendingUp,
  Settings2
} from 'lucide-react'

interface UserPreferences {
  notifications?: boolean
  emailNotifications?: boolean
  budgetAlerts?: boolean
}

interface AppPreferencesProps {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
}

export function AppPreferences({ preferences, updatePreferences }: AppPreferencesProps) {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5 text-primary" />
          Preferencias
        </CardTitle>
        <CardDescription className="text-sm">
          Personaliza tu experiencia en la aplicación
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Apariencia */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Apariencia</h4>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label className="text-sm font-medium">Tema</Label>
              <p className="text-xs text-muted-foreground">
                Cambia entre tema claro y oscuro
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <Separator />

        {/* Configuración Regional */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Configuración Regional</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  Moneda
                </Label>
                <p className="text-xs text-muted-foreground">
                  Moneda principal para mostrar valores
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                COP
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Idioma
                </Label>
                <p className="text-xs text-muted-foreground">
                  Idioma de la interfaz
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Español
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notificaciones */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Notificaciones</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-medium">Notificaciones en la app</Label>
                <p className="text-xs text-muted-foreground">
                  Recibe notificaciones dentro de la aplicación
                </p>
              </div>
              <Switch
                checked={preferences?.notifications !== false}
                onCheckedChange={(checked) => updatePreferences({ notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Notificaciones por email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recibe notificaciones importantes por correo
                </p>
              </div>
              <Switch
                checked={preferences?.emailNotifications !== false}
                onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Alertas de presupuesto
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recibe alertas cuando superes tu presupuesto
                </p>
              </div>
              <Switch
                checked={preferences?.budgetAlerts !== false}
                onCheckedChange={(checked) => updatePreferences({ budgetAlerts: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}