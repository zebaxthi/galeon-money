export interface Profile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  preferences?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface FinancialContext {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
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
  movement_date: string
  created_at: string
  updated_at: string
  category?: Category
  created_by_profile?: Profile
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
  description: string
  notes?: string
  type: 'income' | 'expense'
  category_id?: string
  context_id?: string
  movement_date?: string
}

export interface CreateCategoryData {
  name: string
  type: 'income' | 'expense'
  color: string
  icon?: string
  context_id?: string
}

export interface CreateBudgetData {
  name: string
  amount: number
  category_id?: string
  context_id?: string
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
}

export interface UpdateFinancialContextData {
  name?: string
  description?: string
}

export interface InviteMemberData {
  email: string
  context_id: string
}