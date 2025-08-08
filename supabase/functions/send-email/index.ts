import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  type: 'budget_exceeded' | 'budget_low' | 'monthly_report' | 'weekly_summary' | 'expense_alert'
  userId: string
  contextId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request body
    const emailData: EmailRequest = await req.json()

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.html || !emailData.type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has email notifications enabled
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if email notifications are enabled in preferences
    const preferences = profile?.preferences || {}
    if (preferences.emailNotifications === false) {
      return new Response(
        JSON.stringify({ error: 'Email notifications disabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email using Resend (you can replace with SendGrid, Mailgun, etc.)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Galeon Money <notifications@galeonmoney.com>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        tags: [
          { name: 'type', value: emailData.type },
          { name: 'user_id', value: emailData.userId },
          ...(emailData.contextId ? [{ name: 'context_id', value: emailData.contextId }] : [])
        ]
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Failed to send email:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await emailResponse.json()

    // Log the email notification in the database
    const { error: logError } = await supabaseClient
      .from('email_notifications_log')
      .insert({
        user_id: user.id,
        email: emailData.to,
        subject: emailData.subject,
        type: emailData.type,
        context_id: emailData.contextId,
        sent_at: new Date().toISOString(),
        status: 'sent',
        external_id: result.id
      })

    if (logError) {
      console.error('Failed to log email notification:', logError)
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})