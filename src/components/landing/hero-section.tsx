"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Shield, 
  Smartphone, 
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-50 dark:from-violet-950/20 dark:via-background dark:to-violet-950/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Wallet className="w-4 h-4 mr-2" />
            Finanzas Personales
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Stonk$
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Toma el control de tus finanzas personales con una aplicación moderna, 
            intuitiva y diseñada para uso individual o en pareja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth/signup">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link href="/auth/signin">
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-violet-600 mb-2" />
              <CardTitle>Control Total</CardTitle>
              <CardDescription>
                Registra ingresos y egresos con categorías personalizables
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader>
              <PieChart className="h-10 w-10 text-violet-600 mb-2" />
              <CardTitle>Visualización Clara</CardTitle>
              <CardDescription>
                Gráficas interactivas para entender tus patrones de gasto
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader>
              <Users className="h-10 w-10 text-violet-600 mb-2" />
              <CardTitle>Uso en Pareja</CardTitle>
              <CardDescription>
                Gestiona las finanzas familiares con múltiples usuarios
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader>
              <Smartphone className="h-10 w-10 text-violet-600 mb-2" />
              <CardTitle>PWA Móvil</CardTitle>
              <CardDescription>
                Accede desde cualquier dispositivo, funciona offline
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader>
              <Shield className="h-10 w-10 text-violet-600 mb-2" />
              <CardTitle>Seguro y Privado</CardTitle>
              <CardDescription>
                Tus datos están protegidos con encriptación de nivel bancario
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-violet-200 dark:border-violet-800">
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-violet-600 mb-2" />
              <CardTitle>Presupuestos Inteligentes</CardTitle>
              <CardDescription>
                Crea presupuestos y recibe alertas automáticas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                ¿Por qué elegir Stonk$?
              </h2>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-violet-100">Gratuito</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-violet-100">Disponible</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">∞</div>
                  <div className="text-violet-100">Transacciones</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}