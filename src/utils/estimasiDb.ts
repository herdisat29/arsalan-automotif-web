import { MasterSparepart, MasterJasa, EstimasiRecord } from "../types/estimasi";
import { db, auth } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Error helper conforming to firebase-integration guidelines
export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errMsg = error?.message || String(error);
  console.error(`Firestore DB Operation Error [${operationType}] on [${path}]:`, errMsg);
  
  if (errMsg.includes("Quota exceeded")) {
    const projId = "gen-lang-client-0705183203";
    const dbId = "ai-studio-e7d93cf8-93d5-40d3-9ee6-dbefeeec4ac1";
    console.error("Quota exceeded limit on Spark plan.");
    alert(`Batas kuota database harian Firebase tercapai (Quota exceeded). Silakan coba lagi besok saat kuota direset.\n\nDetail: https://console.firebase.google.com/project/${projId}/firestore/databases/${dbId}/data?openUpgradeDialog=true`);
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    operationType,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    }
  };

  const stringifiedErr = JSON.stringify(errInfo);
  console.error("Structured Firestore Error: ", stringifiedErr);
  throw new Error(stringifiedErr);
}

// Default Master Spareparts for Arsalan
const DEFAULT_SPAREPARTS: MasterSparepart[] = [
  { id: "sp-1", kode: "PRT-001", nama: "Oli Mesin Honda E-Pro Gold 0W-20 (1 Liter)", harga: 145000, kategori: "Oli" },
  { id: "sp-2", kode: "PRT-002", nama: "Filter Oli Honda Orisinal", harga: 45000, kategori: "Filter" },
  { id: "sp-3", kode: "PRT-003", nama: "Gasket Drain Plug Carter Oli", harga: 15400, kategori: "Kaki-kaki" },
  { id: "sp-4", kode: "PRT-004", nama: "Oli Transmisi Matic ATF DW-1 (1 Liter)", harga: 135000, kategori: "Oli" },
  { id: "sp-5", kode: "PRT-005", nama: "Busi Iridium Honda Orisinal (Per Pcs)", harga: 180000, kategori: "Mesin" },
  { id: "sp-6", kode: "PRT-006", nama: "Bushing Lower Arm Besar (Depan)", harga: 175000, kategori: "Kaki-kaki" },
  { id: "sp-7", kode: "PRT-007", nama: "Karet Link Stabilizer (Kiri/Kanan)", harga: 35000, kategori: "Kaki-kaki" },
  { id: "sp-8", kode: "PRT-008", nama: "Cairan Carbon Cleaner Engine Flush (250ml)", harga: 95000, kategori: "Mesin" },
  { id: "sp-9", kode: "PRT-009", nama: "Suku Cadang Magnet Clutch AC Set", harga: 380000, kategori: "AC" },
  { id: "sp-10", kode: "PRT-010", nama: "Freon R134a Premium & Oli Kompresor", harga: 150000, kategori: "AC" }
];

// Default Master Jasa (Labor) for Arsalan
const DEFAULT_JASA: MasterJasa[] = [
  { id: "js-1", kode: "SVC-001", nama: "Jasa Ganti Oli & General Checkup", harga: 50000 },
  { id: "js-2", kode: "SVC-002", nama: "Jasa Carbon Clean Pembersihan Ruang Bakar", harga: 250000 },
  { id: "js-3", kode: "SVC-003", nama: "Jasa Tune-Up Komplit & Throttle Clean", harga: 150000 },
  { id: "js-4", kode: "SVC-004", nama: "Jasa Bongkar Pasang & Press Bushing Arm (Per Roda)", harga: 150000 },
  { id: "js-5", kode: "SVC-005", nama: "Jasa Kuras Oli Transmisi Matic (Kuras Dan Bersih Body Valve)", harga: 500000 },
  { id: "js-6", kode: "SVC-006", nama: "Jasa Perbaikan AC Kurang Dingin / Isi Freon", harga: 150000 },
  { id: "js-7", kode: "SVC-007", nama: "Jasa Scan Diagnostik Launch OBD2 & Reset Error ECU", harga: 100000 }
];

const LOCAL_STORAGE_KEYS = {
  SPAREPARTS: "arsalan_master_spareparts",
  JASA: "arsalan_master_jasa",
  REC_HISTORY: "arsalan_estimasi_history"
};

let isSyncStarted = false;
let stopPartsListener: (() => void) | null = null;
let stopJasaListener: (() => void) | null = null;
let stopEstimasiListener: (() => void) | null = null;

