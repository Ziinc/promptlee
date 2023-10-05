
CREATE OR REPLACE FUNCTION public.fn_trigger_free_credits() 
  RETURNS trigger
AS $$ 
BEGIN
  perform public.insert_free_credits(NEW.id, 50);
  return NEW;
END;
$$ LANGUAGE plpgsql security definer;