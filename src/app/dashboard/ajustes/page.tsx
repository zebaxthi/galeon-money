'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSettings } from "@/hooks/useSettings"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { 
  User, 
  Mail, 
  Save, 
  Users, 
  UserPlus, 
  Crown, 
  X, 
  Plus,
  Palette,
  DollarSign,
  Globe,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Loader2,
  Phone,
  MapPin,
  MessageSquare,
  Camera
} from "lucide-react"

export default function AjustesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    profile,
    context,
    contextMembers,
    preferences,
    loading,
    error,
    updateProfile,
    updatePreferences,
    updateContext,
    inviteMember,
    removeMember,
    signOut,
    deleteAccount,
    clearError
  } = useSettings()

  // Estados locales para formularios
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [biografia, setBiografia] = useState('')
  const [contextName, setContextName] = useState('')
  const [contextDescription, setContextDescription] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [isLoadingAction, setIsLoadingAction] = useState(false)

  // Inicializar estados cuando se cargan los datos
  useEffect(() => {
    if (profile) {
      setNombre(profile.name || '')
      setTelefono(profile.phone || '')
      setUbicacion(profile.location || '')
      setBiografia(profile.bio || '')
    }
    if (context) {
      setContextName(context.name || '')
      setContextDescription(context.description || '')
    }
  }, [profile, context])

  // Manejar subida de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validar tamaño del archivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 5MB.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoadingAction(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await updateProfile({ avatar_url: publicUrl })

      toast({
        title: "Éxito",
        description: "Foto de perfil actualizada correctamente"
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la foto de perfil",
        variant: "destructive"
      })
    } finally {
      setIsLoadingAction(false)
    }
  }

  // Manejar guardado de perfil
  const handleSaveProfile = async () => {
    try {
      setIsLoadingAction(true)
      clearError()
      await updateProfile({ 
        name: nombre,
        phone: telefono,
        location: ubicacion,
        bio: biografia
      })
      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente"
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      })
    } finally {
      setIsLoadingAction(false)
    }
  }

  // Manejar actualización de contexto
  const handleUpdateContext = async () => {
    try {
      setIsLoadingAction(true)
      clearError()
      await updateContext({ 
        name: contextName, 
        description: contextDescription 
      })
      toast({
        title: "Éxito",
        description: "Contexto actualizado correctamente"
      })
    } catch (error) {
      console.error('Error updating context:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el contexto",
        variant: "destructive"
      })
    } finally {
      setIsLoadingAction(false)
    }
  }

  // Manejar invitación de miembro
  const handleInviteMember = async () => {
    if (!newMemberEmail.trim()) return
    
    try {
      setIsLoadingAction(true)
      clearError()
      await inviteMember(newMemberEmail)
      setNewMemberEmail('')
      toast({
        title: "Éxito",
        description: "Miembro invitado correctamente"
      })
    } catch (error) {
      console.error('Error inviting member:', error)
      toast({
        title: "Error",
        description: "No se pudo invitar al miembro",
        variant: "destructive"
      })
    } finally {
      setIsLoadingAction(false)
    }
  }

  // Manejar eliminación de miembro
  const handleRemoveMember = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este miembro?')) return
    
    try {
      setIsLoadingAction(true)
      clearError()
      await removeMember(userId)
      toast({
        title: "Éxito",
        description: "Miembro eliminado correctamente"
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar al miembro",
        variant: "destructive"
      })
    } finally {
      setIsLoadingAction(false)
    }
  }

  // Manejar cierre de sesión
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive"
      })
    }
  }

  // Manejar eliminación de cuenta
  const handleDeleteAccount = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return
    
    try {
      setIsLoadingAction(true)
      await deleteAccount()
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta",
        variant: "destructive"
      })
      setIsLoadingAction(false)
    }
  }

  // Manejar eliminación de avatar
  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return

    if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) return

    try {
      setIsLoadingAction(true)
      
      // Eliminar el archivo del storage si existe
      if (profile.avatar_url) {
        const fileName = `${user.id}/avatar.${profile.avatar_url.split('.').pop()}`
        await supabase.storage
          .from('avatars')
          .remove([fileName])
      }

      // Actualizar el perfil para quitar la URL del avatar
      await updateProfile({ avatar_url: null })

      toast({
        title: "Éxito",
        description: "Foto de perfil eliminada correctamente"
      })
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto de perfil",
        variant: "destructive"
      })
    } finally {
      setIsLoadingAction(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground">
          Configura tu cuenta y preferencias de la aplicación
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.toString()}
        </div>
      )}

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
              <Label htmlFor="avatar">Foto de perfil</Label>
              <div className="flex items-start space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-violet-600 text-white text-xl">
                    {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoadingAction}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {profile?.avatar_url ? 'Cambiar foto' : 'Subir foto'}
                    </Button>
                    {profile?.avatar_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isLoadingAction}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG o GIF. Máximo 5MB.
                    </p>
                    {profile?.avatar_url && (
                      <p className="text-xs text-green-600">
                        ✓ Foto de perfil configurada
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

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
                  value={profile?.email || ''}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar por motivos de seguridad
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Tu número de teléfono"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Tu ciudad o país"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bio"
                  value={biografia}
                  onChange={(e) => setBiografia(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti"
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={isLoadingAction}
              className="w-full"
            >
              {isLoadingAction ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isLoadingAction ? 'Guardando...' : 'Guardar Cambios'}
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
              disabled={isLoadingAction}
              className="w-full"
            >
              {isLoadingAction ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isLoadingAction ? 'Guardando...' : 'Actualizar Contexto'}
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
                disabled={isLoadingAction || !newMemberEmail.trim()}
              >
                {isLoadingAction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Separator />

            {/* Lista de miembros */}
            <div className="space-y-3">
              {contextMembers.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {member.role === 'owner' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{member.profile?.name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
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
                        onClick={() => handleRemoveMember(member.user_id)}
                        disabled={isLoadingAction}
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
              <Label>Moneda</Label>
              <Select 
                value={preferences.currency} 
                onValueChange={(value) => updatePreferences({ currency: value })}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Selecciona una moneda" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                  <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select 
                value={preferences.language} 
                onValueChange={(value) => updatePreferences({ language: value })}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Selecciona un idioma" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
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
                checked={preferences.notifications}
                onCheckedChange={(checked) => updatePreferences({ notifications: checked })}
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
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
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
                checked={preferences.budgetAlerts}
                onCheckedChange={(checked) => updatePreferences({ budgetAlerts: checked })}
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
              
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="w-full"
                disabled={isLoadingAction}
              >
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
                disabled={isLoadingAction}
                className="w-full"
              >
                {isLoadingAction ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {isLoadingAction ? 'Eliminando...' : 'Eliminar Cuenta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}