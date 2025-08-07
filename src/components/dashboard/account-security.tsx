'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Shield, 
  LogOut, 
  Trash2,
  Loader2,
  AlertTriangle,
  Key,
  Lock
} from 'lucide-react'

interface AccountSecurityProps {
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

export function AccountSecurity({ signOut, deleteAccount }: AccountSecurityProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // Manejar cierre de sesión
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      })
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  // Manejar eliminación de cuenta
  const handleDeleteAccount = async () => {
    const confirmMessage = '¿Estás seguro de que quieres eliminar tu cuenta?\n\nEsta acción:\n• Eliminará todos tus datos permanentemente\n• No se puede deshacer\n• Perderás acceso a todos tus contextos financieros\n\nEscribe "ELIMINAR" para confirmar:'
    
    const confirmation = prompt(confirmMessage)
    if (confirmation !== 'ELIMINAR') {
      if (confirmation !== null) {
        toast({
          title: "Cancelado",
          description: "Debes escribir 'ELIMINAR' para confirmar",
          variant: "destructive"
        })
      }
      return
    }
    
    try {
      setIsDeletingAccount(true)
      await deleteAccount()
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente"
      })
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Seguridad
        </CardTitle>
        <CardDescription className="text-sm">
          Gestiona la seguridad y privacidad de tu cuenta
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estado de seguridad */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Estado de Seguridad</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Autenticación</span>
              <Badge variant="default" className="text-xs">
                Activa
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sesión segura</span>
              <Badge variant="default" className="text-xs">
                Verificada
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Gestión de sesión */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Gestión de Sesión</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium">Cerrar sesión</h5>
              <p className="text-xs text-muted-foreground mb-3">
                Cierra tu sesión en este dispositivo de forma segura
              </p>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full"
              >
                {isSigningOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Zona de peligro */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h4 className="font-medium text-sm text-destructive">Zona de Peligro</h4>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <h5 className="text-sm font-medium text-destructive mb-1">Eliminar cuenta</h5>
              <p className="text-xs text-muted-foreground mb-3">
                Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. 
                No podrás recuperar esta información.
              </p>
              <ul className="text-xs text-muted-foreground mb-3 space-y-1">
                <li>• Se eliminarán todos tus contextos financieros</li>
                <li>• Se perderán todos los movimientos y presupuestos</li>
                <li>• Los miembros de tus contextos perderán acceso</li>
                <li>• Esta acción no se puede deshacer</li>
              </ul>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="w-full"
                size="sm"
              >
                {isDeletingAccount ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {isDeletingAccount ? 'Eliminando cuenta...' : 'Eliminar Cuenta Permanentemente'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}