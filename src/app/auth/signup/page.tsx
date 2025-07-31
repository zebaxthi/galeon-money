"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mail, Lock, User, Eye, EyeOff, Wallet, ArrowLeft, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      })
      
      if (error) throw error
      
      setSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear la cuenta"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) throw error
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error con Google Sign Up"
      setError(errorMessage)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-50 dark:from-violet-950/20 dark:via-background dark:to-violet-950/20">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5" />
              <Wallet className="h-8 w-8 text-violet-600" />
              <span className="text-xl font-bold">Galeon Money</span>
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        {/* Success Message */}
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-md">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6 text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h2 className="text-2xl font-bold">¡Cuenta creada exitosamente!</h2>
                <p className="text-muted-foreground">
                  Hemos enviado un enlace de confirmación a <strong>{email}</strong>. 
                  Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">
                      Ir a Iniciar Sesión
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/">
                      Volver al inicio
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-50 dark:from-violet-950/20 dark:via-background dark:to-violet-950/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <Wallet className="h-8 w-8 text-violet-600" />
            <span className="text-xl font-bold">Galeon Money</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Sign Up Form */}
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Crear cuenta</CardTitle>
              <CardDescription>
                Únete a Galeon Money y toma control de tus finanzas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Registrarse con Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O regístrate con email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </form>

              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <Link 
                    href="/auth/signin" 
                    className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                  >
                    Inicia sesión aquí
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}