
CREATE TABLE public.installed_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, app_id)
);

ALTER TABLE public.installed_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own installed apps"
ON public.installed_apps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can install apps"
ON public.installed_apps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can uninstall apps"
ON public.installed_apps FOR DELETE
USING (auth.uid() = user_id);
