"use client";

import { useState, type FormEvent, useRef, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Toast } from "@/components/toast";
import type { UserWithKampus } from "@/lib/types/database";
import {
  BankFields,
  resolveBankName,
  validateBankFields,
  type BankFieldsValue,
} from "./bank-fields";
import { FOTO_KTM_BUCKET, isValidFotoKtmFile, ALLOWED_FOTO_KTM_TYPES, MAX_FOTO_KTM_SIZE_BYTES } from "@/lib/supabase/storage";

const EMPTY_BANK_FIELDS: BankFieldsValue = {
  noRekening: "",
  namaBank: "",
  namaBankLainnya: "",
  namaPemilikRekening: "",
};

export function SellerSection({ user }: { user: UserWithKampus }) {
  const [isSeller, setIsSeller] = useState(user.is_seller);
  const [toast, setToast] = useState<string | null>(null);

  // Registration Form State
  const [modalValue, setModalValue] = useState<BankFieldsValue>(EMPTY_BANK_FIELDS);
  const [modalErrors, setModalErrors] = useState<Partial<Record<keyof BankFieldsValue, string>>>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // KTM Photo State
  const ktmInputRef = useRef<HTMLInputElement>(null);
  const [ktmFile, setKtmFile] = useState<File | null>(null);
  const [ktmError, setKtmError] = useState<string | null>(null);
  const ktmPreviewUrl = useMemo(() => ktmFile ? URL.createObjectURL(ktmFile) : null, [ktmFile]);

  useEffect(() => {
    return () => {
      if (ktmPreviewUrl) URL.revokeObjectURL(ktmPreviewUrl);
    };
  }, [ktmPreviewUrl]);

  // Edit Bank State (for existing sellers)
  const [bankValue, setBankValue] = useState<BankFieldsValue>({
    noRekening: user.no_rekening ?? "",
    namaBank: user.nama_bank ?? "",
    namaBankLainnya: "",
    namaPemilikRekening: user.nama_pemilik_rekening ?? "",
  });
  const [bankErrors, setBankErrors] = useState<Partial<Record<keyof BankFieldsValue, string>>>({});
  const [bankLoading, setBankLoading] = useState(false);
  const [bankToast, setBankToast] = useState<string | null>(null);
  const [isEditingBank, setIsEditingBank] = useState(!user.no_rekening && isSeller);

  function handleKtmSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setKtmError(null);
    const file = fileList[0];

    if (!isValidFotoKtmFile(file)) {
      setKtmError("Foto KTM harus berformat JPG/PNG/WEBP dan berukuran maksimal 5MB.");
      return;
    }
    setKtmFile(file);
  }

  function getExtension(type: string) {
    if (type === "image/png") return "png";
    if (type === "image/webp") return "webp";
    return "jpg";
  }

  async function handleRegisterSeller(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setKtmError(null);

    const nextErrors = validateBankFields(modalValue);
    setModalErrors(nextErrors);
    
    let hasError = Object.keys(nextErrors).length > 0;

    if (!ktmFile) {
      setKtmError("Foto KTM wajib diunggah.");
      hasError = true;
    }

    if (hasError) return;

    setModalLoading(true);
    const supabase = createClient();
    const namaBank = resolveBankName(modalValue);

    // Upload KTM Photo
    const ext = getExtension(ktmFile!.type);
    const fileName = `${user.id}-${Date.now()}.${ext}`;
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(FOTO_KTM_BUCKET)
      .upload(fileName, ktmFile!);

    if (uploadError) {
      setFormError("Gagal mengunggah foto KTM: " + uploadError.message);
      setModalLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from(FOTO_KTM_BUCKET)
      .getPublicUrl(uploadData.path);

    const { error } = await supabase
      .from("users")
      .update({
        no_rekening: modalValue.noRekening.trim(),
        nama_bank: namaBank,
        nama_pemilik_rekening: modalValue.namaPemilikRekening.trim(),
        foto_ktm: publicUrlData.publicUrl,
        is_seller: true,
      })
      .eq("id", user.id);

    setModalLoading(false);

    if (error) {
      setFormError("Gagal menyimpan data: " + error.message);
      return;
    }

    setBankValue({ ...modalValue, namaBank, namaBankLainnya: "" });
    setIsSeller(true);
    setIsEditingBank(false);
    setToast("Pendaftaran Penjual berhasil. Anda bisa menjual barang sekarang!");
  }

  async function handleBankSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateBankFields(bankValue);
    setBankErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setBankLoading(true);
    const supabase = createClient();
    const namaBank = resolveBankName(bankValue);
    const { error } = await supabase
      .from("users")
      .update({
        no_rekening: bankValue.noRekening.trim(),
        nama_bank: namaBank,
        nama_pemilik_rekening: bankValue.namaPemilikRekening.trim(),
      })
      .eq("id", user.id);
    setBankLoading(false);

    if (error) {
      setBankErrors({ noRekening: error.message });
      return;
    }

    setBankValue({ ...bankValue, namaBank, namaBankLainnya: "" });
    setIsEditingBank(false);
    setBankToast("Data rekening pencairan berhasil diperbarui.");
  }

  if (!isSeller) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
              Daftar Sebagai Penjual
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Lengkapi data rekening bank dan unggah foto KTM untuk mulai menjual barang. Setelah terdaftar, akun penjual tidak dapat dinonaktifkan.
            </p>
          </div>

          <form onSubmit={handleRegisterSeller} className="space-y-6">
            <BankFields
              idPrefix="register"
              value={modalValue}
              onChange={setModalValue}
              errors={modalErrors}
            />

            <div className="space-y-3">
              <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Foto KTM
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Wajib mengunggah foto Kartu Tanda Mahasiswa (KTM) yang masih berlaku.
              </p>
              
              <div className="flex gap-4 items-end">
                {ktmPreviewUrl && (
                  <div className="relative h-24 w-36 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <img src={ktmPreviewUrl} alt="Preview KTM" className="h-full w-full object-cover" />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => ktmInputRef.current?.click()}
                  className="rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {ktmFile ? "Ganti Foto KTM" : "Pilih Foto KTM"}
                </button>
              </div>
              
              <input
                ref={ktmInputRef}
                type="file"
                accept={ALLOWED_FOTO_KTM_TYPES.join(",")}
                className="hidden"
                onChange={(e) => handleKtmSelected(e.target.files)}
              />

              {(ktmError) && (
                <p className="text-xs text-red-600 dark:text-red-400">{ktmError}</p>
              )}
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <svg className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>{formError}</div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={modalLoading}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {modalLoading ? "Mendaftar..." : "Daftar Penjual"}
              </button>
            </div>
          </form>
        </div>
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </div>
    );
  }

  // View for already registered seller
  return (
    <div className="space-y-5">
      {/* Seller Active Status Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Status Hak Akses Penjual
            </h3>
            <span className="rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Aktif
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md pl-9">
            Akun Anda sudah terdaftar sebagai penjual aktif. Anda dapat mengunggah iklan dan menerima pesanan.
          </p>
        </div>
      </div>

      {/* Bank Account Information Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Rekening Pencairan Penjualan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Digunakan untuk transfer dana dari setiap transaksi penjualan Anda yang telah selesai.
            </p>
          </div>
          {!isEditingBank && (
            <button
              type="button"
              onClick={() => setIsEditingBank(true)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Ubah Rekening
            </button>
          )}
        </div>

        {!isEditingBank ? (
          /* Bank Card Motif View */
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-900 shadow-sm relative overflow-hidden space-y-3 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {bankValue.namaBank || user.nama_bank || "Bank / E-Wallet"}
              </span>
              <span className="text-[10px] bg-zinc-200 px-2 py-0.5 rounded text-zinc-600 font-mono dark:bg-zinc-700 dark:text-zinc-300">
                TERVERIFIKASI
              </span>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Nomor Rekening</p>
              <p className="text-lg font-mono font-bold tracking-wider text-zinc-900 dark:text-zinc-100">
                {bankValue.noRekening || user.no_rekening}
              </p>
            </div>
            <div className="pt-1 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <span>Atas Nama: <strong className="text-zinc-900 dark:text-zinc-100">{bankValue.namaPemilikRekening || user.nama_pemilik_rekening}</strong></span>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleBankSubmit} className="space-y-4 pt-1">
            <BankFields
              idPrefix="bank"
              value={bankValue}
              onChange={setBankValue}
              errors={bankErrors}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingBank(false)}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={bankLoading}
                className="rounded-xl bg-zinc-950 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {bankLoading ? "Menyimpan..." : "Simpan Data Rekening"}
              </button>
            </div>
          </form>
        )}
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      {bankToast && <Toast message={bankToast} onDismiss={() => setBankToast(null)} />}
    </div>
  );
}
