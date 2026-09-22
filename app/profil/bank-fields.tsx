"use client";

import { BANK_OPTIONS } from "@/lib/constants";
import { isDigitsOnly } from "@/lib/validation";

export interface BankFieldsValue {
  noRekening: string;
  namaBank: string;
  namaBankLainnya: string;
  namaPemilikRekening: string;
}

export function BankFields({
  value,
  onChange,
  errors,
  idPrefix,
}: {
  value: BankFieldsValue;
  onChange: (value: BankFieldsValue) => void;
  errors: Partial<Record<keyof BankFieldsValue, string>>;
  idPrefix: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Nama Bank */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}_nama_bank`}
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Nama Bank / E-Wallet <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            id={`${idPrefix}_nama_bank`}
            value={value.namaBank}
            onChange={(e) => onChange({ ...value, namaBank: e.target.value })}
            className="h-10 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-8 text-xs font-medium text-zinc-950 shadow-2xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 transition-all"
          >
            <option value="" disabled>
              -- Pilih Bank / E-Wallet --
            </option>
            {BANK_OPTIONS.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
          <svg className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        {errors.namaBank && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.namaBank}</p>
        )}
      </div>

      {/* Nama Bank Lainnya */}
      {value.namaBank === "Lainnya" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${idPrefix}_nama_bank_lainnya`}
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Sebutkan Nama Bank / Layanan Lain <span className="text-rose-500">*</span>
          </label>
          <input
            id={`${idPrefix}_nama_bank_lainnya`}
            type="text"
            placeholder="Contoh: Bank Jatim / Seabank"
            value={value.namaBankLainnya}
            onChange={(e) => onChange({ ...value, namaBankLainnya: e.target.value })}
            className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-xs text-zinc-950 shadow-2xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 transition-all"
          />
          {errors.namaBankLainnya && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errors.namaBankLainnya}
            </p>
          )}
        </div>
      )}

      {/* Nomor Rekening */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}_no_rekening`}
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Nomor Rekening / No. HP E-Wallet <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id={`${idPrefix}_no_rekening`}
            type="text"
            inputMode="numeric"
            placeholder="1234567890"
            value={value.noRekening}
            onChange={(e) => onChange({ ...value, noRekening: e.target.value })}
            className="h-10 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3.5 text-xs font-mono text-zinc-950 shadow-2xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 transition-all"
          />
          <svg className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </div>
        {errors.noRekening && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.noRekening}</p>
        )}
      </div>

      {/* Nama Pemilik Rekening */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}_nama_pemilik_rekening`}
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Nama Pemilik Rekening (Sesuai Buku Tabungan/Akun) <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id={`${idPrefix}_nama_pemilik_rekening`}
            type="text"
            placeholder="Contoh: Budi Santoso"
            value={value.namaPemilikRekening}
            onChange={(e) => onChange({ ...value, namaPemilikRekening: e.target.value })}
            className="h-10 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3.5 text-xs text-zinc-950 shadow-2xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 transition-all"
          />
          <svg className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        {errors.namaPemilikRekening && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {errors.namaPemilikRekening}
          </p>
        )}
      </div>
    </div>
  );
}

export function validateBankFields(
  value: BankFieldsValue
): Partial<Record<keyof BankFieldsValue, string>> {
  const errors: Partial<Record<keyof BankFieldsValue, string>> = {};

  if (!value.namaBank) {
    errors.namaBank = "Pilih nama bank atau e-wallet.";
  }
  if (value.namaBank === "Lainnya" && !value.namaBankLainnya.trim()) {
    errors.namaBankLainnya = "Nama bank lainnya wajib diisi.";
  }
  if (!value.noRekening.trim()) {
    errors.noRekening = "Nomor rekening wajib diisi.";
  } else if (!isDigitsOnly(value.noRekening)) {
    errors.noRekening = "Nomor rekening hanya boleh berisi angka.";
  }
  if (!value.namaPemilikRekening.trim()) {
    errors.namaPemilikRekening = "Nama pemilik rekening wajib diisi.";
  }

  return errors;
}

export function resolveBankName(value: BankFieldsValue): string {
  return value.namaBank === "Lainnya" ? value.namaBankLainnya.trim() : value.namaBank;
}
