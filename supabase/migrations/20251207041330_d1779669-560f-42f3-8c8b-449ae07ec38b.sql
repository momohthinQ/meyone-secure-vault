-- Create enum for institution types
CREATE TYPE public.institution_type AS ENUM ('university', 'mda', 'ngo', 'private_company', 'other');

-- Create enum for institution status
CREATE TYPE public.institution_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Create institutions table
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  institution_type institution_type NOT NULL,
  registration_number TEXT,
  address TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  status institution_status NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Institutions can view their own record"
ON public.institutions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Institutions can insert their own record"
ON public.institutions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Institutions can update their own record"
ON public.institutions
FOR UPDATE
USING (auth.uid() = user_id AND status != 'suspended');

CREATE POLICY "Admins can view all institutions"
ON public.institutions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all institutions"
ON public.institutions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Add 'institution' to app_role enum
ALTER TYPE public.app_role ADD VALUE 'institution';

-- Create institution_documents table for bulk uploads
CREATE TABLE public.institution_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  batch_name TEXT,
  batch_year INTEGER,
  recipient_name TEXT NOT NULL,
  recipient_identifier TEXT,
  file_path TEXT NOT NULL,
  file_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  issued_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institution_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution_documents
CREATE POLICY "Institutions can view their own documents"
ON public.institution_documents
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM institutions 
  WHERE institutions.id = institution_documents.institution_id 
  AND institutions.user_id = auth.uid()
  AND institutions.status = 'approved'
));

CREATE POLICY "Institutions can insert their own documents"
ON public.institution_documents
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM institutions 
  WHERE institutions.id = institution_documents.institution_id 
  AND institutions.user_id = auth.uid()
  AND institutions.status = 'approved'
));

CREATE POLICY "Institutions can update their own documents"
ON public.institution_documents
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM institutions 
  WHERE institutions.id = institution_documents.institution_id 
  AND institutions.user_id = auth.uid()
  AND institutions.status = 'approved'
));

CREATE POLICY "Institutions can delete their own documents"
ON public.institution_documents
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM institutions 
  WHERE institutions.id = institution_documents.institution_id 
  AND institutions.user_id = auth.uid()
  AND institutions.status = 'approved'
));

CREATE POLICY "Public can view active institution documents"
ON public.institution_documents
FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can view all institution documents"
ON public.institution_documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create verification_requests table
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  document_reference TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_identifier TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  response_notes TEXT,
  responded_by UUID,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_requests
CREATE POLICY "Users can view their own requests"
ON public.verification_requests
FOR SELECT
USING (auth.uid() = requester_id);

CREATE POLICY "Users can insert verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Institutions can view requests to them"
ON public.verification_requests
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM institutions 
  WHERE institutions.id = verification_requests.institution_id 
  AND institutions.user_id = auth.uid()
  AND institutions.status = 'approved'
));

CREATE POLICY "Institutions can update requests to them"
ON public.verification_requests
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM institutions 
  WHERE institutions.id = verification_requests.institution_id 
  AND institutions.user_id = auth.uid()
  AND institutions.status = 'approved'
));

CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_documents_updated_at
BEFORE UPDATE ON public.institution_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();