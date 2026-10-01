-- ─────────────────────────────────────────────────────────────────────────────
-- 018 · Alta de usuarios segura
-- handle_new_user tomaba el rol de raw_user_meta_data, que controla quien se
-- registra: con el registro público activo, cualquiera podía darse de alta
-- como admin enviando {"role": "admin"}. Ahora todo usuario nuevo nace como
-- founder; el rol solo lo cambia un admin (trigger protect_profile_fields).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'founder'
  );
  return new;
end;
$$;
