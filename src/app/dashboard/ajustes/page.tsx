"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase } from "@/lib/supabase"
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  DollarSign,
  Save,
  LogOut,
  Trash2,
  Users,
  Plus,
  UserPlus,
  Crown,
  X
} from "lucide-react"

interface ContextMember {
  id: string
  email: string
  name: string
  role: 'owner' | 'member'
  joined_at: string
}

interface FinancialContext {
  id: string
  name: string
  description: string
  created_at: string
}

export default function AjustesPage() {
  const [user, setUser] = useState<any>(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [moneda, setMoneda] = useState('USD')
  const [idioma, setIdioma] = useState('es')
  const [notificaciones, setNotificaciones] = useState(true)
  const [notificacionesEmail, setNotificacionesEmail] = useState(false)
  const [notificacionesPresupuesto, setNotificacionesPresupuesto] = useState(true)
  
  // Estados para contexto financiero
  const [currentContext, setCurrentContext] = useState<FinancialContext | null>(null)
  const [contextMembers, setContextMembers] = useState<ContextMember[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [contextName, setContextName] = useState('')
  const [contextDescription, setContextDescription] = useState('')
  const [isLoadingContext, setIsLoadingContext] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setNombre(user.user_metadata?.name || '')
        setEmail(user.email || '')
        loadFinancialContext()
      }
    }
    getUser()
  }, [])

  const loadFinancialContext = async () => {
    try {
      // Cargar contexto financiero actual (mock data por ahora)
      const mockContext = {
        id: '1',
        name: 'Finanzas Familiares',
        description: 'Contexto financiero compartido',
        created_at: new Date().toISOString()
      }
      
      const mockMembers = [
        {
          id: '1',
          email: 'usuario@ejemplo.com',
          name: 'Usuario Principal',
          role: 'owner' as const,
          joined_at: new Date().toISOString()
        },
        {
          id: '2',
          email: 'pareja@ejemplo.com',
          name: 'Pareja',
          role: 'member' as const,
          joined_at: new Date().toISOString()
        }
      ]
      
      setCurrentContext(mockContext)
      setContextMembers(mockMembers)
      setContextName(mockContext.name)
      setContextDescription(mockContext.description)
    } catch (error) {
      console.error('Error loading financial context:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: nombre }
      })
      if (error) throw error
      alert('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error al actualizar el perfil')
    }
  }

  const handleUpdateContext = async () => {
    setIsLoadingContext(true)
    try {
      // TODO: Implementar actualización real del contexto
      alert('Contexto actualizado correctamente')
    } catch (error) {
      console.error('Error updating context:', error)
      alert('Error al actualizar el contexto')
    } finally {
      setIsLoadingContext(false)
    }
  }

  const handleInviteMember = async () => {
    if (!newMemberEmail.trim()) return
    
    setIsLoadingContext(true)
    try {
      // TODO: Implementar invitación real
      const newMember = {
        id: Date.now().toString(),
        email: newMemberEmail,
        name: newMemberEmail.split('@')[0],
        role: 'member' as const,
        joined_at: new Date().toISOString()
      }
      
      setContextMembers([...contextMembers, newMember])
      setNewMemberEmail('')
      alert('Invitación enviada correctamente')
    } catch (error) {
      console.error('Error inviting member:', error)
      alert('Error al enviar la invitación')
    } finally {
      setIsLoadingContext(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover a este miembro?')) return
    
    try {
      // TODO: Implementar remoción real
      setContextMembers(contextMembers.filter(m => m.id !== memberId))
      alert('Miembro removido correctamente')
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Error al remover el miembro')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleDeleteAccount = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // TODO: Implementar eliminación de cuenta
      alert('Funcionalidad de eliminación de cuenta en desarrollo')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground">
          Configura tu cuenta y preferencias de la aplicación
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Perfil de Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
            <CardDescription>
              Actualiza tu información personal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar por motivos de seguridad
              </p>
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        {/* Contexto Financiero Compartido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Contexto Financiero
            </CardTitle>
            <CardDescription>
              Gestiona las finanzas compartidas con otras personas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contextName">Nombre del contexto</Label>
              <Input
                id="contextName"
                value={contextName}
                onChange={(e) => setContextName(e.target.value)}
                placeholder="Ej: Finanzas Familiares"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contextDescription">Descripción</Label>
              <Input
                id="contextDescription"
                value={contextDescription}
                onChange={(e) => setContextDescription(e.target.value)}
                placeholder="Descripción opcional"
              />
            </div>

            <Button 
              onClick={handleUpdateContext} 
              disabled={isLoadingContext}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoadingContext ? 'Guardando...' : 'Actualizar Contexto'}
            </Button>
          </CardContent>
        </Card>

        {/* Miembros del Contexto */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Miembros del Contexto
            </CardTitle>
            <CardDescription>
              Invita a otras personas para que puedan gestionar las finanzas contigo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Agregar nuevo miembro */}
            <div className="flex gap-2">
              <Input
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Email del nuevo miembro"
                type="email"
              />
              <Button 
                onClick={handleInviteMember}
                disabled={isLoadingContext || !newMemberEmail.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Lista de miembros */}
            <div className="space-y-3">
              {contextMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {member.role === 'owner' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {member.role === 'owner' ? 'Propietario' : 'Miembro'}
                    </span>
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferencias de la Aplicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Preferencias
            </CardTitle>
            <CardDescription>
              Personaliza tu experiencia en la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Cambia entre tema claro y oscuro
                </p>
              </div>
              <ThemeToggle />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select 
                  id="moneda"
                  className="w-full p-2 pl-10 border rounded-md"
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                >
                  <option value="USD">USD - Dólar Estadounidense</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="ARS">ARS - Peso Argentino</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idioma">Idioma</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select 
                  id="idioma"
                  className="w-full p-2 pl-10 border rounded-md"
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura cómo quieres recibir notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones en tu dispositivo
                </p>
              </div>
              <Switch
                checked={notificaciones}
                onCheckedChange={setNotificaciones}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe resúmenes mensuales por correo
                </p>
              </div>
              <Switch
                checked={notificacionesEmail}
                onCheckedChange={setNotificacionesEmail}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Presupuesto</Label>
                <p className="text-sm text-muted-foreground">
                  Avisos cuando excedas tus presupuestos
                </p>
              </div>
              <Switch
                checked={notificacionesPresupuesto}
                onCheckedChange={setNotificacionesPresupuesto}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seguridad y Cuenta */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Seguridad y Cuenta
            </CardTitle>
            <CardDescription>
              Gestiona la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" className="w-full">
                Cambiar Contraseña
              </Button>
              
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Zona de Peligro</h4>
              <p className="text-sm text-muted-foreground">
                Estas acciones son irreversibles
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}