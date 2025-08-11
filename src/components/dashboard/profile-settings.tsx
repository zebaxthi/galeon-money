'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Save, 
  Loader2, 
  Camera, 
  Trash2
} from 'lucide-react'

interface UserProfile {
  name?: string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string | null
}

interface ProfileSettingsProps {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

export function ProfileSettings({ profile, updateProfile, clearError }: ProfileSettingsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados locales
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [biografia, setBiografia] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Inicializar valores cuando cambie el perfil
  useEffect(() => {
    if (profile) {
      setNombre(profile.name || '')
      setTelefono(profile.phone || '')
      setUbicacion(profile.location || '')
      setBiografia(profile.bio || '')
    }
  }, [profile])

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
      setIsLoadingProfile(true)
      
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
      setIsLoadingProfile(false)
    }
  }

  // Manejar eliminación de avatar
  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return

    if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) return

    try {
      setIsLoadingProfile(true)
      
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
      setIsLoadingProfile(false)
    }
  }

  // Manejar guardado de perfil
  const handleSaveProfile = async () => {
    try {
      setIsLoadingProfile(true)
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
      setIsLoadingProfile(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-4 w-4" />
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
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoadingProfile}
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
                    disabled={isLoadingProfile}
                    className="text-red-600 hover:text-red-700"
                  >
                    {isLoadingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {isLoadingProfile ? 'Procesando...' : 'Eliminar'}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG o GIF. Máximo 5MB.
              </p>
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

        <div className="grid gap-4 md:grid-cols-2">
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
                value={user?.email || ''}
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
          disabled={isLoadingProfile}
          className="w-full"
        >
          {isLoadingProfile ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoadingProfile ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </CardContent>
    </Card>
  )
}