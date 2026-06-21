import React, { useState, useEffect } from "react";
import { 
  MasterSparepart, 
  MasterJasa, 
  EstimasiItemJasa, 
  EstimasiItemSparepart, 
  CustomerInfo, 
  EstimasiRecord 
} from "../types/estimasi";
import { EstimasiDb, generateEstimasiNumber, incrementEstimasiNumber } from "../utils/estimasiDb";
import { 
  Plus, Trash, Printer, Save, Database, Wrench, Package, Settings, History, 
  Sparkles, RefreshCw, AlertCircle, FileSpreadsheet, Check, ArrowRight, UserPlus,
  ChevronUp, ChevronDown, X
} from "lucide-react";

interface EstimasiFormProps {
  onOpenCMS: () => void;
  onOpenHistory: () => void;
  onOpenPrint: (record: EstimasiRecord) => void;
  loadRecordToEdit?: EstimasiRecord | null;
  clearEditRecord?: () => void;
  onDatabaseChange?: () => void;
}

export default function EstimasiForm({ 
  onOpenCMS, 
  onOpenHistory, 
  onOpenPrint, 
  loadRecordToEdit,
  clearEditRecord,
  onDatabaseChange
}: EstimasiFormProps) {
  // Stats calculations for pending / printed records
  const recordsHistory = EstimasiDb.getEstimasiHistory();
  const totalRecords = recordsHistory.length;
  const printedCount = recordsHistory.filter(r => r.status === "printed").length;
  const pendingCount = recordsHistory.filter(r => r.status !== "printed").length;

  // DB States
  const [masterParts, setMasterParts] = useState<MasterSparepart[]>([]);
  const [masterJasa, setMasterJasa] = useState<MasterJasa[]>([]);

  // Document Info
  const [usePpn, setUsePpn] = useState(false);
  const [noEstimasi, setNoEstimasi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [dibuatOleh, setDibuatOleh] = useState("Arsalan");
  const [bankInfo, setBankInfo] = useState(() => localStorage.getItem("arsalan_bank_info") || "Transfer Rekening Resmi Bengkel:\nBCA: XXX-XXX-XXXX (Atas Nama) • MANDIRI: XXX-XXX-XXXX (Atas Nama)");
  const [catatan, setCatatan] = useState("");
  const [ketentuan, setKetentuan] = useState(() => localStorage.getItem("arsalan_ketentuan") || "• Estimasi di atas belum termasuk suku cadang / penanganan tambahan jika ditemui problem sekunder.\n• Harga jasa dan komponen mengikat 14 hari sejak tanggal terbit estimasi ini.");

  // Customer Form State
  const [customer, setCustomer] = useState<CustomerInfo>({
    nama: "",
    telp: "",
    alamat: "",
    noPolisi: "",
    noRangka: "",
    model: "",
    odometer: "",
    lamaPekerjaan: "1 Hari"
  });

  // Dynamic rows state
  const [jasaItems, setJasaItems] = useState<EstimasiItemJasa[]>([]);
  const [sparepartItems, setSparepartItems] = useState<EstimasiItemSparepart[]>([]);

  // Search/Filters in form dropdowns (helper)
  const [jasaSearchText, setJasaSearchText] = useState<Record<number, string>>({});
  const [partSearchText, setPartSearchText] = useState<Record<number, string>>({});

  // Status message
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load master data & Generate initial invoice number
  useEffect(() => {
    setMasterParts(EstimasiDb.getMasterSpareparts());
    setMasterJasa(EstimasiDb.getMasterJasa());
    
    if (loadRecordToEdit) {
      // populate editor with saved record!
      setNoEstimasi(loadRecordToEdit.noEstimasi);
      setTanggal(loadRecordToEdit.tanggal);
      setDibuatOleh(loadRecordToEdit.dibuatOleh);
      setBankInfo(loadRecordToEdit.bankInfo);
      setCatatan(loadRecordToEdit.catatan);
      setKetentuan(loadRecordToEdit.ketentuan || localStorage.getItem("arsalan_ketentuan") || "• Estimasi di atas belum termasuk suku cadang / penanganan tambahan jika ditemui problem sekunder.\n• Harga jasa dan komponen mengikat 14 hari sejak tanggal terbit estimasi ini.");
      setCustomer(loadRecordToEdit.customer);
      setJasaItems(loadRecordToEdit.jasaItems);
      setSparepartItems(loadRecordToEdit.sparepartItems);
      setUsePpn(loadRecordToEdit.usePpn);
    } else {
      setNoEstimasi(generateEstimasiNumber());
      // format date as YYYY-MM-DD for standard html input
      const today = new Date().toISOString().split("T")[0];
      setTanggal(today);
      setDibuatOleh("Arsalan");
      setBankInfo(localStorage.getItem("arsalan_bank_info") || "Transfer Rekening Resmi Bengkel:\nBCA: XXX-XXX-XXXX (Atas Nama) • MANDIRI: XXX-XXX-XXXX (Atas Nama)");
      setCatatan("");
      setKetentuan(localStorage.getItem("arsalan_ketentuan") || "• Estimasi di atas belum termasuk suku cadang / penanganan tambahan jika ditemui problem sekunder.\n• Harga jasa dan komponen mengikat 14 hari sejak tanggal terbit estimasi ini.");
      setCustomer({
        nama: "",
        telp: "",
        alamat: "",
        noPolisi: "",
        noRangka: "",
        model: "",
        odometer: "",
        lamaPekerjaan: "1 Hari"
      });
      setUsePpn(false);
      
      // Seed initial blank rows for better experience
      setJasaItems([
        { id: "js-init-0", kode: "", pekerjaan: "", total: 0 }
      ]);
      setSparepartItems([
        { id: "sp-init-0", kode: "", nama: "", qty: 1, hargaSatuan: 0, diskonPercent: 0, total: 0 }
      ]);
    }
  }, [loadRecordToEdit]);

  const showAlert = (message: string, type: "success" | "error" = "success") => {
    setAlert({ message, type });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setAlert(null), 4000);
  };

  const incrementDocNo = () => {
    const nextVal = incrementEstimasiNumber(noEstimasi);
    setNoEstimasi(nextVal);
    showAlert(`Nomor sequence diperbarui ke: ${nextVal}`);
  };

  // --- SUB-TOTAL & LIVE CALCULATIONS ---
  const totalJasa = jasaItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const totalSpareparts = sparepartItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const subtotal = totalJasa + totalSpareparts;
  const ppnAmount = usePpn ? Math.round(subtotal * 0.11) : 0;
  const grandTotal = subtotal + ppnAmount;

  // --- JASA ACTIONS ---
  const handleAddJasaRow = () => {
    const newRow: EstimasiItemJasa = {
      id: "js-row-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      kode: "",
      pekerjaan: "",
      total: 0
    };
    setJasaItems([...jasaItems, newRow]);
  };

  const handleDeleteJasaRow = (id: string) => {
    setJasaItems(jasaItems.filter(item => item.id !== id));
  };

  const handleJasaRowChange = (id: string, field: keyof EstimasiItemJasa, value: any) => {
    setJasaItems(jasaItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSelectMasterJasa = (id: string, masterItem: MasterJasa) => {
    setJasaItems(jasaItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          kode: masterItem.kode,
          pekerjaan: masterItem.nama,
          total: masterItem.harga
        };
      }
      return item;
    }));
  };

  const moveJasaItem = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= jasaItems.length) return;
    const newItems = [...jasaItems];
    const [temp] = newItems.splice(index, 1);
    newItems.splice(nextIndex, 0, temp);
    setJasaItems(newItems);
  };

  const moveSparepartItem = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sparepartItems.length) return;
    const newItems = [...sparepartItems];
    const [temp] = newItems.splice(index, 1);
    newItems.splice(nextIndex, 0, temp);
    setSparepartItems(newItems);
  };

  // --- SPAREPART ACTIONS ---
  const handleAddPartRow = () => {
    const newRow: EstimasiItemSparepart = {
      id: "sp-row-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      kode: "",
      nama: "",
      qty: 1,
      hargaSatuan: 0,
      diskonPercent: 0,
      total: 0
    };
    setSparepartItems([...sparepartItems, newRow]);
  };

  const handleDeletePartRow = (id: string) => {
    setSparepartItems(sparepartItems.filter(item => item.id !== id));
  };

  const handlePartRowChange = (id: string, field: keyof EstimasiItemSparepart, value: any) => {
    setSparepartItems(sparepartItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate row total live
        const rawTotal = (Number(updated.qty) || 0) * (Number(updated.hargaSatuan) || 0);
        const discountFactor = 1 - (Number(updated.diskonPercent) || 0) / 100;
        updated.total = Math.round(rawTotal * discountFactor);
        return updated;
      }
      return item;
    }));
  };

  const handleSelectMasterPart = (id: string, masterItem: MasterSparepart) => {
    setSparepartItems(sparepartItems.map(item => {
      if (item.id === id) {
        const qty = item.qty || 1;
        const discountFactor = 1 - (item.diskonPercent || 0) / 100;
        return {
          ...item,
          kode: masterItem.kode,
          nama: masterItem.nama,
          hargaSatuan: masterItem.harga,
          total: Math.round(qty * masterItem.harga * discountFactor)
        };
      }
      return item;
    }));
  };

  // Fast Auto-fill presets for Demo/Testing
  const handleLoadSampleVehicle = (preset: "jazz-kaki" | "civic-tuneup" | "alphard-gluduk") => {
    if (preset === "jazz-kaki") {
      setCustomer({
        nama: "DODI EFFENDI",
        telp: "0822-2592-9212",
        alamat: "JL. DUTA XI BLOK PP 19 RT007/RW023 BOJONG RAWALUMBU BEKASI",
        noPolisi: "B 2462 KIE",
        noRangka: "JM6KF2WLAM0699365",
        model: "MAZDA CX-5 2.5L 6AT GT+",
        odometer: "7396",
        lamaPekerjaan: "1 Hari"
      });

      // preset items matching the exact user uploaded Mazda Sultan Agung receipt!
      setJasaItems([
        { id: "js-p1", kode: "20130800055242", pekerjaan: "ENGINE OIL, CHANGE", total: 400000 },
        { id: "js-p2", kode: "SVC060824HHOCC", pekerjaan: "HHO CARBON CLEANING", total: 350000 }
      ]);

      setSparepartItems([
        { id: "sp-p1", kode: "995641400", nama: "GASKET", qty: 1, hargaSatuan: 15400, diskonPercent: 0, total: 15400 },
        { id: "sp-p2", kode: "PE0114302TT", nama: "OIL FILTER", qty: 1, hargaSatuan: 105700, diskonPercent: 0, total: 105700 },
        { id: "sp-p3", kode: "M-160223EFM", nama: "ENGINE FLUSH MACH", qty: 1, hargaSatuan: 450000, diskonPercent: 0, total: 450000 },
        { id: "sp-p4", kode: "K001W00021", nama: "MGO 0W/20", qty: 5, hargaSatuan: 233200, diskonPercent: 0, total: 1166000 }
      ]);
      setUsePpn(true);
      showAlert("Preset data persis Gambar Mazda terpasang lengkap (dengan PPN 11%)!");
    } else if (preset === "civic-tuneup") {
      setCustomer({
        nama: "BUDI HARTONO",
        telp: "0812-9482-1144",
        alamat: "Vila Galaxy Blok A-4, Jakasetia, Bekasi Selatan",
        noPolisi: "B 1878 TQ",
        noRangka: "MHRFC1829...",
        model: "HONDA CIVIC 1.5 TURBO SEDAN",
        odometer: "34890",
        lamaPekerjaan: "1 Hari"
      });

      setJasaItems([
        { id: "js-c1", kode: "SVC-002", pekerjaan: "Jasa Carbon Clean Pembersihan Ruang Bakar", total: 250000 },
        { id: "js-c2", kode: "SVC-003", pekerjaan: "Jasa Tune-Up Komplit & Throttle Clean", total: 150000 }
      ]);

      setSparepartItems([
        { id: "sp-c1", kode: "PRT-008", nama: "Cairan Carbon Cleaner Engine Flush (250ml)", qty: 2, hargaSatuan: 95000, diskonPercent: 10, total: 171000 },
        { id: "sp-c2", kode: "PRT-005", nama: "Busi Iridium Honda Orisinal (Per Pcs)", qty: 4, hargaSatuan: 180000, diskonPercent: 0, total: 720000 },
        { id: "sp-c3", kode: "PRT-001", nama: "Oli Mesin Honda E-Pro Gold 0W-20 (1 Liter)", qty: 4, hargaSatuan: 145000, diskonPercent: 5, total: 551000 }
      ]);
      setUsePpn(false);
      showAlert("Preset Tune-Up Honda Civic terpasang!");
    }
  };

  // --- SAVE DOCUMENT TO DATABASE ---
  const handleSaveToDatabase = () => {
    if (!customer.nama) {
      showAlert("Harap isi minimal Nama Pelanggan sebelum menyimpan!", "error");
      return;
    }

    const filteredJasa = jasaItems.filter(item => item.pekerjaan.trim() !== "");
    const filteredParts = sparepartItems.filter(item => item.nama.trim() !== "");

    if (filteredJasa.length === 0 && filteredParts.length === 0) {
      showAlert("Tolong isi minimal satu baris jasa atau sparepart yang valid!", "error");
      return;
    }

    // Check for duplicate No Estimasi (excluding itself when editing)
    const duplicate = EstimasiDb.getEstimasiHistory().find(r => 
      r.noEstimasi.trim().toUpperCase() === noEstimasi.trim().toUpperCase() && 
      (!loadRecordToEdit || r.id !== loadRecordToEdit.id)
    );
    if (duplicate) {
      showAlert(`⚠️ No. Estimasi "${noEstimasi}" sudah terpakai oleh pelanggan "${duplicate.customer.nama}" (${duplicate.customer.model || 'Tanpa Tipe'})! Silakan klik tombol 'NEW +1' di samping No. Estimasi untuk menaikkan sequence, atau ganti manual.`, "error");
      return;
    }

    const newRecord: EstimasiRecord = {
      id: loadRecordToEdit?.id || "est-" + Date.now(),
      noEstimasi,
      tanggal,
      customer,
      jasaItems: filteredJasa,
      sparepartItems: filteredParts,
      totalJasa,
      totalSpareparts,
      total: subtotal,
      usePpn,
      ppnAmount,
      grandTotal,
      dibuatOleh,
      disetujuiOleh: customer.nama,
      bankInfo,
      catatan,
      ketentuan,
      status: loadRecordToEdit?.status || "pending"
    };

    // Save to LocalDB
    EstimasiDb.addEstimasi(newRecord);
    if (onDatabaseChange) onDatabaseChange();
    
    if (clearEditRecord) clearEditRecord();

    showAlert(`Estimasi ${noEstimasi} atas nama ${customer.nama} berhasil diarsipkan ke database!`, "success");
  };

  // --- PROCEED TO PRINT (A4 / Half) ---
  const handleGeneratePrint = () => {
    if (!customer.nama) {
      showAlert("Harap isi Nama Pelanggan sebelum masuk ke print preview!", "error");
      return;
    }

    const filteredJasa = jasaItems.filter(item => item.pekerjaan.trim() !== "");
    const filteredParts = sparepartItems.filter(item => item.nama.trim() !== "");

    // Check for duplicate No Estimasi (excluding itself when editing)
    const duplicate = EstimasiDb.getEstimasiHistory().find(r => 
      r.noEstimasi.trim().toUpperCase() === noEstimasi.trim().toUpperCase() && 
      (!loadRecordToEdit || r.id !== loadRecordToEdit.id)
    );
    if (duplicate) {
      showAlert(`⚠️ No. Estimasi "${noEstimasi}" sudah terpakai oleh pelanggan "${duplicate.customer.nama}" (${duplicate.customer.model || 'Tanpa Tipe'})! Silakan klik tombol 'NEW +1' di samping No. Estimasi untuk menaikkan sequence, atau ganti manual.`, "error");
      return;
    }

    const newRecord: EstimasiRecord = {
      id: loadRecordToEdit?.id || "est-" + Date.now(),
      noEstimasi,
      tanggal,
      customer,
      jasaItems: filteredJasa,
      sparepartItems: filteredParts,
      totalJasa,
      totalSpareparts,
      total: subtotal,
      usePpn,
      ppnAmount,
      grandTotal,
      dibuatOleh,
      disetujuiOleh: customer.nama,
      bankInfo,
      catatan,
      ketentuan,
      status: "printed"
    };

    // Auto-save first
    EstimasiDb.addEstimasi(newRecord);
    if (onDatabaseChange) onDatabaseChange();
    // Callback to open Print View
    onOpenPrint(newRecord);
  };

  return (
    <div id="estimasi-generator-workspace" className="bg-slate-50 min-h-screen pb-16">
      
      {/* Alert Header Toast */}
      {alert && (
        <div className={`fixed top-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl border ${
          alert.type === "error" 
            ? "bg-red-50 text-red-800 border-red-200" 
            : "bg-emerald-50 text-emerald-800 border-emerald-200"
        }`}>
          <div className={`p-1 rounded-lg ${alert.type === "error" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
            {alert.type === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </div>
          <span className="text-xs font-black">{alert.message}</span>
        </div>
      )}

      {/* Editor Sub-Header quick presets option bar */}
      <div className="bg-slate-100 border-b border-slate-200 py-3.5 px-4 sm:px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-extrabold">🚀 Preset Muat Cepat:</span>
            <button
              onClick={() => handleLoadSampleVehicle("jazz-kaki")}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[10.5px] font-black rounded-lg transition uppercase flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-red-600 animate-pulse" />
              <span>Sesuai Foto Mazda Sultan Agung</span>
            </button>
            <button
              onClick={() => handleLoadSampleVehicle("civic-tuneup")}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 text-[10.5px] font-bold rounded-lg transition uppercase cursor-pointer"
            >
              Preset Honda Civic Tune-up
            </button>
          </div>
          
          <div className="flex items-center space-x-3 text-[10px] text-slate-450 font-mono font-bold uppercase">
            <span>Editor Workspace Aktif</span>
            {loadRecordToEdit && (
              <button
                type="button"
                onClick={() => {
                  if (clearEditRecord) clearEditRecord();
                  showAlert("Berhasil membatalkan mode edit, editor dikosongkan.", "success");
                }}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-black rounded-lg transition uppercase cursor-pointer"
              >
                Batal Edit (Buat Baru)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor Workspace Column Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Customer Information + Service Information Form */}
        <div className="lg:col-span-12 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full"></span>
                <span>I. Identitas Pelanggan &amp; Deskripsi Unit Mobil</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400 lowercase italic">autofill-friendly</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
              {/* Customer Column */}
              <div className="md:col-span-6 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Nama Customer / Pemilik Mobil <span className="text-red-600 font-bold">*</span></label>
                  <input
                    type="text"
                    value={customer.nama}
                    onChange={e => setCustomer({ ...customer, nama: e.target.value.toUpperCase() })}
                    placeholder=""
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Nomor Telp / WhatsApp <span className="text-red-600 font-bold">*</span></label>
                  <input
                    type="text"
                    value={customer.telp}
                    onChange={e => setCustomer({ ...customer, telp: e.target.value })}
                    placeholder=""
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Alamat Lengkap Rumah</label>
                  <textarea
                    value={customer.alamat}
                    onChange={e => setCustomer({ ...customer, alamat: e.target.value.toUpperCase() })}
                    placeholder=""
                    rows={2}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition resize-none"
                  />
                </div>
              </div>

              {/* Vehicle Characteristics Column */}
              <div className="md:col-span-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">No. Polisi / Plat <span className="text-red-600 font-bold">*</span></label>
                  <input
                    type="text"
                    value={customer.noPolisi}
                    onChange={e => setCustomer({ ...customer, noPolisi: e.target.value.toUpperCase() })}
                    placeholder=""
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Model / Tipe Mobil <span className="text-red-600 font-bold">*</span></label>
                  <input
                    type="text"
                    value={customer.model}
                    onChange={e => setCustomer({ ...customer, model: e.target.value.toUpperCase() })}
                    placeholder=""
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">No. Rangka Kendaraan</label>
                  <input
                    type="text"
                    value={customer.noRangka}
                    onChange={e => setCustomer({ ...customer, noRangka: e.target.value.toUpperCase() })}
                    placeholder=""
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Odometer (KM Saat Ini)</label>
                  <input
                    type="number"
                    value={customer.odometer}
                    onChange={e => setCustomer({ ...customer, odometer: e.target.value })}
                    placeholder=""
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Estimasi Lama Kerja</label>
                  <input
                    type="text"
                    value={customer.lamaPekerjaan}
                    onChange={e => setCustomer({ ...customer, lamaPekerjaan: e.target.value })}
                    placeholder=""
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Tanggal Terbit</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ROWS: II. ESTIMASI JASA WORKLIST */}
        <div className="lg:col-span-12 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="p-1 px-2.5 bg-neutral-900 text-white rounded font-mono text-[9.5px]">I</span>
                <span>Estimasi Jasa Pekerjaan (Labor)</span>
              </h3>
              <button
                type="button"
                onClick={handleAddJasaRow}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[10.5px] font-extrabold rounded-xl uppercase flex items-center space-x-1 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jasa</span>
              </button>
            </div>

            {/* Jasa table form rows container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-neutral-50 font-mono text-[9px] text-neutral-400 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10 text-center font-bold">No</th>
                    <th className="py-2.5 px-3 w-40 font-bold">Opsi Auto-Suggest (CMS)</th>
                    <th className="py-2.5 px-3 w-32 font-bold">Kode Manual</th>
                    <th className="py-2.5 px-3 font-bold">Deskripsi Pekerjaan Jasa (Bisa Ditulis Bebas)</th>
                    <th className="py-2.5 px-3 w-40 text-right font-bold">Total Jasa (Rp)</th>
                    <th className="py-2.5 px-3 w-28 text-center font-bold">Urutan &amp; Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {jasaItems.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition">
                      
                      <td className="py-3 px-3 text-center text-xs font-mono font-bold text-slate-400">
                        {index + 1}
                      </td>

                      {/* Dropdown Autosuggest */}
                      <td className="py-3 px-2">
                        <select
                          className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-xl focus:border-red-500 transition outline-none max-w-[155px]"
                          defaultValue=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const match = masterJasa.find(mj => mj.id === val);
                              if (match) handleSelectMasterJasa(row.id, match);
                            }
                            e.target.value = ""; // clear selector
                          }}
                        >
                          <option value="" disabled>-- Pilih Standard --</option>
                          {masterJasa.map(mj => (
                            <option key={mj.id} value={mj.id}>
                              {mj.nama} (Rp {mj.harga.toLocaleString("id-ID")})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Kode Row */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={row.kode}
                          onChange={e => handleJasaRowChange(row.id, "kode", e.target.value.toUpperCase())}
                          placeholder="Kode"
                          className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-red-500 transition"
                        />
                      </td>

                      {/* Pekerjaan Description (Bisa tulis bebas!) */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={row.pekerjaan}
                          onChange={e => handleJasaRowChange(row.id, "pekerjaan", e.target.value)}
                          placeholder="Tulis jenis pekerjaan di sini..."
                          className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-red-500 transition"
                        />
                      </td>

                      {/* Total Labor Rate (Auto formatted with dots!) */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={row.total ? row.total.toLocaleString("id-ID") : ""}
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, "");
                            handleJasaRowChange(row.id, "total", raw ? parseInt(raw, 10) : 0);
                          }}
                          placeholder="Laba/Jasa"
                          className="w-full text-xs font-bold font-mono text-right text-slate-950 bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-red-500 transition"
                        />
                      </td>

                      {/* Order Up, Down & Delete Actions */}
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => moveJasaItem(index, "up")}
                            disabled={index === 0}
                            className={`p-1 rounded transition ${
                              index === 0 
                                ? "text-neutral-200 cursor-not-allowed" 
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            }`}
                            title="Geser Ke Atas"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveJasaItem(index, "down")}
                            disabled={index === jasaItems.length - 1}
                            className={`p-1 rounded transition ${
                              index === jasaItems.length - 1 
                                ? "text-neutral-200 cursor-not-allowed" 
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            }`}
                            title="Geser Ke Bawah"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteJasaRow(row.id)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                            title="Hapus baris"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Sum footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-mono">Jumlah Baris Jasa: {jasaItems.length}</span>
              <div className="text-right">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Subtotal Jasa</span>
                <span className="text-sm font-black text-neutral-900 font-mono">Rp {totalJasa.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ROWS: III. ESTIMASI SPAREPARTS / COMPONENT WORKLIST */}
        <div className="lg:col-span-12 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="p-1 px-2.5 bg-neutral-900 text-white rounded font-mono text-[9.5px]">II</span>
                <span>Estimasi Suku Cadang &amp; Spareparts</span>
              </h3>
              <button
                type="button"
                onClick={handleAddPartRow}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[10.5px] font-extrabold rounded-xl uppercase flex items-center space-x-1 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Sparepart</span>
              </button>
            </div>

            {/* Sparepart table form rows container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-neutral-50 font-mono text-[9px] text-neutral-400 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10 text-center font-bold">No</th>
                    <th className="py-2.5 px-3 w-40 font-bold">Opsi Auto-Suggest (CMS)</th>
                    <th className="py-2.5 px-3 w-28 font-bold">Kode Manual</th>
                    <th className="py-2.5 px-3 font-bold">Nama Komponen / Oli (Bisa Ditulis Bebas)</th>
                    <th className="py-2.5 px-3 w-16 text-center font-bold">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right font-bold">Harga Satuan (Rp)</th>
                    <th className="py-2.5 px-3 w-20 text-center font-bold">Diskon (%)</th>
                    <th className="py-2.5 px-3 w-36 text-right font-bold">Total (Rp)</th>
                    <th className="py-2.5 px-3 w-28 text-center font-bold">Urutan &amp; Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {sparepartItems.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition">
                      
                      <td className="py-3 px-3 text-center text-xs font-mono font-bold text-slate-400">
                        {index + 1}
                      </td>

                      {/* Dropdown Autosuggest */}
                      <td className="py-3 px-2">
                        <select
                          className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-xl focus:border-red-500 transition outline-none max-w-[155px]"
                          defaultValue=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const match = masterParts.find(mp => mp.id === val);
                              if (match) handleSelectMasterPart(row.id, match);
                            }
                            e.target.value = ""; // clear selector
                          }}
                        >
                          <option value="" disabled>-- Pilih Komponen --</option>
                          {masterParts.map(mp => (
                            <option key={mp.id} value={mp.id}>
                              {mp.nama} (Rp {mp.harga.toLocaleString("id-ID")})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Kode Row */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={row.kode}
                          onChange={e => handlePartRowChange(row.id, "kode", e.target.value.toUpperCase())}
                          placeholder="Kode"
                          className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-red-500 transition"
                        />
                      </td>

                      {/* Sparepart name manual override */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={row.nama}
                          onChange={e => handlePartRowChange(row.id, "nama", e.target.value)}
                          placeholder="Tulis barang..."
                          className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-red-500 transition"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={row.qty || ""}
                          min="1"
                          onChange={e => handlePartRowChange(row.id, "qty", Number(e.target.value))}
                          placeholder="Qty"
                          className="w-full text-xs font-black font-mono text-center text-slate-900 bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-red-500 transition"
                        />
                      </td>

                      {/* Harga Satuan (Auto formatted with dots!) */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={row.hargaSatuan ? row.hargaSatuan.toLocaleString("id-ID") : ""}
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, "");
                            handlePartRowChange(row.id, "hargaSatuan", raw ? parseInt(raw, 10) : 0);
                          }}
                          placeholder="Harga"
                          className="w-full text-xs font-bold font-mono text-right text-slate-850 bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-red-500 transition"
                        />
                      </td>

                      {/* Discount % */}
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={row.diskonPercent || ""}
                          min="0"
                          max="100"
                          onChange={e => handlePartRowChange(row.id, "diskonPercent", Number(e.target.value))}
                          placeholder="0"
                          className="w-full text-xs font-bold font-mono text-center text-red-600 bg-white border border-slate-200 p-2 rounded-xl outline-none focus:border-red-500 transition"
                        />
                      </td>

                      {/* Row Total live computed */}
                      <td className="py-3 px-2 font-mono font-bold text-right text-slate-950 text-xs">
                        Rp {row.total.toLocaleString("id-ID")}
                      </td>

                      {/* Order Up, Down & Delete Actions */}
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => moveSparepartItem(index, "up")}
                            disabled={index === 0}
                            className={`p-1 rounded transition ${
                              index === 0 
                                ? "text-neutral-200 cursor-not-allowed" 
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            }`}
                            title="Geser Ke Atas"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSparepartItem(index, "down")}
                            disabled={index === sparepartItems.length - 1}
                            className={`p-1 rounded transition ${
                              index === sparepartItems.length - 1 
                                ? "text-neutral-200 cursor-not-allowed" 
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            }`}
                            title="Geser Ke Bawah"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePartRow(row.id)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                            title="Hapus baris"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Sum footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-mono">Jumlah Baris Part: {sparepartItems.length}</span>
              <div className="text-right">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Subtotal Suku Cadang</span>
                <span className="text-sm font-black text-neutral-900 font-mono">Rp {totalSpareparts.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA & FINANCIAL SUMMARY */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Metadata: Nomor, Bank, Penulis, Catatan */}
          <div className="md:col-span-7 bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-black text-neutral-900 uppercase border-b border-slate-100 pb-3 flex items-center space-x-1.5">
              <span>Rincian Slip &amp; Administrasi</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block font-bold mb-1">Nomor Estimasi / Quotation</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={noEstimasi}
                    onChange={e => setNoEstimasi(e.target.value)}
                    placeholder="Contoh: EST 06/06 0001"
                    className="flex-1 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                  <button
                    type="button"
                    onClick={incrementDocNo}
                    className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold hover:text-red-750 text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap shadow-sm"
                    title="Tambah +1 ke sequence nomor di bagian belakang"
                  >
                    <Plus className="w-3.5 h-3.5 text-red-550" />
                    <span>NEW +1</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block font-bold mb-1">Dibuat Oleh (Mekanik / SA)</label>
                <input
                  type="text"
                  value={dibuatOleh}
                  onChange={e => setDibuatOleh(e.target.value)}
                  placeholder="Arsalan"
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase block font-bold mb-1">Catatan Tambahan untuk Pelanggan</label>
              <input
                type="text"
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Contoh: Garansi pengerjaan kaki-kaki 1 bulan resmi Arsalan."
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Quick alert rules */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start gap-2.5 text-[10.5px] leading-relaxed text-neutral-605 font-medium">
              <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <span>
                Semua estimasi yang Anda simpan akan masuk ke halaman <strong>Arsip History</strong>. Anda dapat meng-load kembali arsip tersebut untuk direbisi harganya tanpa perlu menulis ulang dari awal!
              </span>
            </div>
          </div>

          {/* FINANCIAL SUMMARY REKAP & INVOICING ACTIONS */}
          <div className="md:col-span-5 bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between space-y-6">
            
            <div className="space-y-3 font-mono text-xs">
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider font-sans border-b border-slate-100 pb-3">
                Rekap Tabulasi Biaya
              </h4>

              <div className="flex items-center justify-between font-medium">
                <span className="text-neutral-500 font-sans font-semibold">Subtotal Jasa:</span>
                <span className="font-bold text-slate-850">Rp {totalJasa.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-neutral-500 font-sans font-semibold">Subtotal Part:</span>
                <span className="font-bold text-slate-850">Rp {totalSpareparts.toLocaleString("id-ID")}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-black text-slate-900">
                <span className="font-sans">Subtotal (Nett):</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>

              {/* PPN Switcher block */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between font-sans mt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800">Kenakan PPN (11%)</span>
                  <span className="text-[10px] text-slate-400">Cocokkan dengan slip resmi corporate</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUsePpn(!usePpn)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-250 ease-in-out ${
                    usePpn ? "bg-red-600" : "bg-neutral-300"
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-250 ${
                    usePpn ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {usePpn && (
                <div className="flex items-center justify-between text-neutral-600 text-[11px]">
                  <span>Porsi PPN 11%:</span>
                  <span>Rp {ppnAmount.toLocaleString("id-ID")}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-red-700 bg-red-50 p-3 rounded-2xl">
                <span className="font-sans text-xs font-black text-slate-900 block leading-none">GRAND TOTAL</span>
                <span className="text-slate-950 text-xl font-black font-mono tracking-tight leading-none">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* ACTION TRIGGERS PANEL */}
            <div className="space-y-2.5 pt-4">
              <button
                type="button"
                onClick={handleGeneratePrint}
                className="w-full bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-black uppercase py-4 rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Simpan &amp; Lihat Print Preview</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveToDatabase}
                  className="bg-neutral-900 hover:bg-black text-white text-[11px] font-black uppercase py-3.5 rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  <span>Cuma Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Reset seluruh worksheet editor? Pengisian saat ini akan dikosongkan.")) {
                      setNoEstimasi(generateEstimasiNumber());
                      setCustomer({
                        nama: "",
                        telp: "",
                        alamat: "",
                        noPolisi: "",
                        noRangka: "",
                        model: "",
                        odometer: "",
                        lamaPekerjaan: "1 Hari"
                      });
                      setJasaItems([{ id: "js-init-reset", kode: "", pekerjaan: "", total: 0 }]);
                      setSparepartItems([{ id: "sp-init-reset", kode: "", nama: "", qty: 1, hargaSatuan: 0, diskonPercent: 0, total: 0 }]);
                      setUsePpn(false);
                      setCatatan("");
                      if (clearEditRecord) clearEditRecord();
                      showAlert("Seluruh lembar pengerjaan telah dikosongkan kembali!");
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold uppercase py-3.5 rounded-xl transition"
                >
                  KOSONGKAN FORM
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
