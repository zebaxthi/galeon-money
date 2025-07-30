"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, LogOut } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-violet-600" />
            <span className="text-xl font-bold">Galeon Money</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Hola, {user?.user_metadata?.name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de control financiero
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
              <CardDescription>
                Vista general de tus finanzas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">$0.00</p>
              <p className="text-sm text-muted-foreground">Saldo actual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos del Mes</CardTitle>
              <CardDescription>
                Total de ingresos este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">$0.00</p>
              <p className="text-sm text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gastos del Mes</CardTitle>
              <CardDescription>
                Total de gastos este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">$0.00</p>
              <p className="text-sm text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Próximos pasos</CardTitle>
            <CardDescription>
              Configura tu cuenta para comenzar a gestionar tus finanzas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                <span>Crear categorías de ingresos y gastos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Registrar tu primer movimiento</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Configurar presupuestos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}