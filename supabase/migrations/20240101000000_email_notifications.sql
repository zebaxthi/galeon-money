-- Create email notifications log table
CREATE TABLE IF NOT EXISTS email_notifications_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('budget_exceeded', 'budget_low', 'monthly_report', 'weekly_summary', 'expense_alert')),
  context_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  external_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_user_id ON email_notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_type ON email_notifications_log(type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_sent_at ON email_notifications_log(sent_at);

-- The profiles table already has a preferences JSONB column
-- Email notifications will be stored in the preferences JSON object
-- No need to add additional columns

-- Enable RLS on email_notifications_log
ALTER TABLE email_notifications_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_notifications_log
CREATE POLICY "Users can view their own email notifications log" ON email_notifications_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email notifications log" ON email_notifications_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email notifications log" ON email_notifications_log
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON email_notifications_log TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_notifications_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_email_notifications_log_updated_at_trigger ON email_notifications_log;
CREATE TRIGGER update_email_notifications_log_updated_at_trigger
  BEFORE UPDATE ON email_notifications_log
  FOR EACH ROW
  EXECUTE FUNCTION update_email_notifications_log_updated_at();

-- Create push_subscriptions table for push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Create index for push_subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable RLS on push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON push_subscriptions TO authenticated;

-- Create trigger for push_subscriptions updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at_trigger ON push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at_trigger
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();