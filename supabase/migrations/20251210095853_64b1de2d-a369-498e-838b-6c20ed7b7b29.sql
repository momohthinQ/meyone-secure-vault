-- Add QR verification tokens and digital signatures to documents
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS digital_signature TEXT,
ADD COLUMN IF NOT EXISTS issuer_institution_id UUID REFERENCES public.institutions(id);

-- Create verification logs table for tamper-proof logging
CREATE TABLE public.verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  institution_document_id UUID REFERENCES public.institution_documents(id) ON DELETE CASCADE,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_result TEXT NOT NULL,
  verifier_ip TEXT,
  verifier_user_agent TEXT,
  document_hash_at_verification TEXT,
  metadata JSONB
);

-- Enable RLS on verification_logs
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert verification logs (public verification)
CREATE POLICY "Anyone can insert verification logs"
ON public.verification_logs
FOR INSERT
WITH CHECK (true);

-- Anyone can view verification logs (transparency)
CREATE POLICY "Anyone can view verification logs"
ON public.verification_logs
FOR SELECT
USING (true);

-- Add QR token and digital signature to institution_documents
ALTER TABLE public.institution_documents
ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS digital_signature TEXT;

-- Create messages table for user-institution communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  institution_id UUID REFERENCES public.institutions(id),
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  parent_message_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update their messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Institutions can view messages to them
CREATE POLICY "Institutions can view messages to them"
ON public.messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM institutions
  WHERE institutions.id = messages.institution_id
  AND institutions.user_id = auth.uid()
));

-- Institutions can reply to messages
CREATE POLICY "Institutions can send messages"
ON public.messages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM institutions
  WHERE institutions.id = messages.institution_id
  AND institutions.user_id = auth.uid()
));

-- Create chatbot conversations table
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Users can manage their conversations
CREATE POLICY "Users can manage their chatbot conversations"
ON public.chatbot_conversations
FOR ALL
USING (auth.uid() = user_id);

-- Create chatbot messages table
CREATE TABLE public.chatbot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Users can manage messages in their conversations
CREATE POLICY "Users can manage chatbot messages"
ON public.chatbot_messages
FOR ALL
USING (EXISTS (
  SELECT 1 FROM chatbot_conversations
  WHERE chatbot_conversations.id = chatbot_messages.conversation_id
  AND chatbot_conversations.user_id = auth.uid()
));

-- Create API keys table for developer access
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '["verify"]'::jsonb,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Institutions can manage their API keys
CREATE POLICY "Institutions can manage their API keys"
ON public.api_keys
FOR ALL
USING (EXISTS (
  SELECT 1 FROM institutions
  WHERE institutions.id = api_keys.institution_id
  AND institutions.user_id = auth.uid()
));

-- Create institution analytics table
CREATE TABLE public.institution_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  document_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institution_analytics ENABLE ROW LEVEL SECURITY;

-- Public can insert analytics (for verification scans)
CREATE POLICY "Anyone can insert analytics"
ON public.institution_analytics
FOR INSERT
WITH CHECK (true);

-- Institutions can view their analytics
CREATE POLICY "Institutions can view their analytics"
ON public.institution_analytics
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM institutions
  WHERE institutions.id = institution_analytics.institution_id
  AND institutions.user_id = auth.uid()
));

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
ON public.institution_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_conversations_updated_at
BEFORE UPDATE ON public.chatbot_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();