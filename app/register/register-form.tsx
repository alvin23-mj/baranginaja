"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { District } from "@/lib/types/database";

export function RegisterForm({ districts }: { districts: District[] }) {
  const router = useRouter();
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [noHp, setNoHp] = useState("");
  const [kecamatanId, setKecamatanId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!kecamatanId) {
      setError("Pilih kecamatan domisili di Surabaya terlebih dahulu.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Gagal membuat akun. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    const parsedKecamatanId = Number(kecamatanId);
    const insertPayload: Record<string, unknown> = {
      id: userId,
      nama_lengkap: namaLengkap,
      email,
      no_hp: noHp,
      kecamatan_id: isNaN(parsedKecamatanId) ? null : parsedKecamatanId,
      status_verifikasi: "pending",
      role: "buyer",
      is_seller: false,
    };

    const { error: insertError } = await supabase.from("users").insert(insertPayload);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/login?registered=1");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nama_lengkap" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Nama lengkap
        </label>
        <input
          id="nama_lengkap"
          name="nama_lengkap"
          type="text"
          required
          value={namaLengkap}
          onChange={(e) => setNamaLengkap(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="no_hp" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          No. HP (WhatsApp)
        </label>
        <input
          id="no_hp"
          name="no_hp"
          type="tel"
          required
          placeholder="08xxxxxxxxxx"
          value={noHp}
          onChange={(e) => setNoHp(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="kecamatan_id" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Kecamatan (Kota Surabaya)
        </label>
        <select
          id="kecamatan_id"
          name="kecamatan_id"
          required
          value={kecamatanId}
          onChange={(e) => setKecamatanId(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        >
          <option value="" disabled>
            Pilih Kecamatan Domisili
          </option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              Kec. {d.nama_kecamatan}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 h-11 w-full rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 cursor-pointer"
      >
        {loading ? "Mendaftar..." : "Daftar"}
      </button>
    </form>
  );
}
