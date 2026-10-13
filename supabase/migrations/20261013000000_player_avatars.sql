-- Fotos de jugadores para Draft7.
-- Ejecutar una vez en Supabase → SQL Editor.

create table if not exists public.player_avatars (
  name_key   text primary key,          -- nombre normalizado (sin acentos, minúsculas)
  name       text not null,             -- nombre tal como se cargó
  avatar_url text not null,             -- data URL JPEG 256x256
  updated_at timestamptz not null default now()
);

alter table public.player_avatars enable row level security;

-- Cualquiera puede ver las fotos; solo el servidor (service role) puede escribir.
drop policy if exists "player_avatars_public_read" on public.player_avatars;
create policy "player_avatars_public_read"
  on public.player_avatars for select
  to anon, authenticated
  using (true);

-- Realtime por cambios en la tabla rooms (respaldo del broadcast entre clientes).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end $$;
