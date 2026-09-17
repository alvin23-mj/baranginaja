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
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}_nama_bank`}
          className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
        >
          Nama bank
        </label>
        <select
          id={`${idPrefix}_nama_bank`}
          value={value.namaBank}
          onChange={(e) => onChange({ ...value, namaBank: e.target.value })}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        >
          <option value="" disabled>
            Pilih bank
          </option>
          {BANK_OPTIONS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
        {errors.namaBank && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.namaBank}</p>
        )}
      </div>

      {value.namaBank === "Lainnya" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${idPrefix}_nama_bank_lainnya`}
            className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
          >
            Nama bank lainnya
          </label>
          <input
            id={`${idPrefix}_nama_bank_lainnya`}
            type="text"
            value={value.namaBankLainnya}
            onChange={(e) => onChange({ ...value, namaBankLainnya: e.target.value })}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
          />
          {errors.namaBankLainnya && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.namaBankLainnya}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}_no_rekening`}
          className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
        >
          Nomor rekening
        </label>
        <input
          id={`${idPrefix}_no_rekening`}
          type="text"
          inputMode="numeric"
          value={value.noRekening}
          onChange={(e) => onChange({ ...value, noRekening: e.target.value })}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        {errors.noRekening && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.noRekening}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}_nama_pemilik_rekening`}
          className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
        >
          Nama pemilik rekening
        </label>
        <input
          id={`${idPrefix}_nama_pemilik_rekening`}
          type="text"
          value={value.namaPemilikRekening}
          onChange={(e) => onChange({ ...value, namaPemilikRekening: e.target.value })}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        {errors.namaPemilikRekening && (
          <p className="text-xs text-red-600 dark:text-red-400">
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
    errors.namaBank = "Pilih nama bank.";
  }
  if (value.namaBank === "Lainnya" && !value.namaBankLainnya.trim()) {
    errors.namaBankLainnya = "Nama bank wajib diisi.";
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
