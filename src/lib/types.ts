export interface Profile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  preferences?: Record<string, string | number | boolean | null>
  created_at: string
  updated_at: string
}

export interface UserData {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    [key: string]: string | number | boolean | null | undefined
  }
  [key: string]: string | number | boolean | null | undefined | object
}

export interface FinancialContext {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
  user_role?: 'owner' | 'member'
}

export interface ContextMember {
  id: string
  context_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  profile?: Profile
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon?: string
  user_id: string
  context_id?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Movement {
  id: string
  amount: number
  description: string
  notes?: string
  type: 'income' | 'expense'
  category_id?: string
  user_id: string
  context_id?: string
  created_by: string
  updated_by?: string
  movement_date: string
  created_at: string
  updated_at: string
  category?: Category
  created_by_profile?: Profile
  updated_by_profile?: Profile
}

export interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  category_id?: string
  user_id: string
  context_id?: string
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface CreateMovementData {
  amount: number
  type: 'income' | 'expense'
  description?: string
  category_id?: string
  movement_date?: string
  context_id?: string
}

export interface UpdateMovementData {
  amount?: number
  type?: 'income' | 'expense'
  description?: string
  category_id?: string
  movement_date?: string
  context_id?: string
  updated_by?: string
}

export interface CreateCategoryData {
  name: string
  type: 'income' | 'expense'
  icon?: string
  color: string
  context_id?: string
}

export interface CreateBudgetData {
  name: string
  amount: number
  category_id: string
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
  context_id?: string
}

export interface UpdateFinancialContextData {
  name?: string
  description?: string
}

export interface InviteMemberData {
  email: string
  context_id: string
}

// Email Notification Types
export interface EmailNotificationData {
  to: string
  subject: string
  html: string
  type: 'budget_exceeded' | 'budget_low' | 'monthly_report' | 'weekly_summary' | 'expense_alert'
  userId: string
  contextId?: string
}

export interface EmailTemplate {
  subject: string
  html: string
}

// Export Service Types
export interface ExportData {
  movements: Movement[]
  categories: Category[]
  budgets: Budget[]
  summary: CategorySummary[]
  statistics: ExportStatistics
}

export interface CategorySummary {
  categoria: string
  ingresos: number
  egresos: number
  saldo: number
  color?: string
}

export interface ExportStatistics {
  totalIngresos: number
  totalEgresos: number
  saldoNeto: number
  promedioMensual: number
  movimientosCount: number
  categoriasCount: number
  presupuestosCount: number
  periodoAnalizado: string
}

// Statistics Types
export interface StatisticsData {
  resumenEstadisticas: {
    totalIngresos: number
    totalEgresos: number
    saldoNeto: number
    promedioMensual: number
  }
  datosIngresoEgreso: Array<{
    mes: string
    ingresos: number
    egresos: number
  }>
  datosCategorias: Array<{
    nombre: string
    valor: number
    color: string
  }>
  tendenciaMensual: Array<{
    mes: string
    saldo: number
  }>
}

// Toast Types
export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

// PWA Types
export interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

// Notification Types
export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: NotificationAction[]
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: NotificationAction[]
}

// User Preferences Types
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  currency?: string
  notifications?: {
    email?: boolean
    push?: boolean
    budgetAlerts?: boolean
    weeklyReports?: boolean
    monthlyReports?: boolean
  }
  privacy?: {
    shareData?: boolean
    analytics?: boolean
  }
}

// Component Props Types
export interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export interface AppLayoutProps {
  children: React.ReactNode
}

export interface SidebarProps {
  className?: string
}

export interface ImprovedSidebarProps {
  className?: string
}

export interface MobileSidebarProps {
  className?: string
}

export interface DashboardNavProps {
  className?: string
  isMobile?: boolean
}

export interface DashboardHeaderProps {
  user?: UserData | null
  title?: string
  description?: string
}

export interface EmojiPickerProps {
  value?: string
  onChange: (emoji: string) => void
  onEmojiSelect?: (emoji: string) => void
  className?: string
}

// Auth Context Types
export interface AuthContextType {
  user: UserData | null
  session?: object | null
  loading: boolean
  signIn?: (email: string, password: string) => Promise<void>
  signUp?: (email: string, password: string, name?: string) => Promise<void>
  signOut?: () => Promise<void>
  resetPassword?: (email: string) => Promise<void>
}

// Financial Context Types
export interface FinancialContextState {
  contexts: FinancialContext[]
  activeContext: FinancialContext | null
  loading: boolean
  error: Error | null
  setActiveContext: (contextId: string) => Promise<void>
  refreshContexts: () => Promise<void>
}

// Service Response Types

// Hook Return Types
export interface UseNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
  requestPermission: () => Promise<boolean>
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  notifyBudgetExceeded: (categoryName: string, amount: number, budgetAmount: number) => Promise<void>
  notifyLowBudget: (categoryName: string, remaining: number) => Promise<void>
  notifyMonthlyReport: (totalIncome: number, totalExpenses: number) => Promise<void>
}

// Form Component Types
export interface ValidationRule {
  test: (value: string | number) => boolean
  message: string
}

export interface FormValidationConfig {
  [key: string]: ValidationRule[]
}

export interface CrudOperationsConfig {
  entityName: string
  entityNamePlural?: string
  confirmDelete?: boolean
  successMessages?: {
    create?: string
    update?: string
    delete?: string
  }
}

// Budget Form Types
export interface EditBudgetFormProps {
  budget: Budget
  categories: Array<{ id: string; name: string; icon?: string }>
  onSubmit: (data: { name: string; amount: number; category_id: string; period: 'weekly' | 'monthly' | 'yearly'; start_date: string; end_date: string }) => void
  onCancel: () => void
  isSubmitting: boolean
}

// Profile Types
export interface UserProfile {
  name?: string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string | null
}

export interface ProfileSettingsProps {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

// Sidebar Types
export interface BaseSidebarProps {
  className?: string
}

// App Preferences Types
export interface AppPreferencesProps {
  preferences?: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  className?: string
}

// Account Security Types
export interface AccountSecurityProps {
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

// Form Field Types
export interface BaseFormFieldProps {
  label: string
  id: string
  error?: string
  required?: boolean
  className?: string
  description?: string
}

export interface InputFormFieldProps extends BaseFormFieldProps {
  type: 'text' | 'email' | 'password' | 'number' | 'date'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  min?: string | number
  max?: string | number
  step?: string | number
  icon?: React.ReactNode
}

export interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: 'textarea'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
}

export interface SelectFormFieldProps extends BaseFormFieldProps {
  type: 'select'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export interface CustomFormFieldProps extends BaseFormFieldProps {
  type: 'custom'
  children: React.ReactNode
}

export type FormFieldProps = 
  | InputFormFieldProps 
  | TextareaFormFieldProps 
  | SelectFormFieldProps 
  | CustomFormFieldProps

export interface CharacterCounterProps {
  current: number
  max: number
  className?: string
}