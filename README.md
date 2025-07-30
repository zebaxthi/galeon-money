This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 📘 Documentación de Desarrollo: Galeon Money

**Galeon Money** es una aplicación web y móvil (PWA) de finanzas personales diseñada para uso individual o en pareja. Permite llevar un control detallado de ingresos, egresos, presupuestos y visualización de datos financieros con un enfoque moderno, visual e intuitivo.

---

## 🎯 Objetivo del Proyecto

Desarrollar una app que permita gestionar finanzas personales desde cualquier dispositivo, con énfasis en la experiencia de usuario, visualización clara de los datos, recomendaciones inteligentes y exportación de reportes financieros.

---

## 🧰 Tecnologías Utilizadas

| Área          | Tecnología                            |
| ------------- | ------------------------------------- |
| Frontend      | Next.js (App Router), TailwindCSS v4  |
| UI Components | Shadcn/UI (theme violet)              |
| Gráficas      | Recharts o Chart.js                   |
| Backend       | Supabase (PostgreSQL, Auth, API REST) |
| Autenticación | Supabase                              |
| Exportación   | ExcelJS o xlsx                        |
| Despliegue    | Vercel                                |

---

## 📱 Pantallas de la Aplicación

| Pantalla         | Ruta            | Funcionalidad Principal                             |
| ---------------- | --------------- | --------------------------------------------------- |
| Login / Registro | `/`             | Autenticación, recuperación de cuenta               |
| Dashboard        | `/dashboard`    | Resumen financiero mensual y alertas presupuestales |
| Movimientos      | `/movimientos`  | Registro de ingresos y egresos manuales             |
| Categorías       | `/categorias`   | Gestión personalizada de categorías                 |
| Presupuestos     | `/presupuestos` | Crear y seguir presupuestos por categoría           |
| Estadísticas     | `/estadisticas` | Visualización comparativa (barras, anillos, líneas) |
| Exportar         | `/exportar`     | Generación de reportes Excel filtrables             |
| Ajustes          | `/ajustes`      | Modo oscuro, idioma, moneda, cuenta                 |

---

## 🔀 Navegación Principal

Se recomienda usar una barra inferior (en móviles) o lateral (en escritorio) con accesos a:

- 🏠 Dashboard
- ➕ Movimiento
- 📊 Estadísticas
- 💰 Presupuestos
- 📁 Exportar
- ⚙️ Ajustes

---

## 🧱 Funcionalidades Clave por Módulo

### 📝 Registro de ingresos y egresos

Pantalla: `/movimientos`

- Toggle "Ingreso / Egreso"
- Monto (numérico)
- Categoría (select)
- Fecha
- Usuario responsable (select, para uso en pareja)
- Notas (opcional)
- Validación de campos
- Lista de los últimos 5 movimientos
- Persistencia en Supabase (tabla `transactions`)

---

### 📊 Panel resumen (Dashboard)

Pantalla: `/dashboard`

- Total ingresos, egresos y saldo
- Porcentajes por categoría
- Cumplimiento de presupuesto (por categoría)
- Gráficas visuales (Recharts)
- Filtro por rango de fechas

---

### 📈 Visualización de estadísticas

Pantalla: `/estadisticas`

- Comparativa ingresos vs egresos
- Gráfica circular por categorías
- Filtros por mes, semana y año
- Visualización con Recharts

---

### 💰 Gestión de presupuestos

Pantalla: `/presupuestos`

- Crear, editar, eliminar presupuestos
- Asignar por categoría y periodo (mensual o semanal)
- Progreso visual del presupuesto
- Alertas si se excede el límite
- Tabla `budgets` relacionada con `transactions`

---

### 🧷 Gestión de categorías

Pantalla: `/categorias`

- Crear, editar, eliminar categorías
- Categorías con nombre, tipo (ingreso/egreso) y color
- Persistencia en Supabase (tabla `categories`)

---

### 🧾 Exportación a Excel

Pantalla: `/exportar`

