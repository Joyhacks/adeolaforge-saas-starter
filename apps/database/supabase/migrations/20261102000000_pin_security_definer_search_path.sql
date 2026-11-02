-- Pin search_path on SECURITY DEFINER functions.
-- A SECURITY DEFINER function runs with its owner's privileges. Without a
-- fixed search_path, a caller who can create objects in a schema earlier on
-- the path can shadow tables or functions the body uses and run their own
-- code with those privileges. An empty search_path forces every reference
-- to be schema-qualified; this function only calls auth.uid(), which is.
ALTER FUNCTION public.set_private_item_owner_id() SET search_path = '';
