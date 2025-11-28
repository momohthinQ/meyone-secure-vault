-- Drop dependent policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Officers can view pending documents" ON public.documents;
DROP POLICY IF EXISTS "Officers can insert verifications" ON public.document_verifications;

-- Now remove role from profiles table
ALTER TABLE public.profiles DROP COLUMN role;

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'officer', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create proper admin policy using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles 
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create officers policy on documents
CREATE POLICY "Officers can view pending documents" ON public.documents 
FOR SELECT USING (
  public.has_role(auth.uid(), 'officer') OR public.has_role(auth.uid(), 'admin')
);

-- Create officers policy on verifications
CREATE POLICY "Officers can insert verifications" ON public.document_verifications 
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'officer') OR public.has_role(auth.uid(), 'admin')
);

-- Update handle_new_user to also create default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;