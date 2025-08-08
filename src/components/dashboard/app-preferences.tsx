'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useNotifications } from '@/hooks/useNotifications'
import { 
  Palette, 
  DollarSign, 
  Globe, 
  Bell,
  Mail,
  TrendingUp,
  Settings2,
  Smartphone,
  CheckCircle,
  XCircle,
  Loader2
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
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    requestPermission,
    subscribe,
    unsubscribe
  } = useNotifications()
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
            {/* Notificaciones Push */}
            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Smartphone className="h-3 w-3" />
                    Notificaciones Push
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Recibe notificaciones incluso cuando la app esté cerrada
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {pushSupported ? (
                    <>
                      {pushPermission === 'granted' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : pushPermission === 'denied' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Bell className="h-4 w-4 text-yellow-500" />
                      )}
                      <Badge variant={pushPermission === 'granted' ? 'default' : 'secondary'} className="text-xs">
                        {pushPermission === 'granted' ? 'Permitido' : 
                         pushPermission === 'denied' ? 'Denegado' : 'Pendiente'}
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="secondary" className="text-xs">No soportado</Badge>
                  )}
                </div>
              </div>
              
              {pushSupported && (
                <div className="flex gap-2">
                  {pushPermission !== 'granted' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={requestPermission}
                      disabled={pushLoading}
                      className="text-xs"
                    >
                      {pushLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Permitir Notificaciones
                    </Button>
                  ) : (
                    <>
                      {!pushSubscribed ? (
                        <Button
                          size="sm"
                          onClick={subscribe}
                          disabled={pushLoading}
                          className="text-xs"
                        >
                          {pushLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          Activar Push
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={unsubscribe}
                          disabled={pushLoading}
                          className="text-xs"
                        >
                          {pushLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          Desactivar Push
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Notificaciones en la app */}
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

            {/* Notificaciones por email */}
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

            {/* Alertas de presupuesto */}
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