"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Toast } from "@/components/toast";
import type { UserWithKampus } from "@/lib/types/database";
import {
  BankFields,
  resolveBankName,
  validateBankFields,
  type BankFieldsValue,
} from "./bank-fields";

const EMPTY_BANK_FIELDS: BankFieldsValue = {
  noRekening: "",
  namaBank: "",
  namaBankLainnya: "",
  namaPemilikRekening: "",
};

export function SellerSection({ user }: { user: UserWithKampus }) {
  const [isSeller, setIsSeller] = useState(user.is_seller);
  const [hasBankData, setHasBankData] = useState(Boolean(user.no_rekening));
  const [toggling, setToggling] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalValue, setModalValue] = useState<BankFieldsValue>(EMPTY_BANK_FIELDS);
  const [modalErrors, setModalErrors] = useState<
    Partial<Record<keyof BankFieldsValue, string>>
  >({});
  const [modalLoading, setModalLoading] = useState(false);

  const [bankValue, setBankValue] = useState<BankFieldsValue>({
    noRekening: user.no_rekening ?? "",
    namaBank: user.nama_bank ?? "",
    namaBankLainnya: "",
    namaPemilikRekening: user.nama_pemilik_rekening ?? "",
  });
  const [bankErrors, setBankErrors] = useState<
    Partial<Record<keyof BankFieldsValue, string>>
  >({});
  const [bankLoading, setBankLoading] = useState(false);
  const [bankToast, setBankToast] = useState<string | null>(null);
  const [isEditingBank, setIsEditingBank] = useState(!user.no_rekening);

  async function handleToggle() {
    setBlockMessage(null);

    if (!isSeller) {
      if (hasBankData) {
        await updateIsSeller(true);
      } else {
        setModalValue(EMPTY_BANK_FIELDS);
        setModalErrors({});
        setShowModal(true);
      }
      return;
    }

    setToggling(true);
    const supabase = createClient();
    const { data: activeOrders, error } = await supabase
      .from("products")
      .select("id")
      .eq("seller_id", user.id)
      .eq("status", "Dipesan")
      .limit(1);
    setToggling(false);

    if (error) {
      setBlockMessage(error.message);
      return;
    }

    if (activeOrders && activeOrders.length > 0) {
      setBlockMessage(
        "Masih ada produk berstatus \"Dipesan\". Selesaikan atau batalkan pesanan tersebut sebelum menonaktifkan mode penjual."
      );
      return;
    }

    await updateIsSeller(false);
  }

  async function updateIsSeller(next: boolean) {
    setToggling(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ is_seller: next })
      .eq("id", user.id);
    setToggling(false);

    if (error) {
      setBlockMessage(error.message);
      return;
    }

    setIsSeller(next);
    setToast(next ? "Mode Penjual diaktifkan. Anda bisa menjual barang sekarang!" : "Mode Penjual dinonaktifkan.");
  }

  async function handleModalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateBankFields(modalValue);
    setModalErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setModalLoading(true);
    const supabase = createClient();
    const namaBank = resolveBankName(modalValue);
    const { error } = await supabase
      .from("users")
      .update({
        no_rekening: modalValue.noRekening.trim(),
        nama_bank: namaBank,
        nama_pemilik_rekening: modalValue.namaPemilikRekening.trim(),
        is_seller: true,
      })
      .eq("id", user.id);
    setModalLoading(false);

    if (error) {
      setModalErrors({ noRekening: error.message });
      return;
    }

    setBankValue({ ...modalValue, namaBank, namaBankLainnya: "" });
    setHasBankData(true);
    setIsSeller(true);
    setShowModal(false);
    setIsEditingBank(false);
    setToast("Mode Penjual diaktifkan & data rekening tersimpan.");
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
    setHasBankData(true);
    setIsEditingBank(false);
    setBankToast("Data rekening pencairan berhasil diperbarui.");
  }

  return (
    <div className="space-y-5">
      {/* Seller Toggle Switch Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Status Hak Akses Penjual
            </h3>
            {isSeller ? (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                Aktif
              </span>
            ) : (
              <span className="rounded-full bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                Non-Aktif
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md pl-9">
            Aktifkan fitur ini untuk mulai mengunggah iklan dan pasang produk dagangan barang bekas Anda di BaranginAja.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isSeller}
          onClick={handleToggle}
          disabled={toggling}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer disabled:opacity-60 ${
            isSeller ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
              isSeller ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {blockMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <svg className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>{blockMessage}</div>
        </div>
      )}

      {/* Bank Account Information Card */}
      {isSeller && (
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
            {hasBankData && !isEditingBank && (
              <button
                type="button"
                onClick={() => setIsEditingBank(true)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Ubah Rekening
              </button>
            )}
          </div>

          {hasBankData && !isEditingBank ? (
            /* Bank Card Motif View */
            <div className="rounded-xl border border-zinc-800 bg-linear-to-r from-zinc-900 to-zinc-950 p-4 text-white shadow-md relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {bankValue.namaBank || user.nama_bank || "Bank / E-Wallet"}
                </span>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 font-mono">
                  TERVERIFIKASI
                </span>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Nomor Rekening</p>
                <p className="text-lg font-mono font-bold tracking-wider text-white">
                  {bankValue.noRekening || user.no_rekening}
                </p>
              </div>
              <div className="pt-1 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
                <span>Atas Nama: <strong className="text-white">{bankValue.namaPemilikRekening || user.nama_pemilik_rekening}</strong></span>
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
                {hasBankData && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(false)}
                    className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    Batal
                  </button>
                )}
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
      )}

      {/* Modal activation for missing bank data */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Lengkapi Data Rekening Pencairan
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Sebelum mengaktifkan mode penjual, mohon masukkan data rekening bank atau e-wallet untuk keperluan transfer hasil penjualan.
            </p>

            <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
              <BankFields
                idPrefix="modal"
                value={modalValue}
                onChange={setModalValue}
                errors={modalErrors}
              />
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {modalLoading ? "Menyimpan..." : "Simpan & Aktifkan Penjual"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      {bankToast && <Toast message={bankToast} onDismiss={() => setBankToast(null)} />}
    </div>
  );
}
