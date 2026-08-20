-- Run this once in Supabase SQL Editor before deploying the account-deletion page.
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  reason text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.account_deletion_requests FROM anon, authenticated;
