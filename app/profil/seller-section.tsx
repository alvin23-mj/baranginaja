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
    // Assumed schema: `products` table with `seller_id` + `status` columns.
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
    setToast(next ? "Mode penjual diaktifkan." : "Mode penjual dinonaktifkan.");
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
    setToast("Mode penjual diaktifkan. Kamu sekarang bisa menjual barang.");
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
    setBankToast("Data rekening berhasil diperbarui.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Jadi Penjual</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Aktifkan untuk mulai menjual barang di BaranginAja.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isSeller}
          onClick={handleToggle}
          disabled={toggling}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            isSeller ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
              isSeller ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {blockMessage && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {blockMessage}
        </p>
      )}

      {isSeller && (
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Data Rekening
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Perubahan data rekening akan digunakan untuk pencairan dana selanjutnya.
            </p>
          </div>
          <form onSubmit={handleBankSubmit} className="flex flex-col gap-4">
            <BankFields
              idPrefix="bank"
              value={bankValue}
              onChange={setBankValue}
              errors={bankErrors}
            />
            <button
              type="submit"
              disabled={bankLoading}
              className="h-11 w-full rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {bankLoading ? "Menyimpan..." : "Simpan Data Rekening"}
            </button>
          </form>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 className="mb-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              Lengkapi Data Rekening
            </h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Data ini wajib diisi sebelum kamu bisa mulai berjualan.
            </p>
            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              <BankFields
                idPrefix="modal"
                value={modalValue}
                onChange={setModalValue}
                errors={modalErrors}
              />
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-10 w-full rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="h-10 w-full rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {modalLoading ? "Menyimpan..." : "Simpan & Aktifkan"}
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
