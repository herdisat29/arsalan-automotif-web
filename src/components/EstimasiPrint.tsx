import React, { useState, useEffect } from "react";
import { EstimasiRecord } from "../types/estimasi";
import { numberToTerbilang, EstimasiDb } from "../utils/estimasiDb";
import { Printer, ArrowLeft, Layout, FileText, CheckCircle2 } from "lucide-react";

interface EstimasiPrintProps {
  record: EstimasiRecord;
  onBack: () => void;
  printSize: "half" | "full";
  onChangeSize: (size: "half" | "full") => void;
}

export default function EstimasiPrint({ record, onBack, printSize, onChangeSize }: EstimasiPrintProps) {
  const defaultBankInfo = localStorage.getItem("arsalan_bank_info") || "Transfer Rekening Resmi Bengkel:\nBCA: XXX-XXX-XXXX (Atas Nama) • MANDIRI: XXX-XXX-XXXX (Atas Nama)";
  const defaultKetentuan = localStorage.getItem("arsalan_ketentuan") || "• Estimasi di atas belum termasuk suku cadang / penanganan tambahan jika ditemui problem sekunder.\n• Harga jasa dan komponen mengikat 14 hari sejak tanggal terbit estimasi ini.";

  const [localCatatan, setLocalCatatan] = useState(record.catatan || "");
  const [localDibuatOleh, setLocalDibuatOleh] = useState(record.dibuatOleh || "Arsalan");
  const [localBankInfo, setLocalBankInfo] = useState(
    (record.bankInfo && record.bankInfo !== "BCA" && record.bankInfo.trim() !== "")
      ? record.bankInfo
      : defaultBankInfo
  );
  const [localKetentuan, setLocalKetentuan] = useState(
    record.ketentuan || defaultKetentuan
  );

  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  useEffect(() => {
    const currentDefaultBank = localStorage.getItem("arsalan_bank_info") || "Transfer Rekening Resmi Bengkel:\nBCA: XXX-XXX-XXXX (Atas Nama) • MANDIRI: XXX-XXX-XXXX (Atas Nama)";
    const currentDefaultKetentuan = localStorage.getItem("arsalan_ketentuan") || "• Estimasi di atas belum termasuk suku cadang / penanganan tambahan jika ditemui problem sekunder.\n• Harga jasa dan komponen mengikat 14 hari sejak tanggal terbit estimasi ini.";
    setLocalCatatan(record.catatan || "");
    setLocalDibuatOleh(record.dibuatOleh || "Arsalan");
    setLocalBankInfo(
      (record.bankInfo && record.bankInfo !== "BCA" && record.bankInfo.trim() !== "")
        ? record.bankInfo
        : currentDefaultBank
    );
    setLocalKetentuan(
      record.ketentuan || currentDefaultKetentuan
    );
  }, [record.id]);

  const handleCatatanChange = (val: string) => {
    setLocalCatatan(val);
    const updatedRecord = { ...record, catatan: val };
    EstimasiDb.addEstimasi(updatedRecord);
  };

  const handleDibuatOlehChange = (val: string) => {
    setLocalDibuatOleh(val);
    const updatedRecord = { ...record, dibuatOleh: val };
    EstimasiDb.addEstimasi(updatedRecord);
  };

  const handleBankInfoChange = (val: string) => {
    setLocalBankInfo(val);
    localStorage.setItem("arsalan_bank_info", val);
    const updatedRecord = { ...record, bankInfo: val };
    EstimasiDb.addEstimasi(updatedRecord);
  };

  const handleKetentuanChange = (val: string) => {
    setLocalKetentuan(val);
    localStorage.setItem("arsalan_ketentuan", val);
    const updatedRecord = { ...record, ketentuan: val };
    EstimasiDb.addEstimasi(updatedRecord);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-100 min-h-screen py-8 px-4 sm:px-6 print:bg-white print:p-0">
      
      {/* Dynamic Native Print CSS Configuration */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: ${printSize === "half" ? "A5 landscape" : "A4 portrait"};
            margin: ${printSize === "half" ? "4mm 8mm 4mm 8mm" : "8mm 12mm 8mm 12mm"};
          }
          
          html, body {
            background: #fff !important;
            color: #000 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: ${printSize === "half" ? "8.5px" : "10px"} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Force element layout fitting */
          #print-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            height: auto !important;
          }

          /* Extra compact spacing inside the printed page */
          .border-b-2 { border-bottom-width: 1.5px !important; }
          .pb-4 { padding-bottom: 6px !important; }
          .py-4 { padding-top: 4px !important; padding-bottom: 4px !important; }
          .mt-5 { margin-top: 8px !important; }
          .mt-6 { margin-top: 10px !important; }
          .mt-8 { margin-top: 12px !important; }
          
          /* Auto scaling based on selected paper size */
          ${printSize === "half" ? `
            /* HALF A4 specific micro scaling */
            h2 { font-size: 13px !important; line-height: 1.1 !important; }
            p, span, div, td, th { font-size: 7.5px !important; line-height: 1.15 !important; }
            .grid-cols-12 span { font-size: 7.5px !important; }
            table { font-size: 7.5px !important; }
            th, td { padding-top: 1px !important; padding-bottom: 1px !important; }
            .h-28 { height: 42px !important; }
            textarea { 
              font-size: 7px !important; 
              height: auto !important; 
              min-height: 16px !important; 
              margin-top: 1px !important;
              line-height: 1.15 !important;
            }
            img { height: 35px !important; }
            /* Tighten general custom margins/paddings for print size half */
            .pb-4 { padding-bottom: 2px !important; }
            .py-4 { padding-top: 2px !important; padding-bottom: 2px !important; }
            .mt-5 { margin-top: 3px !important; }
            .mt-6 { margin-top: 4px !important; }
            .mt-8 { margin-top: 6px !important; }
          ` : `
            /* FULL A4 specific safe scaling */
            h2 { font-size: 16px !important; }
            p, span, div, td, th { font-size: 9.5px !important; }
            table { font-size: 9.5px !important; }
            th, td { padding-top: 4px !important; padding-bottom: 4px !important; }
            textarea { height: auto !important; min-height: 35px !important; }
          `}

          tr {
            page-break-inside: avoid !important;
          }
        }
      ` }} />

      {/* Sandbox Iframe warning & Open-In-Tab helpful tool */}
      {isInIframe && (
        <div className="max-w-4xl mx-auto mb-6 bg-amber-50 border border-amber-250 p-4 rounded-3xl text-xs text-amber-950 leading-relaxed print:hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start space-x-3 text-left">
            <span className="text-xl shrink-0 leading-none">⚠️</span>
            <div>
              <p className="font-extrabold text-amber-950 uppercase tracking-wider text-[11px]">Aplikasi Berjalan Di Dalam Editor Preview (Iframe)</p>
              <p className="mt-1 font-semibold text-neutral-700">
                Supaya dialog <strong className="text-red-700">Print &amp; Simpan PDF</strong> browser muncul maksimal dan rapi, disarankan klik tombol <strong className="text-amber-950">Buka Tab Baru ↗</strong> di samping. 
                Atau klik tombol dengan icon kotak panah <strong className="text-slate-900">"Open in new tab"</strong> di bar tengah atas panel AI Studio Anda.
              </p>
            </div>
          </div>
          <a
            href={window.location.origin + window.location.pathname + window.location.search}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto text-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] tracking-wider uppercase rounded-xl transition shadow-xs cursor-pointer shrink-0"
          >
            Buka Tab Baru ↗
          </a>
        </div>
      )}

      {/* Top action bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 bg-slate-900 text-white p-4 rounded-3xl shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-black uppercase text-neutral-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Editor</span>
        </button>

        {/* Paper Size selector */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Ukuran Kertas:</span>
          <div className="bg-neutral-800 p-0.5 rounded-xl border border-neutral-700 flex text-xs">
            <button
              onClick={() => onChangeSize("half")}
              className={`px-3 py-1.5 rounded-lg font-black uppercase flex items-center space-x-1.5 transition ${
                printSize === "half" ? "bg-red-600 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Setengah A4</span>
            </button>
            <button
              onClick={() => onChangeSize("full")}
              className={`px-3 py-1.5 rounded-lg font-black uppercase flex items-center space-x-1.5 transition ${
                printSize === "full" ? "bg-red-600 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Satu A4 Penuh</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-black rounded-xl uppercase tracking-wider flex items-center space-x-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Buka Print Preview</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Area */}
      <div 
        id="print-sheet"
        className={`bg-white mx-auto border border-neutral-300 text-black font-sans shadow-lg relative print:border-0 print:shadow-none print:mx-0 transition-all duration-300 ${
          printSize === "half" 
            ? "max-w-4xl p-4 sm:p-5 min-h-[148mm] text-[10px]" // landscape A5 aesthetic on screen
            : "max-w-4xl p-8 sm:p-10 min-h-[297mm] text-xs" // standard A4 portrait aesthetic
        }`}
      >        {/* Document Header */}
        <div className={`border-b-2 border-black ${printSize === "half" ? "pb-1.5" : "pb-4"}`}>
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div>
                <h2 className={`${printSize === "half" ? "text-base" : "text-xl"} font-black tracking-tight text-slate-900 uppercase leading-none`}>
                  ARSALAN JAYA AUTOMOTIF
                </h2>
                <p className={`${printSize === "half" ? "text-[8.5px] mt-1" : "text-[9.5px] mt-1.5"} font-mono uppercase text-slate-700 font-extrabold tracking-wide`}>
                  Specialist Service &amp; Spareparts • Mantan Service Advisor Honda
                </p>
                <p className={`${printSize === "half" ? "text-[8.5px] mt-0.5" : "text-[9.5px] mt-1.5"} text-slate-550 font-semibold leading-relaxed`}>
                  Jl. Mirah Delima Raya No.79, Bojong Rawalumbu, Kota Bekasi, Jawa Barat 17116
                </p>
                <p className={`${printSize === "half" ? "text-[8.5px] mt-0.5" : "text-[9.5px] mt-0.5"} text-slate-550 font-semibold`}>
                  Telp: +62 811-1235-229 • WA: +62 811-1235-229 • Instagram: @arsalanjayaautomotif2
                </p>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <span className={`${printSize === "half" ? "text-[9.5px] px-2 py-0.5" : "text-xs px-3 py-1"} bg-slate-100 uppercase border border-slate-300 font-mono font-black rounded-md block md:inline-block`}>
                Estimasi Pekerjaan
              </span>
              <p className={`${printSize === "half" ? "text-[10px] mt-1" : "text-[10.5px] mt-2"} font-mono font-bold text-slate-900`}>
                No: {record.noEstimasi}
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Car Details (3-column layout inside mock grids) */}
        <div className={`grid grid-cols-12 border-b border-dashed border-neutral-400 font-medium ${
          printSize === "half" ? "py-1 text-[8.5px] gap-x-4 gap-y-0.5" : "py-4 text-xs gap-x-6 gap-y-4"
        }`}>
          {/* Column 1: Customer info */}
          <div className={`col-span-6 ${printSize === "half" ? "space-y-0.5" : "space-y-1.5"}`}>
            <div className="grid grid-cols-12">
              <span className="col-span-3 text-neutral-500 uppercase font-mono text-[9px] tracking-wide">Nama</span>
              <span className="col-span-1">:</span>
              <span className="col-span-8 font-extrabold text-neutral-900">{record.customer.nama || "-"}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-3 text-neutral-500 uppercase font-mono text-[9px] tracking-wide">Telp/Hp</span>
              <span className="col-span-1">:</span>
              <span className="col-span-8 text-neutral-800 font-bold">{record.customer.telp || "-"}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-3 text-neutral-500 uppercase font-mono text-[9px] tracking-wide">Alamat</span>
              <span className="col-span-1">:</span>
              <span className="col-span-8 text-neutral-800 leading-normal">{record.customer.alamat || "-"}</span>
            </div>
          </div>

          {/* Column 2: Vehicle details */}
          <div className={`col-span-6 pl-4 border-l border-neutral-200 ${printSize === "half" ? "space-y-0.5" : "space-y-1.5"}`}>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-neutral-500 uppercase font-mono text-[9px] tracking-wide">No. Polisi</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 font-extrabold text-neutral-950 uppercase">{record.customer.noPolisi || "-"}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-neutral-500 uppercase font-mono text-[9px] tracking-wide">No. Rangka</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 font-mono font-semibold text-neutral-800">{record.customer.noRangka || "-"}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-neutral-500 uppercase font-mono text-[9px] tracking-wide">Model Mobil</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 font-bold text-neutral-900">{record.customer.model || "-"}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-neutral-500 uppercase font-mono text-[9px] tracking-wide">Odometer</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 font-bold text-neutral-850 font-mono">{record.customer.odometer ? `${Number(record.customer.odometer).toLocaleString("id-ID")} KM` : "-"}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-neutral-500 uppercase font-mono text-[9px] tracking-wide">Tgl / Kerja</span>
              <span className="col-span-1">:</span>
              <span className="col-span-7 text-neutral-850 font-bold">{new Date(record.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • {record.customer.lamaPekerjaan || "0 Hari"}</span>
            </div>
          </div>
        </div>

        {/* TABLE 1: JASA PEKERJAAN */}
        <div className="mt-5">
          <h3 className="text-[10px] font-mono uppercase bg-neutral-100 px-2.5 py-1 text-slate-800 font-extrabold tracking-wider border border-neutral-300">
            I. Estimasi Jasa Pekerjaan
          </h3>
          <table className="w-full text-left border-collapse mt-2 text-[11px]">
            <thead>
              <tr className="border-b-2 border-neutral-900 text-neutral-500 uppercase font-mono text-[9px] font-bold">
                <th className="py-2 px-1 w-8 text-center">No</th>
                <th className="py-2 px-2 w-28">Kode Jasa</th>
                <th className="py-2 px-2">Keterangan Pekerjaan</th>
                <th className="py-2 px-2 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {record.jasaItems.length > 0 ? (
                record.jasaItems.map((js, idx) => (
                  <tr key={js.id || idx}>
                    <td className="py-2 px-1 text-center font-bold text-neutral-400">{idx + 1}</td>
                    <td className="py-2 px-2 font-mono text-neutral-600">{js.kode || `-`}</td>
                    <td className="py-2 px-2 font-semibold text-neutral-800">{js.pekerjaan}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-neutral-900">
                      Rp {js.total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-1.5 px-2 text-center text-slate-400 italic">
                    (Tidak ada estimasi pekerjaan jasa)
                  </td>
                </tr>
              )}
              <tr className="bg-neutral-50/50 font-bold border-t border-neutral-300">
                <td colSpan={3} className="py-2 px-2 text-right text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                  Total Jasa Pekerjaan
                </td>
                <td className="py-2 px-2 text-right font-mono text-neutral-950 font-black">
                  Rp {record.totalJasa.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TABLE 2: SUKU CADANG / SPAREPARTS */}
        <div className="mt-5">
          <h3 className="text-[10px] font-mono uppercase bg-neutral-100 px-2.5 py-1 text-slate-800 font-extrabold tracking-wider border border-neutral-300">
            II. Estimasi Suku Cadang / Spareparts
          </h3>
          <table className="w-full text-left border-collapse mt-2 text-[11px]">
            <thead>
              <tr className="border-b-2 border-neutral-900 text-neutral-500 uppercase font-mono text-[9px] font-bold">
                <th className="py-2 px-1 w-8 text-center">No</th>
                <th className="py-2 px-2 w-28">Kode Barang</th>
                <th className="py-2 px-2">Nama Barang / Komponen</th>
                <th className="py-2 px-1 text-center w-12">Qty</th>
                <th className="py-2 px-2 text-right w-24">Harga Satuan</th>
                <th className="py-2 px-2 text-center w-14">Diskon</th>
                <th className="py-2 px-2 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {record.sparepartItems.length > 0 ? (
                record.sparepartItems.map((part, idx) => (
                  <tr key={part.id || idx}>
                    <td className="py-2 px-1 text-center font-bold text-neutral-400">{idx + 1}</td>
                    <td className="py-2 px-2 font-mono text-neutral-600">{part.kode || `-`}</td>
                    <td className="py-2 px-2 font-semibold text-neutral-800">{part.nama}</td>
                    <td className="py-2 px-1 text-center font-bold text-neutral-800">{part.qty}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-700">
                      Rp {part.hargaSatuan.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 px-2 text-center text-red-500 font-bold font-mono">
                      {part.diskonPercent > 0 ? `${part.diskonPercent}%` : "0%"}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-neutral-900">
                      Rp {part.total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-1.5 px-2 text-center text-slate-400 italic">
                    (Tidak ada penggantian sparepart)
                  </td>
                </tr>
              )}
              <tr className="bg-neutral-50/50 font-bold border-t border-neutral-300">
                <td colSpan={6} className="py-2 px-2 text-right text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                  Total Suku Cadang / Barang
                </td>
                <td className="py-2 px-2 text-right font-mono text-neutral-950 font-black">
                  Rp {record.totalSpareparts.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BOTTOM FINANCIAL SUMMARY & TERMS BLOCK */}
        <div className={`grid grid-cols-12 gap-x-4 border-t font-sans border-neutral-950 mt-4 pt-3 ${
          printSize === "half" ? "text-[8.5px] leading-tight" : "text-xs font-semibold"
        }`}>
          
          {/* Spelled-out text terbilang & terms guidelines */}
          <div className="col-span-8 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-widest block font-bold leading-none">Terbilang (Rupiah):</span>
              <p className={`font-bold text-neutral-950 pl-2.5 border-l-2 border-red-600 tracking-tight italic ${
                printSize === "half" ? "text-[9.5px] mt-0.5" : "text-xs mt-1"
              }`}>
                &ldquo; {numberToTerbilang(record.grandTotal)} &rdquo;
              </p>
            </div>

            {/* Live Editable Catatan Penambahan */}
            <div className="text-left mt-1">
              <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-widest block font-bold print:hidden leading-none">
                Catatan / Rekomendasi Mekanik (Bisa diketik langsung di sini):
              </span>
              <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-widest hidden print:block leading-none">
                Catatan / Rekomendasi Mekanik:
              </span>
              <textarea
                value={localCatatan}
                onChange={e => handleCatatanChange(e.target.value)}
                placeholder="Tulis rekomendasi tambahan, keluhan susulan, atau garansi di sini (bisa diketik langsung di lembar print preview ini)..."
                className={`w-full font-semibold text-neutral-800 bg-neutral-50/75 border border-slate-200 hover:border-red-400 p-2 rounded-xl focus:bg-white focus:border-red-500 outline-none transition resize-none font-sans print:p-0 print:bg-transparent print:border-0 print:outline-none print:-mt-0.5 print:-ml-0.5 print:h-auto print:resize-none print:placeholder:text-transparent print:placeholder:opacity-0 ${
                  printSize === "half" ? "text-[8.5px] h-10 mt-0.5" : "text-[10.5px] h-16 mt-1"
                }`}
              />
            </div>

            {/* Disclaimer terms and notes (Live Editable) */}
            <div className={`text-neutral-605 bg-neutral-50 rounded-xl border border-neutral-200 text-left relative group ${
              printSize === "half" ? "p-1.5 text-[7px]" : "p-3 text-[10px]"
            }`}>
              <span className="tracking-wider uppercase font-mono text-slate-500 font-extrabold block text-[7.5px] leading-none mb-1">
                Ketentuan Estimasi &amp; Pembayaran (Klik untuk merubah):
              </span>
              <textarea
                value={localKetentuan}
                onChange={e => handleKetentuanChange(e.target.value)}
                className={`w-full font-medium leading-relaxed text-neutral-800 bg-transparent hover:bg-slate-100/30 p-1 rounded border-0 outline-none focus:bg-white focus:ring-1 focus:ring-red-400 transition font-sans resize-none print:p-0 print:bg-transparent print:border-0 print:ring-0 print:-mt-0.5 print:h-auto print:resize-none ${
                  printSize === "half" ? "text-[7.5px] h-10" : "text-[9.5px] h-14"
                }`}
              />
              
              <div className={`border-t border-dashed border-slate-200 ${printSize === "half" ? "pt-1 mt-1" : "pt-2 mt-2"}`}>
                <span className="tracking-wider uppercase font-mono text-slate-400 font-extrabold block print:hidden text-[7px] leading-none mb-1">
                  Info Rekening & Rekomendasi Transfer (Klik untuk merubah):
                </span>
                <textarea
                  value={localBankInfo}
                  onChange={e => handleBankInfoChange(e.target.value)}
                  className={`w-full font-medium leading-relaxed text-neutral-800 bg-transparent hover:bg-slate-100/30 p-1 rounded border-0 outline-none focus:bg-white focus:ring-1 focus:ring-red-400 transition font-sans resize-none print:p-0 print:bg-transparent print:border-0 print:ring-0 print:-mt-0.5 print:h-auto print:resize-none ${
                    printSize === "half" ? "text-[8px] h-8" : "text-[10px] h-14"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Subtotals & Grand Totals alignment panel */}
          <div className={`col-span-4 bg-slate-50 border border-neutral-300 rounded-2xl flex flex-col justify-center font-mono ${
            printSize === "half" ? "p-2 text-[8px] space-y-1" : "p-4 text-[11px] space-y-2.5"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-bold uppercase text-[7.5px]">Subtotal Jasa</span>
              <span className="font-extrabold font-mono text-neutral-900">Rp {record.totalJasa.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-bold uppercase text-[7.5px]">Subtotal Part</span>
              <span className="font-extrabold font-mono text-neutral-900">Rp {record.totalSpareparts.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-1 font-black">
              <span className="text-neutral-600 font-bold uppercase text-[7.5px]">Subtotal (Nett)</span>
              <span className="text-neutral-900 font-mono">Rp {record.total.toLocaleString("id-ID")}</span>
            </div>
            
            <div className="flex items-center justify-between font-bold">
              <span className="text-neutral-500 uppercase text-[7.5px] flex items-center">
                PPN (11%)
              </span>
              <span className="font-mono text-neutral-800">
                {record.usePpn ? `Rp ${record.ppnAmount.toLocaleString("id-ID")}` : "Rp 0"}
              </span>
            </div>

            <div className={`flex items-center justify-between border-t-2 border-black font-black text-red-700 bg-red-100/40 rounded-xl leading-none ${
              printSize === "half" ? "pt-1.5 p-1 text-[9px]" : "pt-2.5 p-2 text-xs"
            }`}>
              <span className="text-neutral-850 font-extrabold uppercase text-[8px]">GRAND TOTAL</span>
              <span className={`font-black text-slate-900 font-mono ${
                printSize === "half" ? "text-[10px]" : "text-sm"
              }`}>
                Rp {record.grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

        </div>

        {/* SIGNATURE SECTION */}
        <div 
          className="border-t border-dashed border-neutral-400 grid grid-cols-2 text-center"
          style={{
            marginTop: printSize === "half" ? "12px" : "24px",
            paddingTop: printSize === "half" ? "8px" : "12px",
            height: printSize === "half" ? "75px" : "120px",
            fontSize: printSize === "half" ? "8.5px" : "11px"
          }}
        >
          <div className="flex flex-col items-center justify-between h-full">
            <span className="uppercase tracking-wider text-slate-500 font-mono text-[7.5px] leading-none">Mekanik / Dibuat Oleh,</span>
            <div className="relative">
              <div 
                className="border-b border-black flex items-center justify-center select-none pointer-events-none leading-none"
                style={{
                  width: printSize === "half" ? "80px" : "110px",
                  height: printSize === "half" ? "30px" : "45px"
                }}
              >
                {/* Dikosongkan agar bisa tanda tangan manual */}
              </div>
            </div>
            <div className="flex items-center space-x-1 justify-center leading-none mt-1">
              <span className="text-neutral-400 font-bold">(</span>
              <input
                type="text"
                value={localDibuatOleh}
                onChange={e => handleDibuatOlehChange(e.target.value)}
                className={`text-center font-extrabold text-neutral-900 bg-transparent hover:bg-slate-50 focus:bg-white rounded p-0.5 inline-block outline-none min-w-[70px] print:font-extrabold print:border-none print:hover:bg-transparent print:focus:bg-transparent ${
                  printSize === "half" ? "text-[8.5px] w-20" : "text-xs w-28"
                }`}
                title="Klik untuk ganti nama pembuat"
              />
              <span className="text-neutral-400 font-bold">)</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between h-full">
            <span className="uppercase tracking-wider text-slate-500 font-mono text-[7.5px] leading-none">Pelanggan / Disetujui Oleh,</span>
            <div className="relative">
              <div 
                className="border-b border-black flex items-center justify-center select-none pointer-events-none"
                style={{
                  width: printSize === "half" ? "80px" : "110px",
                  height: printSize === "half" ? "30px" : "45px"
                }}
              >
                {/* Dikosongkan agar bisa tanda tangan manual */}
              </div>
            </div>
            <span className={`font-extrabold text-neutral-900 leading-none mt-1.5 ${printSize === "half" ? "text-[8.5px]" : "text-xs"}`}>
              ( {record.customer.nama || "Pelanggan"} )
            </span>
          </div>
        </div>

      </div>

      <div className="mt-6 text-center text-xs text-neutral-500 font-medium print:hidden">
        💡 <span className="font-semibold text-slate-800">Tips Cetak:</span> Atur margin ke &quot;None&quot; atau &quot;Default&quot;, centang &quot;Background graphics&quot; agar border dan warna latar label tercetak kontras maksimal!
      </div>
    </div>
  );
}