// Database Initialization Helpers & API
export const EstimasiDb = {
  // --- MASTER SPAREPARTS ---
  getMasterSpareparts(): MasterSparepart[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.SPAREPARTS);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SPAREPARTS, JSON.stringify(DEFAULT_SPAREPARTS));
      return DEFAULT_SPAREPARTS;
    }
    return JSON.parse(data);
  },

  saveMasterSpareparts(parts: MasterSparepart[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SPAREPARTS, JSON.stringify(parts));
    // Dynamic Cloud Write Back (Fire & Forget to maintain raw performance)
    parts.forEach(part => {
      setDoc(doc(db, "spareparts", part.id), part)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `spareparts/${part.id}`));
    });
  },

  // --- MASTER JASA ---
  getMasterJasa(): MasterJasa[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.JASA);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.JASA, JSON.stringify(DEFAULT_JASA));
      return DEFAULT_JASA;
    }
    return JSON.parse(data);
  },

  saveMasterJasa(jasa: MasterJasa[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.JASA, JSON.stringify(jasa));
    // Dynamic Cloud Write Back
    jasa.forEach(js => {
      setDoc(doc(db, "jasa", js.id), js)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `jasa/${js.id}`));
    });
  },

  // --- ESTIMASI HISTORY ---
  getEstimasiHistory(): EstimasiRecord[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.REC_HISTORY);
    if (!data) return [];
    return JSON.parse(data);
  },

  saveEstimasiHistory(records: EstimasiRecord[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REC_HISTORY, JSON.stringify(records));
  },

  addEstimasi(record: EstimasiRecord): void {
    const history = this.getEstimasiHistory();
    const existingIndex = history.findIndex(r => r.id === record.id || r.noEstimasi === record.noEstimasi);
    if (existingIndex !== -1) {
      history[existingIndex] = record; // update in place
    } else {
      history.unshift(record); // add new to top
    }
    this.saveEstimasiHistory(history);

    // Save synchronously to persistent Cloud Firestore so database is safe
    setDoc(doc(db, "estimasi", record.id), record)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `estimasi/${record.id}`));
  },

  deleteEstimasi(id: string): void {
    const history = this.getEstimasiHistory();
    const updated = history.filter(r => r.id !== id);
    this.saveEstimasiHistory(updated);

    // Synchronously delete from Cloud Firestore so database is clean
    deleteDoc(doc(db, "estimasi", id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `estimasi/${id}`));
  },

  // --- RESET ALL DATA ---
  resetToDefaults(): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SPAREPARTS, JSON.stringify(DEFAULT_SPAREPARTS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.JASA, JSON.stringify(DEFAULT_JASA));
    
    // Push defaults back to cloud
    DEFAULT_SPAREPARTS.forEach(part => {
      setDoc(doc(db, "spareparts", part.id), part)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `spareparts/${part.id}`));
    });
    DEFAULT_JASA.forEach(js => {
      setDoc(doc(db, "jasa", js.id), js)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `jasa/${js.id}`));
    });
  },

  // --- REALTIME BACKEND SYNC LOOPER ---
  startFirebaseSync(onUpdate: () => void): void {
    if (isSyncStarted) return;
    isSyncStarted = true;

    // Check & Seed collections if they are entirely empty on Firestore
    getDocs(collection(db, "spareparts")).then((snap) => {
      if (snap.empty) {
        console.log("Seeding spareparts catalog to Firebase...");
        const initial = this.getMasterSpareparts();
        initial.forEach(p => {
          setDoc(doc(db, "spareparts", p.id), p)
            .catch(err => handleFirestoreError(err, OperationType.WRITE, `spareparts/${p.id}`));
        });
      }
    }).catch(err => handleFirestoreError(err, OperationType.GET, "spareparts"));

    getDocs(collection(db, "jasa")).then((snap) => {
      if (snap.empty) {
        console.log("Seeding jasa catalog to Firebase...");
        const initial = this.getMasterJasa();
        initial.forEach(j => {
          setDoc(doc(db, "jasa", j.id), j)
            .catch(err => handleFirestoreError(err, OperationType.WRITE, `jasa/${j.id}`));
        });
      }
    }).catch(err => handleFirestoreError(err, OperationType.GET, "jasa"));

    // Start reactive listening
    stopPartsListener = onSnapshot(collection(db, "spareparts"), (snapshot) => {
      const parts: MasterSparepart[] = [];
      snapshot.forEach(d => {
        parts.push(d.data() as MasterSparepart);
      });
      if (parts.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.SPAREPARTS, JSON.stringify(parts));
        onUpdate();
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "spareparts"));

    stopJasaListener = onSnapshot(collection(db, "jasa"), (snapshot) => {
      const jasa: MasterJasa[] = [];
      snapshot.forEach(d => {
        jasa.push(d.data() as MasterJasa);
      });
      if (jasa.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.JASA, JSON.stringify(jasa));
        onUpdate();
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "jasa"));

    stopEstimasiListener = onSnapshot(collection(db, "estimasi"), (snapshot) => {
      const list: EstimasiRecord[] = [];
      snapshot.forEach(d => {
        list.push(d.data() as EstimasiRecord);
      });
      // Sort desc based on ID or tanggal
      list.sort((a, b) => b.noEstimasi.localeCompare(a.noEstimasi) || new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      localStorage.setItem(LOCAL_STORAGE_KEYS.REC_HISTORY, JSON.stringify(list));
      onUpdate();
    }, (err) => handleFirestoreError(err, OperationType.GET, "estimasi"));
  },

  stopFirebaseSync(): void {
    isSyncStarted = false;
    if (stopPartsListener) { stopPartsListener(); stopPartsListener = null; }
    if (stopJasaListener) { stopJasaListener(); stopJasaListener = null; }
    if (stopEstimasiListener) { stopEstimasiListener(); stopEstimasiListener = null; }
  }
};

