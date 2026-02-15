
CREATE POLICY "Users can update their own files"
ON public.user_files FOR UPDATE
USING (auth.uid() = user_id);
