
-- Allow authenticated users to delete contacts (admin)
CREATE POLICY "Authenticated can delete contacts" ON public.contacts
  FOR DELETE TO authenticated
  USING (true);