// --- RESTORE FROM EXCEL / CSV HELPERS ---
export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => 
    Object.values(row)
      .map(val => {
        let str = String(val);
        // escape double quotes
        str = str.replace(/"/g, '""');
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      })
      .join(",")
  );
  
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].trim().split(",");
  const result: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // basic CSV splitting (ignoring nested commas for simplicity or handling them basically)
    let inQuotes = false;
    let currentVal = "";
    const rowValues: string[] = [];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        rowValues.push(currentVal.trim());
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    rowValues.push(currentVal.trim());
    
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = rowValues[idx] || "";
    });
    result.push(obj);
  }
  return result;
}

// --- INDONESIAN TERBILANG (SPELL NUMBER IN WORDS) ---
export function numberToTerbilang(num: number): string {
  if (num === 0) return "Nol Rupiah";
  const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  
  function konversi(n: number): string {
    let temp = "";
    if (n < 12) {
      temp = " " + units[Math.floor(n)];
    } else if (n < 20) {
      temp = konversi(n - 10) + " Belas";
    } else if (n < 100) {
      temp = konversi(Math.floor(n / 10)) + " Puluh" + konversi(n % 10);
    } else if (n < 200) {
      temp = " Seratus" + konversi(n - 100);
    } else if (n < 1000) {
      temp = konversi(Math.floor(n / 100)) + " Ratus" + konversi(n % 100);
    } else if (n < 2000) {
      temp = " Seribu" + konversi(n - 1000);
    } else if (n < 1000000) {
      temp = konversi(Math.floor(n / 1000)) + " Ribu" + konversi(n % 1000);
    } else if (n < 1000000000) {
      temp = konversi(Math.floor(n / 1000000)) + " Juta" + konversi(n % 1000000);
    } else if (n < 1000000000000) {
      temp = konversi(Math.floor(n / 1000000000)) + " Milyar" + konversi(n % 1000000000);
    }
    return temp;
  }
  
  const hasil = konversi(num).trim().replace(/\s+/g, " ") + " Rupiah";
  return hasil.charAt(0).toUpperCase() + hasil.slice(1);
}

// generate random/sequential Estimation number (EST DD/MM XXXX) with auto-increment (resets monthly)
export function generateEstimasiNumber(): string {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const prefix = `EST ${day}/${month}`; // e.g. "EST 06/06"

  let history: EstimasiRecord[] = [];
  try {
    const data = localStorage.getItem("arsalan_estimasi_history");
    if (data) {
      history = JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading history for generating sequence number", e);
  }

  // Filter records belonging to the current month and year (monthly sequence)
  const currentMonthRecords = history.filter(r => {
    if (!r.noEstimasi) return false;

    // Check 1: By parsing the record date field
    if (r.tanggal) {
      const recDate = new Date(r.tanggal);
      if (!isNaN(recDate.getTime())) {
        if (recDate.getFullYear() === year && (recDate.getMonth() + 1) === (date.getMonth() + 1)) {
          return true;
        }
      }
    }

    // Check 2: Fallback to matching month sub-pattern in ESTIMASI string (e.g. "EST DD/MM")
    const match = r.noEstimasi.match(/EST \d{2}\/(\d{2})/i);
    if (match && match[1] === month) {
      return true;
    }

    return false;
  });

  let nextSeq = 1;
  if (currentMonthRecords.length > 0) {
    let maxSeq = 0;
    currentMonthRecords.forEach(r => {
      const trimmedVal = r.noEstimasi.trim();
      // Look for the sequence suffix number at the end of the format "EST DD/MM XXXX"
      const matches = trimmedVal.match(/\s+(\d+)$/);
      if (matches && matches[1]) {
        const seq = parseInt(matches[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    nextSeq = maxSeq + 1;
  }

  const seqFormatted = String(nextSeq).padStart(4, "0");
  return `${prefix} ${seqFormatted}`;
}

// Increment estimation number suffix by +1, keeping the prefix context as is
export function incrementEstimasiNumber(currentValue: string): string {
  if (!currentValue || !currentValue.trim()) {
    return generateEstimasiNumber();
  }
  
  // Match trailing digits (e.g., "005" in "ARS 06/06 005" or "012" in "ARL 06/10 012")
  const match = currentValue.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefixStr = match[1];
    const numStr = match[2];
    const nextVal = parseInt(numStr, 10) + 1;
    const paddedNext = String(nextVal).padStart(numStr.length, "0");
    return `${prefixStr}${paddedNext}`;
  }
  
  // Fallback: if no trailing digits are found, append a safe " 0001" suffix
  return `${currentValue.trim()} 0001`;
}

