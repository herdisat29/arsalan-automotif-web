export interface MasterSparepart {
  id: string;
  kode: string;
  nama: string;
  harga: number;
  kategori: string;
}

export interface MasterJasa {
  id: string;
  kode: string;
  nama: string;
  harga: number;
}

export interface EstimasiItemJasa {
  id: string;
  kode: string;
  pekerjaan: string;
  total: number;
}

export interface EstimasiItemSparepart {
  id: string;
  kode: string;
  nama: string;
  qty: number;
  hargaSatuan: number;
  diskonPercent: number; // Diskon in % (0 - 100)
  total: number;
}

export interface CustomerInfo {
  nama: string;
  telp: string;
  alamat: string;
  noPolisi: string;
  noRangka: string;
  model: string;
  odometer: string;
  lamaPekerjaan: string;
}

export interface EstimasiRecord {
  id: string;
  noEstimasi: string;
  tanggal: string;
  customer: CustomerInfo;
  jasaItems: EstimasiItemJasa[];
  sparepartItems: EstimasiItemSparepart[];
  totalJasa: number;
  totalSpareparts: number;
  total: number;
  usePpn: boolean;
  ppnAmount: number;
  grandTotal: number;
  dibuatOleh: string;
  disetujuiOleh: string;
  bankInfo: string;
  catatan: string;
  ketentuan?: string;
  status?: "pending" | "printed";
}