- Filtros por día, semana, mes, año
- Exportar por resumen o desglose detallado
- Formato `.xlsx` generado con `exceljs` o `xlsx`
- Descarga directa desde el navegador

---

### 🤖 Recomendaciones inteligentes

Componente en el Dashboard o pantalla dedicada

- Alertas cuando los egresos superan los ingresos
- Sugerencias de ahorro por patrones de gasto
- Detección de hábitos financieros negativos
- Lógica basada en reglas simples por ahora

---

### 🔐 Autenticación y ajustes de usuario

Pantallas: `/` (login), `/ajustes`

- Login con Google o correo
- Soporte multiusuario (pareja)
- Preferencias del usuario:
  - Tema claro/oscuro
  - Moneda
  - Idioma
- Configuración desde Clerk o Auth.js

---

### 🌐 Funcionalidades adicionales (Opcionales)

- PWA con soporte offline
- Notificaciones push por eventos financieros
- Envío mensual automático de reportes por correo
- Historial de cambios en gastos
- Soporte multi-moneda e internacionalización

---

### 🌐 Links importantes de shadcn y muchos componmentes
https://ui.shadcn.com/docs/installation/next
https://ui.shadcn.com/docs/theming
https://ui.shadcn.com/docs/dark-mode/next
https://ui.shadcn.com/docs/components/accordion
https://ui.shadcn.com/docs/components/alert
https://ui.shadcn.com/docs/components/alert-dialog
https://ui.shadcn.com/docs/components/aspect-ratio
https://ui.shadcn.com/docs/components/avatar
https://ui.shadcn.com/docs/components/badge
https://ui.shadcn.com/docs/components/breadcrumb
https://ui.shadcn.com/docs/components/button
https://ui.shadcn.com/docs/components/calendar
https://ui.shadcn.com/docs/components/card
https://ui.shadcn.com/docs/components/carousel
https://ui.shadcn.com/docs/components/chart
https://ui.shadcn.com/docs/components/checkbox
https://ui.shadcn.com/docs/components/collapsible
https://ui.shadcn.com/docs/components/combobox
https://ui.shadcn.com/docs/components/command
https://ui.shadcn.com/docs/components/context-menu
https://ui.shadcn.com/docs/components/data-table
https://ui.shadcn.com/docs/components/date-picker
https://ui.shadcn.com/docs/components/dialog
https://ui.shadcn.com/docs/components/drawer
https://ui.shadcn.com/docs/components/dropdown-menu
https://ui.shadcn.com/docs/components/form
https://ui.shadcn.com/docs/components/hover-card
https://ui.shadcn.com/docs/components/input
https://ui.shadcn.com/docs/components/input-otp
https://ui.shadcn.com/docs/components/label
https://ui.shadcn.com/docs/components/menubar
https://ui.shadcn.com/docs/components/navigation-menu
https://ui.shadcn.com/docs/components/pagination
https://ui.shadcn.com/docs/components/popover
https://ui.shadcn.com/docs/components/progress
https://ui.shadcn.com/docs/components/radio-group
https://ui.shadcn.com/docs/components/resizable
https://ui.shadcn.com/docs/components/scroll-area
https://ui.shadcn.com/docs/components/select
https://ui.shadcn.com/docs/components/separator
https://ui.shadcn.com/docs/components/sheet
https://ui.shadcn.com/docs/components/sidebar
https://ui.shadcn.com/docs/components/skeleton
https://ui.shadcn.com/docs/components/slider
https://ui.shadcn.com/docs/components/sonner
https://ui.shadcn.com/docs/components/switch
https://ui.shadcn.com/docs/components/table
https://ui.shadcn.com/docs/components/tabs
https://ui.shadcn.com/docs/components/textarea
https://ui.shadcn.com/docs/components/toast
https://ui.shadcn.com/docs/components/toggle
https://ui.shadcn.com/docs/components/toggle-group
https://ui.shadcn.com/docs/components/tooltip
https://ui.shadcn.com/docs/components/typography
https://ui.shadcn.com/colors
https://ui.shadcn.com/themes
https://ui.shadcn.com/blocks