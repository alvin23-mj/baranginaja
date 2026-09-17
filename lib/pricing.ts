export interface HargaBreakdown {
  hargaInput: number;
  markupRate: number;
  markupAmount: number;
  hargaJual: number;
}

export function getMarkupRate(hargaInput: number): number {
  if (hargaInput < 50_000) return 0.2;
  if (hargaInput < 100_000) return 0.15;
  return 0.1;
}

export function calculateHargaJual(hargaInput: number): HargaBreakdown {
  const markupRate = getMarkupRate(hargaInput);
  const markupAmount = Math.round(hargaInput * markupRate);
  return {
    hargaInput,
    markupRate,
    markupAmount,
    hargaJual: hargaInput + markupAmount,
  };
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export interface OngkirBreakdown {
  jarakKm: number;
  beratKg: number;
  ongkirRaw: number;
  ongkirFinal: number;
}

export function calculateOngkir(jarakKm: number, beratKg: number): OngkirBreakdown {
  const ongkirRaw = jarakKm * 2500 + beratKg * 5000;
  const ongkirFinal = Math.ceil(ongkirRaw / 5000) * 5000;
  return { jarakKm, beratKg, ongkirRaw, ongkirFinal };
}
