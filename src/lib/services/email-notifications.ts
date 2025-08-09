import { supabase } from '../supabase'

import type { EmailNotificationData, EmailTemplate } from '../types'

export class EmailNotificationService {
  private static instance: EmailNotificationService

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService()
    }
    return EmailNotificationService.instance
  }

  // Send email notification using Supabase Edge Function
  async sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.to,
          subject: data.subject,
          html: data.html,
          type: data.type,
          userId: data.userId,
          contextId: data.contextId
        }
      })

      if (error) {
        console.error('Error sending email notification:', error)
        return false
      }

      console.log('Email notification sent successfully:', result)
      return true
    } catch (error) {
      console.error('Failed to send email notification:', error)
      return false
    }
  }

  // Generate budget exceeded email template
  generateBudgetExceededTemplate(data: {
    userName: string
    budgetName: string
    budgetAmount: number
    currentAmount: number
    percentage: number
  }): EmailTemplate {
    const subject = `🚨 Presupuesto Excedido: ${data.budgetName}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Presupuesto Excedido - Galeon Money</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #fee; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
          .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 Presupuesto Excedido</h1>
          <p>Galeon Money - Gestión Financiera</p>
        </div>
        <div class="content">
          <p>Hola <strong>${data.userName}</strong>,</p>
          
          <div class="alert">
            <h3>⚠️ Tu presupuesto "${data.budgetName}" ha sido excedido</h3>
            <p>Has superado el límite establecido en un <strong>${data.percentage.toFixed(1)}%</strong></p>
          </div>
          
          <div class="stats">
            <h4>📊 Detalles del Presupuesto:</h4>
            <ul>
              <li><strong>Presupuesto:</strong> $${data.budgetAmount.toLocaleString()}</li>
              <li><strong>Gastado:</strong> $${data.currentAmount.toLocaleString()}</li>
              <li><strong>Exceso:</strong> $${(data.currentAmount - data.budgetAmount).toLocaleString()}</li>
              <li><strong>Porcentaje:</strong> ${data.percentage.toFixed(1)}%</li>
            </ul>
          </div>
          
          <p>Te recomendamos revisar tus gastos y ajustar tu presupuesto si es necesario.</p>
          
          <a href="https://galeon-money-q9pszby26-zebaxthis-projects.vercel.app/dashboard/presupuestos" class="button">
            Ver Presupuestos
          </a>
          
          <div class="footer">
            <p>Este es un email automático de Galeon Money</p>
            <p>Si no deseas recibir estas notificaciones, puedes desactivarlas en la configuración de tu cuenta.</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    return { subject, html }
  }

  // Generate low budget email template
  generateLowBudgetTemplate(data: {
    userName: string
    budgetName: string
    budgetAmount: number
    currentAmount: number
    percentage: number
    remainingAmount: number
  }): EmailTemplate {
    const subject = `⚠️ Presupuesto Bajo: ${data.budgetName}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Presupuesto Bajo - Galeon Money</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚠️ Presupuesto Bajo</h1>
          <p>Galeon Money - Gestión Financiera</p>
        </div>
        <div class="content">
          <p>Hola <strong>${data.userName}</strong>,</p>
          
          <div class="warning">
            <h3>📉 Tu presupuesto "${data.budgetName}" está llegando al límite</h3>
            <p>Has utilizado el <strong>${data.percentage.toFixed(1)}%</strong> de tu presupuesto</p>
          </div>
          
          <div class="stats">
            <h4>📊 Estado del Presupuesto:</h4>
            <ul>
              <li><strong>Presupuesto Total:</strong> $${data.budgetAmount.toLocaleString()}</li>
              <li><strong>Gastado:</strong> $${data.currentAmount.toLocaleString()}</li>
              <li><strong>Disponible:</strong> $${data.remainingAmount.toLocaleString()}</li>
              <li><strong>Porcentaje Usado:</strong> ${data.percentage.toFixed(1)}%</li>
            </ul>
          </div>
          
          <p>Te sugerimos revisar tus gastos para mantenerte dentro del presupuesto establecido.</p>
          
          <a href="https://galeon-money-q9pszby26-zebaxthis-projects.vercel.app/dashboard/presupuestos" class="button">
            Revisar Presupuestos
          </a>
          
          <div class="footer">
            <p>Este es un email automático de Galeon Money</p>
            <p>Si no deseas recibir estas notificaciones, puedes desactivarlas en la configuración de tu cuenta.</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    return { subject, html }
  }

  // Generate monthly report email template
  generateMonthlyReportTemplate(data: {
    userName: string
    month: string
    year: number
    totalIncome: number
    totalExpenses: number
    balance: number
    topCategories: Array<{ name: string; amount: number }>
  }): EmailTemplate {
    const subject = `📊 Reporte Mensual - ${data.month} ${data.year}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Mensual - Galeon Money</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .positive { color: #28a745; }
          .negative { color: #dc3545; }
          .categories { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .category-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Reporte Mensual</h1>
          <p>Galeon Money - ${data.month} ${data.year}</p>
        </div>
        <div class="content">
          <p>Hola <strong>${data.userName}</strong>,</p>
          
          <p>Aquí tienes tu resumen financiero del mes de <strong>${data.month} ${data.year}</strong>:</p>
          
          <div class="summary">
            <h4>💰 Resumen Financiero:</h4>
            <ul>
              <li><strong>Ingresos:</strong> <span class="positive">$${data.totalIncome.toLocaleString()}</span></li>
              <li><strong>Gastos:</strong> <span class="negative">$${data.totalExpenses.toLocaleString()}</span></li>
              <li><strong>Balance:</strong> <span class="${data.balance >= 0 ? 'positive' : 'negative'}">$${data.balance.toLocaleString()}</span></li>
            </ul>
          </div>
          
          ${data.topCategories.length > 0 ? `
          <div class="categories">
            <h4>🏷️ Principales Categorías de Gasto:</h4>
            ${data.topCategories.map(cat => `
              <div class="category-item">
                <span>${cat.name}</span>
                <span>$${cat.amount.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <a href="https://galeon-money-q9pszby26-zebaxthis-projects.vercel.app/dashboard/estadisticas" class="button">
            Ver Estadísticas Completas
          </a>
          
          <div class="footer">
            <p>Este es un email automático de Galeon Money</p>
            <p>Si no deseas recibir estas notificaciones, puedes desactivarlas en la configuración de tu cuenta.</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    return { subject, html }
  }

  // Send budget exceeded notification
  async sendBudgetExceededNotification(data: {
    userEmail: string
    userName: string
    budgetName: string
    budgetAmount: number
    currentAmount: number
    userId: string
    contextId?: string
  }): Promise<boolean> {
    const percentage = (data.currentAmount / data.budgetAmount) * 100
    const template = this.generateBudgetExceededTemplate({
      userName: data.userName,
      budgetName: data.budgetName,
      budgetAmount: data.budgetAmount,
      currentAmount: data.currentAmount,
      percentage
    })

    return this.sendEmailNotification({
      to: data.userEmail,
      subject: template.subject,
      html: template.html,
      type: 'budget_exceeded',
      userId: data.userId,
      contextId: data.contextId
    })
  }

  // Send low budget notification
  async sendLowBudgetNotification(data: {
    userEmail: string
    userName: string
    budgetName: string
    budgetAmount: number
    currentAmount: number
    userId: string
    contextId?: string
  }): Promise<boolean> {
    const percentage = (data.currentAmount / data.budgetAmount) * 100
    const remainingAmount = data.budgetAmount - data.currentAmount
    
    const template = this.generateLowBudgetTemplate({
      userName: data.userName,
      budgetName: data.budgetName,
      budgetAmount: data.budgetAmount,
      currentAmount: data.currentAmount,
      percentage,
      remainingAmount
    })

    return this.sendEmailNotification({
      to: data.userEmail,
      subject: template.subject,
      html: template.html,
      type: 'budget_low',
      userId: data.userId,
      contextId: data.contextId
    })
  }

  // Send monthly report notification
  async sendMonthlyReportNotification(data: {
    userEmail: string
    userName: string
    month: string
    year: number
    totalIncome: number
    totalExpenses: number
    balance: number
    topCategories: Array<{ name: string; amount: number }>
    userId: string
    contextId?: string
  }): Promise<boolean> {
    const template = this.generateMonthlyReportTemplate(data)

    return this.sendEmailNotification({
      to: data.userEmail,
      subject: template.subject,
      html: template.html,
      type: 'monthly_report',
      userId: data.userId,
      contextId: data.contextId
    })
  }
}

// Export singleton instance
export const emailNotificationService = EmailNotificationService.getInstance()