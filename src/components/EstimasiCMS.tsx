import React, { useState, useEffect } from "react";
import { MasterSparepart, MasterJasa } from "../types/estimasi";
import { EstimasiDb, exportToCSV, parseCSV } from "../utils/estimasiDb";
import { Plus, Trash, Edit, Upload, Download, Search, RotateCcw, FileSpreadsheet, Check, X, AlertCircle } from "lucide-react";

interface EstimasiCMSProps {
  onBack: () => void;
  onDatabaseChange?: () => void;
}

export default function EstimasiCMS({ onBack, onDatabaseChange }: EstimasiCMSProps) {
  const [activeTab, setActiveTab] = useState<"spareparts" | "jasa">("spareparts");
  const [spareparts, setSpareparts] = useState<MasterSparepart[]>([]);
  const [jasa, setJasa] = useState<MasterJasa[]>([]);
  
  // Search
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State for Adding / Editing Part
  const [editingPart, setEditingPart] = useState<MasterSparepart | null>(null);
  const [partForm, setPartForm] = useState({ kode: "", nama: "", harga: 0, kategori: "Umum" });
  
  // Form State for Adding / Editing Jasa
  const [editingJasa, setEditingJasa] = useState<MasterJasa | null>(null);
  const [jasaForm, setJasaForm] = useState({ kode: "", nama: "", harga: 0 });

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Deletion States
  const [deletePartId, setDeletePartId] = useState<string | null>(null);
  const [deleteJasaId, setDeleteJasaId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSpareparts(EstimasiDb.getMasterSpareparts());
    setJasa(EstimasiDb.getMasterJasa());
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = () => {
    setResetConfirmOpen(true);
  };

  const executeReset = () => {
    EstimasiDb.resetToDefaults();
    loadData();
    showToast("Data master didefault kembali!", "success");
    setResetConfirmOpen(false);
  };

  // --- SPAREPART CRUD ---
  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partForm.kode || !partForm.nama || partForm.harga <= 0) {
      showToast("Tolong lengkapi kode, nama, dan harga sparepart!", "error");
      return;
    }

    let updated: MasterSparepart[];
    if (editingPart) {
      updated = spareparts.map(p => p.id === editingPart.id ? { ...p, ...partForm } : p);
      showToast("Berhasil update sparepart!");
    } else {
      const newPart: MasterSparepart = {
        id: "sp-" + Date.now(),
        ...partForm
      };
      updated = [newPart, ...spareparts];
      showToast("Berhasil menambah sparepart baru!");
    }

    setSpareparts(updated);
    EstimasiDb.saveMasterSpareparts(updated);
    setEditingPart(null);
    setPartForm({ kode: "", nama: "", harga: 0, kategori: "Umum" });
  };

  const handleEditPart = (part: MasterSparepart) => {
    setEditingPart(part);
    setPartForm({ kode: part.kode, nama: part.nama, harga: part.harga, kategori: part.kategori });
  };

  const handleDeletePart = (id: string) => {
    setDeletePartId(id);
  };

  const confirmDeletePart = (id: string) => {
    const updated = spareparts.filter(p => p.id !== id);
    setSpareparts(updated);
    EstimasiDb.saveMasterSpareparts(updated);
    showToast("Sparepart dihapus");
    setDeletePartId(null);
  };

  // --- JASA CRUD ---
  const handleSaveJasa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jasaForm.kode || !jasaForm.nama || jasaForm.harga < 0) {
      showToast("Tolong lengkapi kode dan nama jasa!", "error");
      return;
    }

    let updated: MasterJasa[];
    if (editingJasa) {
      updated = jasa.map(j => j.id === editingJasa.id ? { ...j, ...jasaForm } : j);
      showToast("Berhasil update jasa servis!");
    } else {
      const newJasa: MasterJasa = {
        id: "js-" + Date.now(),
        ...jasaForm
      };
      updated = [newJasa, ...jasa];
      showToast("Berhasil menambah jasa baru!");
    }

    setJasa(updated);
    EstimasiDb.saveMasterJasa(updated);
    setEditingJasa(null);
    setJasaForm({ kode: "", nama: "", harga: 0 });
  };

  const handleEditJasa = (j: MasterJasa) => {
    setEditingJasa(j);
    setJasaForm({ kode: j.kode, nama: j.nama, harga: j.harga });
  };

  const handleDeleteJasa = (id: string) => {
    setDeleteJasaId(id);
  };

  const confirmDeleteJasa = (id: string) => {
    const updated = jasa.filter(j => j.id !== id);
    setJasa(updated);
    EstimasiDb.saveMasterJasa(updated);
    showToast("Jasa dihapus");
    setDeleteJasaId(null);
  };

  // --- CSV IMPORT / EXPORT TO EXCEL ---
  const handleExportCSV = () => {
    if (activeTab === "spareparts") {
      // Export spareparts
      const plainParts = spareparts.map(({ kode, nama, harga, kategori }) => ({ kode, nama, harga, kategori }));
      exportToCSV(plainParts, "arsalan_master_spareparts.csv");
      showToast("Spareparts exported as CSV!");
    } else {
      // Export jasa
      const plainJasa = jasa.map(({ kode, nama, harga }) => ({ kode, nama, harga }));
      exportToCSV(plainJasa, "arsalan_master_jasa.csv");
      showToast("Jasa Servis exported as CSV!");
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>, type: "spareparts" | "jasa") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          throw new Error("File CSV kosong atau header tidak cocok.");
        }

        if (type === "spareparts") {
          const imported: MasterSparepart[] = parsed.map((item, idx) => ({
            id: `sp-imp-${idx}-${Date.now()}`,
            kode: item.kode || `P-${100 + idx}`,
            nama: item.nama || "Item Tidak Bernama",
            harga: Number(item.harga) || 0,
            kategori: item.kategori || "Umum"
          }));

          const merged = [...imported, ...spareparts.filter(p => !imported.some(i => i.kode === p.kode))];
          setSpareparts(merged);
          EstimasiDb.saveMasterSpareparts(merged);
          showToast(`Berhasil mengimpor ${imported.length} spareparts!`, "success");
        } else {
          const imported: MasterJasa[] = parsed.map((item, idx) => ({
            id: `js-imp-${idx}-${Date.now()}`,
            kode: item.kode || `J-${100 + idx}`,
            nama: item.nama || "Jasa Tanpa Nama",
            harga: Number(item.harga) || 0
          }));

          const merged = [...imported, ...jasa.filter(j => !imported.some(i => i.kode === j.kode))];
          setJasa(merged);
          EstimasiDb.saveMasterJasa(merged);
          showToast(`Berhasil mengimpor ${imported.length} jasa servis!`, "success");
        }
      } catch (err: any) {
        showToast("Gagal mengimpor CSV. Pastikan format / kolom sesuai.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  // Filter listings based on search
  const filteredSpareparts = spareparts.filter(
    p => p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJasa = jasa.filter(
    j => j.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
         j.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="estimasi-cms-view" className="bg-slate-50 min-h-screen pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl border ${
          toast.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Title Header */}
      <div className="bg-neutral-900 text-white py-8 px-4 sm:px-6 shadow-sm border-b border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase block font-bold mb-1">
              DATABASE MASTER DATA &amp; CMS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
              Katalog Jasa &amp; Spareparts
            </h1>

          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider transition"
            >
              Tutup CMS
            </button>
          </div>
        </div>
      </div>

      {/* Main CMS Action Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Add/Edit component Form */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6">
            <h3 className="text-sm font-black text-neutral-950 uppercase border-b border-slate-150 pb-3 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block"></span>
              <span>{activeTab === "spareparts" ? (editingPart ? "Edit Sparepart" : "Tambah Sparepart") : (editingJasa ? "Edit Jasa Servis" : "Tambah Jasa Servis")}</span>
            </h3>

            {activeTab === "spareparts" ? (
              <form onSubmit={handleSavePart} className="mt-5 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Kode Sparepart *</label>
                  <input
                    type="text"
                    value={partForm.kode}
                    onChange={e => setPartForm({ ...partForm, kode: e.target.value.toUpperCase() })}
                    placeholder="Contoh: PRT-102, NSK-01"
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Nama Sparepart *</label>
                  <input
                    type="text"
                    value={partForm.nama}
                    onChange={e => setPartForm({ ...partForm, nama: e.target.value })}
                    placeholder="Contoh: Filter Oli Jazz Orisinal"
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Harga (Rupiah) *</label>
                    <input
                      type="text"
                      value={partForm.harga ? partForm.harga.toLocaleString("id-ID") : ""}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setPartForm({ ...partForm, harga: raw ? parseInt(raw, 10) : 0 });
                      }}
                      placeholder="Contoh: 145.000"
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Kategori</label>
                    <select
                      value={partForm.kategori}
                      onChange={e => setPartForm({ ...partForm, kategori: e.target.value })}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                    >
                      <option value="Oli">Oli / Pelumas</option>
                      <option value="Filter">Filter-filter</option>
                      <option value="Kaki-kaki">Kaki-kaki / Suspensi</option>
                      <option value="Mesin">Mesin &amp; Tuneup</option>
                      <option value="AC">Sistem AC</option>
                      <option value="Kelistrikan">Kelistrikan</option>
                      <option value="Umum">Lainnya/Umum</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-750 text-white text-xs font-black uppercase py-3 rounded-xl transition"
                  >
                    {editingPart ? "Update Part" : "Simpan Part"}
                  </button>
                  {editingPart && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPart(null);
                        setPartForm({ kode: "", nama: "", harga: 0, kategori: "Umum" });
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 rounded-xl transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveJasa} className="mt-5 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Kode Jasa *</label>
                  <input
                    type="text"
                    value={jasaForm.kode}
                    onChange={e => setJasaForm({ ...jasaForm, kode: e.target.value.toUpperCase() })}
                    placeholder="Contoh: SVC-001, JS-02"
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Nama Jasa Pekerjaan *</label>
                  <input
                    type="text"
                    value={jasaForm.nama}
                    onChange={e => setJasaForm({ ...jasaForm, nama: e.target.value })}
                    placeholder="Contoh: Jasa Service Mesin kendaraan"
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-1">Harga Jasa Standar (Rupiah) *</label>
                  <input
                    type="text"
                    value={jasaForm.harga ? jasaForm.harga.toLocaleString("id-ID") : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setJasaForm({ ...jasaForm, harga: raw ? parseInt(raw, 10) : 0 });
                    }}
                    placeholder="Contoh: 150.000"
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-red-500 transition"
                  />
                </div>

                <div className="pt-2 flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-750 text-white text-xs font-black uppercase py-3 rounded-xl transition"
                  >
                    {editingJasa ? "Update Jasa" : "Simpan Jasa"}
                  </button>
                  {editingJasa && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingJasa(null);
                        setJasaForm({ kode: "", nama: "", harga: 0 });
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 rounded-xl transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Excel / Excel-friendly CSV import container */}
            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center space-x-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Odoo / Excel CSV Sync</span>
              </h4>
              <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                Mau mass-update harga via Excel/Google Sheets? Download template aktif lalu upload kembali dalam format CSV!
              </p>
              
              <div className="mt-4 space-y-2.5">
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-between text-left text-xs bg-white border border-slate-200 text-neutral-800 py-2 px-3 rounded-xl hover:border-emerald-500 transition"
                >
                  <span className="font-semibold">Download Master {activeTab === "spareparts" ? "Spareparts" : "Jasa"} (.csv)</span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    id="csv-file-upload"
                    onChange={(e) => handleImportCSV(e, activeTab)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-between text-xs bg-white border border-slate-200 text-neutral-800 py-2 px-3 rounded-xl border-dashed hover:border-emerald-500 transition">
                    <span className="font-semibold text-emerald-600">Import / Upload Excel CSV</span>
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Database listing catalog */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Tab selector and Search Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
              <button
                onClick={() => { setActiveTab("spareparts"); setSearchQuery(""); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition ${
                  activeTab === "spareparts" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Spareparts ({spareparts.length})
              </button>
              <button
                onClick={() => { setActiveTab("jasa"); setSearchQuery(""); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition ${
                  activeTab === "jasa" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Jasa Servis ({jasa.length})
              </button>
            </div>

            <div className="relative w-full">
              <span className="absolute left-3.5 top-2.5 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={activeTab === "spareparts" ? "Cari spareparts (nama, kode, kategori)..." : "Cari tipe jasa..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl outline-none focus:border-red-500 transition"
              />
            </div>

          </div>

          {/* Actual items catalog list container */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {activeTab === "spareparts" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 text-white font-mono uppercase text-[10px] tracking-wider border-b border-black">
                      <th className="py-3 px-4 font-bold">Kode</th>
                      <th className="py-3 px-4 font-bold">Nama Barang</th>
                      <th className="py-3 px-4 font-bold">Kategori</th>
                      <th className="py-3 px-4 font-bold text-right">Harga</th>
                      <th className="py-3 px-4 font-bold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-neutral-800 font-sans font-medium">
                    {filteredSpareparts.length > 0 ? (
                      filteredSpareparts.map(part => (
                        <tr key={part.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{part.kode}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{part.nama}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                              {part.kategori}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold font-mono text-neutral-950">
                            Rp {part.harga.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => handleEditPart(part)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition"
                                title="Edit Item"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePart(part.id)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-red-600 rounded-lg transition"
                                title="Hapus Item"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-450 font-serif font-semibold">
                          Tidak ada data master sparepart ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 text-white font-mono uppercase text-[10px] tracking-wider border-b border-black">
                      <th className="py-3 px-4 font-bold">Kode</th>
                      <th className="py-3 px-4 font-bold">Nama Jasa Pekerjaan</th>
                      <th className="py-3 px-4 font-bold text-right">Harga Jasa Standar</th>
                      <th className="py-3 px-4 font-bold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-neutral-800 font-sans font-medium">
                    {filteredJasa.length > 0 ? (
                      filteredJasa.map(js => (
                        <tr key={js.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{js.kode}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{js.nama}</td>
                          <td className="py-3 px-4 text-right font-bold font-mono text-neutral-950">
                            Rp {js.harga.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => handleEditJasa(js)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition"
                                title="Edit Jasa"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJasa(js.id)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-red-600 rounded-lg transition"
                                title="Hapus Jasa"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-450 font-serif font-semibold">
                          Tidak ada data master jasa servis ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick manual alert info in CMS */}
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-3xl flex items-start gap-3">
            <span className="p-1.5 bg-white text-slate-700 rounded-xl mt-0.5 shadow-xs border border-slate-150">
              <AlertCircle className="w-4 h-4" />
            </span>
            <div className="text-xs font-semibold leading-relaxed text-slate-600 font-sans">
              Semua item di list katalog ini akan muncul di search dropdown otomatis saat mekanik membuat 
              Estimasi/Invoice. Walau ada auto-suggest, mekanik tetep bisa menulis detail &amp; merubah harga secara fleksibel.
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modals (Universal Sandbox-Safe Overlay System!) */}
      
      {/* 1. Reset Confirm Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-150 animate-bounce">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-neutral-900 uppercase">Reset Setelan Pabrik?</h3>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Apakah Anda yakin ingin mengembalikan semua data master ke setelan default? Data sparepart dan jasa yang Anda edit atau buat manual akan hilang ya.
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={executeReset}
                  className="flex-1 py-2 px-4 bg-red-650 hover:bg-red-750 text-white text-xs font-black rounded-xl transition cursor-pointer"
                >
                  Ya, Reset!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete Part Confirm Modal */}
      {deletePartId && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-150">
                <Trash className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-neutral-900 uppercase">Hapus Suku Cadang?</h3>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Hapus master sparepart ini dari daftar katalog? List dropdown auto-suggest pas bikin estimasi bakal terupdate.
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setDeletePartId(null)}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => confirmDeletePart(deletePartId)}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition cursor-pointer border border-red-700 font-sans"
                >
                  Ya, Hapus!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Jasa Confirm Modal */}
      {deleteJasaId && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-150">
                <Trash className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-neutral-900 uppercase">Hapus Jasa Servis?</h3>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Hapus master jasa servis ini dari katalog? Saran dropdown otomatis pelayanan servis bakal diupdate permanent.
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setDeleteJasaId(null)}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => confirmDeleteJasa(deleteJasaId)}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition cursor-pointer border border-red-700 font-sans"
                >
                  Ya, Hapus!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
