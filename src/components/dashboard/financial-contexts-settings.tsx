'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useFinancialContexts } from '@/hooks/useFinancialContexts'
import { useActiveFinancialContext } from '@/providers/financial-context-provider'

import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  Mail, 
  Crown, 
  UserPlus,
  AlertTriangle,
  Check,
  X,
  Loader2
} from 'lucide-react'

export function FinancialContextsSettings() {
  const { toast } = useToast()
  const { 
    userContexts, 
    activeContextMembers,
    createContext,
    updateContext,
    deleteContext,
    inviteMember,
    removeMember,
    isCreating,
    isUpdating,
    isDeleting,
    isInviting,
    isRemoving
  } = useFinancialContexts()
  
  const { activeContext, setActiveContext, loading: contextLoading } = useActiveFinancialContext()



  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Estados para crear contexto
  const [newContextName, setNewContextName] = useState('')
  const [newContextDescription, setNewContextDescription] = useState('')

  // Estados para editar contexto
  const [editContextName, setEditContextName] = useState('')
  const [editContextDescription, setEditContextDescription] = useState('')

  // Estados para invitar miembros
  const [inviteEmail, setInviteEmail] = useState('')

  // Función para crear contexto
  const handleCreateContext = async () => {
    if (!newContextName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del contexto es requerido",
        variant: "destructive"
      })
      return
    }
    
    try {
      await createContext(newContextName, newContextDescription)
      toast({
        title: "¡Éxito!",
        description: "Contexto creado correctamente"
      })
      setNewContextName('')
      setNewContextDescription('')
      setShowCreateModal(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el contexto",
        variant: "destructive"
      })
    }
  }

  // Función para actualizar contexto
  const handleUpdateContext = async () => {
    if (!activeContext) return
    
    if (!editContextName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del contexto es requerido",
        variant: "destructive"
      })
      return
    }
    
    try {
      await updateContext(activeContext.id, {
        name: editContextName,
        description: editContextDescription
      })
      toast({
        title: "¡Éxito!",
        description: "Contexto actualizado correctamente"
      })
      setShowEditModal(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el contexto",
        variant: "destructive"
      })
    }
  }

  // Función para eliminar contexto
  const handleDeleteContext = async () => {
    if (!activeContext) return
    
    try {
      await deleteContext(activeContext.id)
      toast({
        title: "¡Éxito!",
        description: "Contexto eliminado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el contexto",
        variant: "destructive"
      })
    }
  }

  // Función para invitar miembro
  const handleInviteMember = async () => {
    if (!activeContext) return
    
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "El email es requerido",
        variant: "destructive"
      })
      return
    }
    
    try {
      await inviteMember(activeContext.id, inviteEmail)
      toast({
        title: "¡Éxito!",
        description: "Miembro invitado correctamente"
      })
      setInviteEmail('')
      setShowInviteModal(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al invitar miembro",
        variant: "destructive"
      })
    }
  }

  // Función para remover miembro
  const handleRemoveMember = async (userId: string) => {
    if (!activeContext) return
    
    try {
      await removeMember(activeContext.id, userId)
      toast({
        title: "¡Éxito!",
        description: "Miembro removido correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al remover miembro",
        variant: "destructive"
      })
    }
  }

  // Función para cambiar contexto activo
  const handleSetActiveContext = async (contextId: string) => {
    try {
      await setActiveContext(contextId)
      toast({
        title: "¡Éxito!",
        description: "Contexto cambiado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar contexto",
        variant: "destructive"
      })
    }
  }

  // Función para abrir modal de edición
  const openEditModal = () => {
    if (activeContext) {
      setEditContextName(activeContext.name)
      setEditContextDescription(activeContext.description || '')
      setShowEditModal(true)
    }
  }

  const canDeleteContext = activeContext?.user_role === 'owner' && userContexts.length > 1

  if (contextLoading) {
    return (
      <Card className="col-span-full lg:col-span-2 h-fit">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full lg:col-span-2 h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Contextos Financieros
        </CardTitle>
        <CardDescription className="text-sm">
          Gestiona tus contextos financieros y colaboradores
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Selector de Contexto Activo */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Contexto Activo</Label>
          <Select 
            value={activeContext?.id || ''} 
            onValueChange={handleSetActiveContext}
            disabled={contextLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={activeContext?.name} />
            </SelectTrigger>
            <SelectContent>
              {userContexts && userContexts.length > 0 ? (
                userContexts
                  .filter((context) => {
                    // Filter out invalid contexts, especially 'argilaez'
                    return (
                      context &&
                      context.id &&
                      context.name &&
                      context.name.trim() !== '' &&
                      context.name !== 'argilaez'
                    )
                  })
                  .map((context) => (
                    <SelectItem key={context.id} value={context.id}>
                      <div className="flex items-center gap-2">
                        <span>{context.name}</span>
                        {context.user_role === 'owner' && (
                          <Crown key={`crown-${context.id}`} className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  {contextLoading ? 'Cargando contextos...' : 'No hay contextos disponibles'}
                </div>
              )}
            </SelectContent>
          </Select>
          {activeContext && (
            <div className="text-xs text-muted-foreground">
              {activeContext.description || 'Sin descripción'}
            </div>
          )}
        </div>

        <Separator />

        {/* Crear Nuevo Contexto */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Crear Nuevo Contexto</h3>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Contexto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Crear Nuevo Contexto
                  </DialogTitle>
                  <DialogDescription>
                    Crea un nuevo contexto financiero para organizar tus finanzas.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-context-name">Nombre</Label>
                    <Input
                      id="new-context-name"
                      value={newContextName}
                      onChange={(e) => setNewContextName(e.target.value)}
                      placeholder="Ej: Familia, Empresa, Personal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-context-description">Descripción (opcional)</Label>
                    <Textarea
                      id="new-context-description"
                      value={newContextDescription}
                      onChange={(e) => setNewContextDescription(e.target.value)}
                      placeholder="Describe el propósito de este contexto financiero"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateContext}
                    disabled={isCreating}
                    className="gap-2"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Crear Contexto
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {activeContext && (
          <>
            <Separator />

            {/* Editar Contexto Actual */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Editar Contexto Actual</h3>
                {activeContext.user_role === 'owner' && (
                  <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={openEditModal} className="gap-2">
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Edit3 className="h-5 w-5" />
                          Editar Contexto
                        </DialogTitle>
                        <DialogDescription>
                          Modifica la información de tu contexto financiero.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-context-name">Nombre</Label>
                          <Input
                            id="edit-context-name"
                            value={editContextName}
                            onChange={(e) => setEditContextName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-context-description">Descripción</Label>
                          <Textarea
                            id="edit-context-description"
                            value={editContextDescription}
                            onChange={(e) => setEditContextDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowEditModal(false)}
                          disabled={isUpdating}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleUpdateContext}
                          disabled={isUpdating}
                          className="gap-2"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Guardar Cambios
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {activeContext.user_role !== 'owner' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Solo el propietario puede editar este contexto.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Gestión de Miembros */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Miembros ({activeContextMembers.length})
                </h3>
                {activeContext.user_role === 'owner' && (
                  <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Invitar Miembro
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Invitar Miembro
                        </DialogTitle>
                        <DialogDescription>
                          Invita a un usuario registrado a colaborar en este contexto financiero.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email">Email del usuario</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="usuario@ejemplo.com"
                          />
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <p className="font-medium">Importante:</p>
                            <p>El usuario debe estar registrado en la aplicación para poder ser invitado.</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowInviteModal(false)}
                          disabled={isInviting}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleInviteMember}
                          disabled={isInviting}
                          className="gap-2"
                        >
                          {isInviting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          Enviar Invitación
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Lista de Miembros */}
              <div className="space-y-3">
                {activeContextMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile?.avatar_url} />
                        <AvatarFallback>
                          {member.profile?.name?.charAt(0) || member.profile?.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {member.profile?.name || member.profile?.email}
                          </span>
                          {member.role === 'owner' && (
                            <Badge key={`badge-${member.id}`} variant="secondary" className="gap-1">
                              <Crown className="h-3 w-3" />
                              Propietario
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.profile?.email}
                        </div>
                      </div>
                    </div>
                    {activeContext.user_role === 'owner' && member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.user_id)}
                        disabled={isRemoving}
                        className="text-destructive hover:text-destructive"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Zona de Peligro */}
            {canDeleteContext && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-destructive">Zona de Peligro</h3>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Eliminar este contexto es una acción permanente. Todos los datos asociados se perderán.
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteContext}
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Eliminar Contexto
                  </Button>
                </div>
              </>
            )}
          </>
        )}
        

      </CardContent>
    </Card>
  )
}