import React, { useState, useEffect } from "react";
import { EstimasiRecord } from "../types/estimasi";
import { EstimasiDb } from "../utils/estimasiDb";
import { Search, Loader2, Calendar, User, Car, FileText, Printer, Edit3, Trash2, ArrowLeft } from "lucide-react";

interface EstimasiHistoryProps {
  onBack: () => void;
  onEditRecord: (record: EstimasiRecord) => void;
  onPrintRecord: (record: EstimasiRecord) => void;
  onDatabaseChange?: () => void;
}

export default function EstimasiHistory({ onBack, onEditRecord, onPrintRecord, onDatabaseChange }: EstimasiHistoryProps) {
  const [history, setHistory] = useState<EstimasiRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // load list from DB
    const list = EstimasiDb.getEstimasiHistory();
    setHistory(list);
    setIsLoading(false);
  }, []);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteTrigger = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const filteredHistory = history.filter(
    item => 
      item.noEstimasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.noPolisi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Title Header */}
      <div className="bg-neutral-900 text-white py-8 px-4 sm:px-6 shadow-sm border-b border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase block font-bold mb-1">
              DATABASE EST. HISTORY &amp; ARCHIVE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
              Riwayat Estimasi Terbit
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-serif font-medium">
              Cek arsip, ubah/edit kalkulasi ulang, atau cetak kembali nota estimasi pelanggan
            </p>
          </div>
          <div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider transition"
            >
              Kembali ke Editor
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        
        {/* Search header panel */}
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-800 font-mono flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-600 rounded-full inline-block"></span>
            <span>DATA TERARSIP: {filteredHistory.length} DOKUMEN</span>
          </div>

          <div className="relative w-full md:max-w-md">
            <span className="absolute left-3.5 top-2.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari nomor, nama pelanggan, tipe mobil, atau plat nomor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl outline-none focus:border-red-500 transition"
            />
          </div>
        </div>

        {/* History Catalog Grid / Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              <span className="text-xs text-slate-400 font-bold font-mono">LOADING HISTORY ARCHIVES...</span>
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-mono uppercase text-[10px] tracking-wider border-b border-black">
                    <th className="py-3 px-4 font-bold">No. Estimasi</th>
                    <th className="py-3 px-4 font-bold">Tanggal</th>
                    <th className="py-3 px-4 font-bold">Pelanggan</th>
                    <th className="py-3 px-4 font-bold">Unit Mobil / Plat</th>
                    <th className="py-3 px-4 font-bold text-right">Grand Total</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-center">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-neutral-800 font-sans font-medium">
                  {filteredHistory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-mono font-black text-rose-950 block">{item.noEstimasi}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-slate-600">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-neutral-950 block">{item.customer.nama}</span>
                          <span className="text-[10px] text-neutral-450 block font-mono font-bold leading-none">{item.customer.telp}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-neutral-900 block">{item.customer.model}</span>
                          <span className="text-[9.5px] bg-neutral-100 text-neutral-600 font-mono px-1.5 py-0.5 rounded font-extrabold uppercase inline-block">
                            {item.customer.noPolisi || "TANPA PLAT"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-black font-mono text-slate-900 text-sm">
                        Rp {item.grandTotal.toLocaleString("id-ID")}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {item.status === "printed" ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-55 text-emerald-800 bg-emerald-50 border border-emerald-150 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>Cetak Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-55 text-amber-850 bg-amber-50 border border-amber-150 shadow-xs animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Draft / Baru</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              const updated = { ...item, status: "printed" as const };
                              EstimasiDb.addEstimasi(updated);
                              if (onDatabaseChange) onDatabaseChange();
                              onPrintRecord(updated);
                              // update state list too
                              setHistory(EstimasiDb.getEstimasiHistory());
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase flex items-center space-x-1 transition"
                            title="Print Preview / Cetak"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          
                          <button
                            onClick={() => onEditRecord(item)}
                            className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase flex items-center space-x-1 transition"
                            title="Edit / Load ke Form"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={(e) => handleDeleteTrigger(item.id, e)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <span className="text-slate-350 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-full">
                <FileText className="w-10 h-10" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-black text-neutral-800 uppercase">Belum Ada Estimasi Tersimpan</p>
                <p className="text-xs text-neutral-400 font-serif font-medium">Buat nota estimasi baru di editor lalu klik &quot;Simpan ke Database&quot; untuk mengarsipkan!</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Premium Custom Deletion Modal Box (Safe from Iframe blocks!) */}
      {deleteId && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-150">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-neutral-900 uppercase">Hapus Arsip Estimasi?</h3>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Apakah Anda yakin ingin menghapus dokumen arsip ini secara permanen dari database riwayat? Tindakan ini tidak bisa dibatalkan ya.
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    EstimasiDb.deleteEstimasi(deleteId);
                    setHistory(prev => prev.filter(item => item.id !== deleteId));
                    if (onDatabaseChange) onDatabaseChange();
                    setDeleteId(null);
                  }}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition cursor-pointer border border-red-750 font-sans"
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
