'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Lock, LogOut, Search, Trash2, UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Room } from '@/types/draft7';
import { avatarKey, resizeImage } from '@/lib/draft7/avatars';
import { PlayerAvatar } from '@/components/draft7/sala/PlayerAvatar';

const PASSWORD_KEY = 'draft7_admin_password';

interface AvatarRow {
  name_key: string;
  name: string;
  avatar_url: string;
  updated_at: string;
}

async function api(password: string, init: RequestInit & { query?: string } = {}) {
  const res = await fetch(`/api/draft7/avatars${init.query ?? ''}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
  return json;
}

const PhotoCard: React.FC<{
  name: string;
  src?: string;
  busy: boolean;
  onUpload: (file: File) => void;
  onDelete?: () => void;
}> = ({ name, src, busy, onUpload, onDelete }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="relative group rounded-full"
        title="Cambiar foto"
      >
        <PlayerAvatar name={name} src={src} size="xl" className={busy ? 'opacity-40' : ''} />
        <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="size-6" />
        </span>
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </button>
      <span className="font-bold text-sm leading-tight line-clamp-2">{name}</span>
      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25"
        >
          {src ? 'Cambiar' : 'Subir foto'}
        </button>
        {src && onDelete && (
          <button
            onClick={onDelete}
            disabled={busy}
            className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            aria-label={`Borrar foto de ${name}`}
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
};

const Login: React.FC<{ onLogin: (password: string) => Promise<void> }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError('');
          try {
            await onLogin(password);
          } catch (err) {
            setError((err as Error).message);
          }
          setLoading(false);
        }}
        className="w-full max-w-sm flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Lock className="size-5" />
          </div>
          <div>
            <h1 className="font-black text-xl">Admin</h1>
            <p className="text-xs text-slate-400">Fotos de los jugadores</p>
          </div>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
        {error && (
          <p className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}
        <button
          disabled={!password || loading}
          className="h-12 rounded-xl bg-primary text-background-dark font-black disabled:opacity-40"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </motion.form>
    </div>
  );
};

export const Admin: React.FC = () => {
  const [password, setPassword] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<AvatarRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomPlayers, setRoomPlayers] = useState<string[] | null>(null);
  const [newName, setNewName] = useState('');
  const [filter, setFilter] = useState('');

  const load = useCallback(async (pwd: string) => {
    const json = await api(pwd);
    setAvatars(json.avatars ?? []);
  }, []);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(PASSWORD_KEY);
    } catch {
      // sin storage
    }
    if (saved) {
      load(saved)
        .then(() => setPassword(saved))
        .catch(() => sessionStorage.removeItem(PASSWORD_KEY));
    }
  }, [load]);

  const login = async (pwd: string) => {
    await load(pwd);
    setPassword(pwd);
    try {
      sessionStorage.setItem(PASSWORD_KEY, pwd);
    } catch {
      // sin storage: hay que volver a loguearse al recargar
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(PASSWORD_KEY);
    } catch {
      // sin storage
    }
    setPassword(null);
    setAvatars([]);
  };

  const upload = async (name: string, file: File) => {
    if (!password) return;
    setBusy(avatarKey(name));
    setError('');
    try {
      const image = await resizeImage(file);
      await api(password, { method: 'POST', body: JSON.stringify({ name, image }) });
      await load(password);
    } catch (err) {
      setError(`${name}: ${(err as Error).message}`);
    }
    setBusy(null);
  };

  const remove = async (name: string) => {
    if (!password) return;
    setBusy(avatarKey(name));
    setError('');
    try {
      await api(password, { method: 'DELETE', query: `?name=${encodeURIComponent(name)}` });
      await load(password);
    } catch (err) {
      setError(`${name}: ${(err as Error).message}`);
    }
    setBusy(null);
  };

  const loadRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { data, error: dbError } = await supabase
      .from('rooms')
      .select('state')
      .eq('id', roomCode.trim().toUpperCase())
      .single();
    if (dbError || !data) {
      setRoomPlayers(null);
      setError('No encontré esa sala.');
      return;
    }
    setRoomPlayers((data as Pick<Room, 'state'>).state.players.map((p) => p.name));
  };

  if (!password) {
    return (
      <div className="bg-background-dark text-white min-h-full">
        <Login onLogin={login} />
      </div>
    );
  }

  const byKey = Object.fromEntries(avatars.map((a) => [a.name_key, a]));
  const visible = avatars.filter((a) => a.name_key.includes(avatarKey(filter)));

  return (
    <div className="bg-background-dark text-white min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black italic">Fotos de jugadores</h1>
            <p className="text-slate-400 text-sm">
              Las fotos se asocian al nombre y aparecen en todas las salas.
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/5"
          >
            <LogOut className="size-4" />
            Salir
          </button>
        </div>

        {error && (
          <p className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form
            onSubmit={loadRoom}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3"
          >
            <h2 className="font-black">Cargar jugadores de una sala</h2>
            <div className="flex gap-2">
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Ej: VERDE-42"
                className="flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 uppercase font-mono outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                disabled={!roomCode.trim()}
                className="px-4 rounded-xl bg-primary text-background-dark font-bold disabled:opacity-40"
              >
                Ver
              </button>
            </div>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = newName.trim();
              if (!name) return;
              setRoomPlayers((prev) => Array.from(new Set([name, ...(prev ?? [])])));
              setNewName('');
            }}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3"
          >
            <h2 className="font-black">Agregar jugador por nombre</h2>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre como lo escriben en la lista"
                className="flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                disabled={!newName.trim()}
                className="px-4 rounded-xl bg-primary text-background-dark font-bold disabled:opacity-40"
                aria-label="Agregar"
              >
                <UserPlus className="size-4" />
              </button>
            </div>
          </form>
        </div>

        {roomPlayers && (
          <section className="flex flex-col gap-3">
            <h2 className="font-black text-lg">Para cargar ({roomPlayers.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {roomPlayers.map((name) => {
                const row = byKey[avatarKey(name)];
                return (
                  <PhotoCard
                    key={name}
                    name={name}
                    src={row?.avatar_url}
                    busy={busy === avatarKey(name)}
                    onUpload={(file) => upload(name, file)}
                    onDelete={() => remove(name)}
                  />
                );
              })}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-black text-lg">Fotos cargadas ({avatars.length})</h2>
            {avatars.length > 8 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Buscar…"
                  className="rounded-xl border border-white/15 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>
          {avatars.length === 0 ? (
            <p className="text-slate-500 italic text-sm">
              Todavía no hay fotos. Cargá una sala o agregá un jugador por nombre.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {visible.map((a) => (
                <PhotoCard
                  key={a.name_key}
                  name={a.name}
                  src={a.avatar_url}
                  busy={busy === a.name_key}
                  onUpload={(file) => upload(a.name, file)}
                  onDelete={() => remove(a.name)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
