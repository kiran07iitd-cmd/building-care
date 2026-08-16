CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, mobile, google_account)
  VALUES (
    NEW.id,
    NULLIF(COALESCE(NEW.email, ''), ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'mobile', ''), NULLIF(COALESCE(NEW.phone, ''), ''), ''),
    CASE WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN NEW.email ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();