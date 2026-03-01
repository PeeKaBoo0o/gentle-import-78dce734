
-- Contacts table for storing phone/email submissions
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_info TEXT NOT NULL,
  contact_type TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can insert contacts" ON public.contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated can read (admin)
CREATE POLICY "Authenticated can read contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (true);

-- Page visits tracking
CREATE TABLE public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL DEFAULT '/',
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert visits
CREATE POLICY "Anyone can insert visits" ON public.page_visits
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated can read
CREATE POLICY "Authenticated can read visits" ON public.page_visits
  FOR SELECT TO authenticated
  USING (true);
