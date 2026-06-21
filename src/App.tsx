import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Cpu, 
  Layers, 
  Zap, 
  Disc, 
  Droplet, 
  Wind, 
  Phone, 
  MapPin, 
  Clock, 
  Instagram, 
  Star, 
  Award, 
  ShieldCheck, 
  Check, 
  Truck, 
  ChevronRight, 
  Menu, 
  X, 
  AlertTriangle, 
  Search, 
  Copy, 
  Sparkles, 
  MessageSquare 
} from 'lucide-react';

import EstimasiForm from "./components/EstimasiForm";
import EstimasiCMS from "./components/EstimasiCMS";
import EstimasiHistory from "./components/EstimasiHistory";
import EstimasiPrint from "./components/EstimasiPrint";
import EstimasiLogin from "./components/EstimasiLogin";
import { EstimasiDb } from "./utils/estimasiDb";

interface Symptom {
  id: string;
  title: string;
  category: string;
  icon: string;
  probCause: string;
  gravity: 'ringan' | 'sedang' | 'parah';
  practicalAdvice: string;
}

interface PortfolioItem {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  client: string;
  issue: string;
  diag: string;
  solution: string;
  result: string;
  waText: string;
  tag: string;
  image: string;
}

interface Level {
  id: string;
  title: string;
  badge: string;
  desc: string;
  roles: string[];
}

// SIMPLIFIED, CONVERSATIONAL SYMPTOMS DATA
const SYMPTOMS: Symptom[] = [
  {
    id: "kb",
    title: "Kaki-Kaki Bunyi Gluduk-Gluduk",
    category: "Kemudi & Suspensi",
    icon: "Layers",
    probCause: "Bushing lower arm pecah, karet stabilizer tipis, atau ball joint oblak karena pemakaian rutin.",
    gravity: "sedang",
    practicalAdvice: "Aman dipakai pelan di kota, tapi segera diperiksa sebelum ban makan sebelah atau setir melenceng."
  },
  {
    id: "md",
    title: "Transmisi Matic Delay / Jedug",
    category: "Transmisi",
    icon: "Cpu",
    probCause: "Oli matic kotor, filter dalam buntu, atau solenoid valve macet sehingga aliran hidrolik terlambat.",
    gravity: "parah",
    practicalAdvice: "Jangan dipaksa jalan jauh jika jedug makin keras agar girboks tidak aus total dan rusak parah."
  },
  {
    id: "ms",
    title: "Mesin Pincang / Ndut-ndutan",
    category: "Mesin",
    icon: "Zap",
    probCause: "Busi aus, salah satu koil mati, atau throttle body kotor menumpuk kerak karbon.",
    gravity: "sedang",
    practicalAdvice: "Coba matikan AC mobil sejenak. Kalau pincang berlanjut, segera bawa ke bengkel terdekat."
  },
  {
    id: "ac",
    title: "AC Mobil Panas / Hanya Angin",
    category: "Sistem AC",
    icon: "Wind",
    probCause: "Suku cadang magnet clutch aus, freon bocor halus di seal o-ring, atau kompresor lemah.",
    gravity: "ringan",
    practicalAdvice: "Segera matikan tombol AC / e-clutch kalau tercium bau hangus dari arah kabin depan mesin."
  }
];

// SIMPLIFIED HONDA LEVEL SKILLS
const HONDA_LEVELS: Level[] = [
  {
    id: "sa",
    title: "Service Advisor (SA)",
    badge: "Owner Arsalan: Konsultan Teknik Terpercaya",
    desc: "Level penentu kenyamanan Anda saat berkonsultasi. SA bertugas mendengarkan keluhan, mendiagnosis secara hitam-di-atas-putih, merinci estimasi biaya transparan, serta mengawasi kualitas akhir pengerjaan sebelum mobil diserahkan ke Anda.",
    roles: ["Konsultasi Keluhan Detail", "Estimasi Biaya Transparan & Akurat", "Quality Control Akhir", "Diskusi Solusi Suku Cadang Orisinal VS OEM"]
  },
  {
    id: "diag",
    title: "Diagnostic Specialist",
    badge: "Level Teknisi Tertinggi",
    desc: "Spesialis pemecahan masalah rumit kelistrikan, sensor komputerisasi (ECU), transmisi otomatis, dan gejala-gejala aneh yang sering kali gagal diatasi oleh bengkel biasa.",
    roles: ["Analisis Kode Kerusakan Scanner OBD2", "Reset Sensor Kelistrikan bodi & EPS", "Diagnosa Teknis Jalur Hidrolik Matic", "Kalibrasi ECU Standard Honda"]
  },
  {
    id: "senior",
    title: "Senior Technician",
    badge: "Mekanik Ahli Berpengalaman",
    desc: "Mekanik yang bertanggung jawab melakukan eksekusi perbaikan berat mulai dari overhaul mesin, bongkar girboks matic, hingga restorasi kaki-kaki mobil secara rapi dan presisi.",
    roles: ["Overhaul & Turun Mesin", "Bongkar Pasang Girboks Transmisi", "Press & Ganti Bushing Arm", "Penyetelan Kerenggangan Katup Mesin"]
  }
];

// SIMPLIFIED, HUMAN PORTFOLIO items
const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "case-1",
    category: "mesin",
    categoryLabel: "Turun Mesin",
    title: "Perbaikan Overheat & Turun Mesin Honda CR-V Gen 4",
    client: "Bp. Heri (Bojong Rawalumbu, Bekasi)",
    issue: "Mesin pincang parah, radiator bocor dingin bikin air radiator nyebrang campur oli (overheat), oli berubah warna mirip kopi susu.",
    diag: "Tekanan kompresi bocor dari paking head cylinder yang melengkung akibat panas berlebih.",
    solution: "Cylinder head diratakan dengan teliti, ganti paking head orisinal Honda, bongkar ganti seal klep, bersihkan sisa kerak piston ring, ganti oli dan air radiator baru.",
    result: "Mesin kembali halus dan senyap, temperatur normal stabil, kompresi padat, gak pincang lagi.",
    waText: "Halo Arsalan, saya melihat portofolio overheat Honda CR-V gen 4 Anda dan ingin tanya estimasi turun mesin mobil saya.",
    tag: "Honda CR-V Gen 4",
    image: "https://images.unsplash.com/photo-1486055402055-c77dce18193b?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "case-2",
    category: "matic",
    categoryLabel: "Transmisi Matic",
    title: "Perbaikan Transmisi Matic Delay & Jedug Honda Jazz GK5",
    client: "Mbak Vika (Pekayon Jaya, Bekasi)",
    issue: "Masuk gigi D delay lama (3-5 detik) pas mesin dingin di pagi hari, disusul entakan jedug kasar pas tuas digeser.",
    diag: "Jalur body valve kotor tersumbat sisa gram besi dan oli lama, bikin tekanan hidrolik oli telat mengunci kopling.",
    solution: "Bongkar bersihkan body valve, cek kelistrikan solenoid valve, ganti filter oli matic dalam, kuras oli matic pakai oli standard ATF Honda.",
    result: "Pindah gigi langsung responsif lancar, gak ada delay sama sekali pas pagi hari, jalan jadi mulus kembali.",
    waText: "Halo Arsalan, mobil saya transmisi matic-nya delay jedug mirip kasus Honda Jazz di web. Boleh tanya estimasi biaya servisnya?",
    tag: "Honda Jazz RS",
    image: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "case-3",
    category: "kaki",
    categoryLabel: "Spesialis Kaki-Kaki",
    title: "Perbaikan Bunyi Gluduk & Setir Getar Toyota Alphard",
    client: "Bp. Gunawan (Kemang Pratama, Bekasi)",
    issue: "Bunyi gluduk-gluduk kasar di roda depan kanan-kiri pas lewat poldur atau lubang, setir bergetar di tol kecepatan 80 km/jam.",
    diag: "Karet bushing lower arm pecah robek, ball joint longgar/oblak, dan link stabilizer aus.",
    solution: "Ganti karet bushing arm baru, pasang ball joint dan link stabilizer berkualitas, ganti support absorber atas, dilanjutkan spooring balancing yang presisi.",
    result: "Suara gluduk hilang total, setir tenang gak bergetar, suspensi kembali mantap, tenang, dan empuk.",
    waText: "Halo Arsalan, saya mau tanya harga paket perbaikan kaki-kaki gluduk Toyota Alphard seperti kasus di portofolio.",
    tag: "Toyota Alphard",
    image: "https://images.unsplash.com/photo-1562620644-66bd4866bad1?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "case-4",
    category: "lainnya",
    categoryLabel: "Tune Up & AC",
    title: "Tune Up Carbon Clean & AC Kurang Dingin Honda Civic",
    client: "Mas Dimas (Bekasi Barat)",
    issue: "Tarikan gas terasa loyo berat, bensin boros, AC mobil panas cuma keluar angin, ditambah suara berisik dari kompresor AC.",
    diag: "Kerak karbon hitam menumpuk di katup mesin. AC bermasalah karena magnet clutch aus dan freon kurang akibat kebocoran seal bodi.",
    solution: "Tune-up carbon clean sedot kerak karbon di ruang bakar, kuras oli kompresor AC, ganti magnet clutch baru bergaransi, vacuum ganti freon murni.",
    result: "Tarikan gas langsung enteng responsif, bensin lebih irit, AC dingin menggigil kembali normal sejuk.",
    waText: "Halo Arsalan, saya mau tune up komplit carbon clean dan perbaikan AC mobil mirip Honda Civic ini.",
    tag: "Honda Civic Turbo",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"
  }
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSymptomId, setSelectedSymptomId] = useState<string>("kb");
  const [copyStatus, setCopyStatus] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [activeLevel, setActiveLevel] = useState<string>("sa");
  const [activePortfolioTab, setActivePortfolioTab] = useState<string>("all");
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // Auth & Session state for Internal Service Advisor Portal
  const [saUser, setSaUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Estimator Workspace Portal states
  const [activePortalState, setActivePortalState] = useState<"website" | "workspace" | "cms" | "history" | "print">("website");
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [activePrintRecord, setActivePrintRecord] = useState<any>(null);
  const [printSize, setPrintSize] = useState<"half" | "full">("half");
  const [portalUpdateKey, setPortalUpdateKey] = useState(0);

  const handleUpdatePortalStats = () => {
    setPortalUpdateKey(prev => prev + 1);
  };

  const handleLogout = async () => {
    const { auth } = await import("./utils/firebase");
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    sessionStorage.removeItem("sa_pin_bypass_session");
    setSaUser(null);
    EstimasiDb.stopFirebaseSync();
    setActivePortalState("website");
  };

  // Listen for Firebase Auth state changes
  useEffect(() => {
    let unsubscribe: () => void;

    import("./utils/firebase").then(({ auth }) => {
      import("firebase/auth").then(({ onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword }) => {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user && !user.isAnonymous && user.email !== "service.advisor@arsalanjaya.internal") {
            const allowedEmails = ["herdisat29@gmail.com"];
            const isAllowed = user.email && (allowedEmails.includes(user.email.toLowerCase()) || user.email.toLowerCase().endsWith("@arsalanjaya.internal"));
            if (isAllowed) {
              const loggedIn = {
                uid: user.uid,
                name: user.displayName || "Owner Arsalan",
                email: user.email,
                photoURL: user.photoURL,
                method: "Google Auth"
              };
              setSaUser(loggedIn);
              // Initiate cloud Firestore automated syncer
              EstimasiDb.startFirebaseSync(() => {
                setPortalUpdateKey(prev => prev + 1);
              });
            } else {
              console.warn("Unauthorized Google Auth session ignored:", user.email);
              setSaUser(null);
            }
          } else {
            // checking if there are PIN bypasses in active tab session
            const session = sessionStorage.getItem("sa_pin_bypass_session");
            if (session) {
              setSaUser(JSON.parse(session));
              EstimasiDb.startFirebaseSync(() => {
                setPortalUpdateKey(prev => prev + 1);
              });
            } else {
              setSaUser(null);
              EstimasiDb.stopFirebaseSync();
            }
          }
          setAuthLoading(false);
        });
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    setCurrentTime(formatter.format(now));

    // dynamic local SEO schema
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "AutoRepair",
      "name": "Arsalan Jaya Automotif",
      "image": "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=600",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jl. Mirah Delima Raya No.79, Bojong Rawalumbu",
        "addressLocality": "Kota Bekasi",
        "addressRegion": "Jawa Barat",
        "postalCode": "17116",
        "addressCountry": "ID"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -6.2916598,
        "longitude": 106.9936269
      },
      "url": window.location.origin,
      "telephone": "+628111235229",
      "priceRange": "$$",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      ],
      "areaServed": ["Bekasi", "Rawalumbu", "Bojong Rawalumbu", "Pekayon", "Kemang Pratama", "Bekasi Timur", "Bekasi Barat"]
    };

    const scriptId = "local-seo-schema";
    let scriptTag = document.getElementById(scriptId);
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = scriptId;
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.innerHTML = JSON.stringify(schemaData);
      document.head.appendChild(scriptTag);
    }

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("Jl. Mirah Delima Raya No.79, Bojong Rawalumbu, Kota Bekasi 17116");
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const currentSymptom = SYMPTOMS.find(s => s.id === selectedSymptomId) || SYMPTOMS[0];

  const filteredPortfolio = activePortfolioTab === "all" 
    ? PORTFOLIO_ITEMS 
    : PORTFOLIO_ITEMS.filter(item => item.category === activePortfolioTab);

  if (["workspace", "cms", "history"].includes(activePortalState)) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-mono tracking-widest uppercase text-slate-400">Menghubungkan Database Cloud...</p>
        </div>
      );
    }

    if (!saUser) {
      return (
        <EstimasiLogin
          onBackToWeb={() => setActivePortalState("website")}
          onSuccess={(user) => {
            sessionStorage.setItem("sa_pin_bypass_session", JSON.stringify(user));
            setSaUser(user);
            EstimasiDb.startFirebaseSync(() => {
              setPortalUpdateKey(prev => prev + 1);
            });
          }}
        />
      );
    }

    // Read stats reactively using the database helper
    const list = EstimasiDb.getEstimasiHistory();
    const totalRecords = list.length;
    const printedCount = list.filter(r => r.status === "printed").length;
    const pendingCount = list.filter(r => r.status !== "printed").length;

    return (
      <div className="min-h-screen bg-slate-50 font-sans text-neutral-800">
        
        {/* OPERATIONAL SA PORTAL HEADER */}
        <header className="bg-white border-b border-slate-200 print:hidden sticky top-0 z-50 shadow-sm">
          
          {/* Top Panel: Crimson & Crisp White */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 md:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            
            {/* Top Row: Brand & User Status side-by-side on mobile */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <button
                  onClick={() => { setActivePortalState("website"); setEditingRecord(null); }}
                  className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-lg md:rounded-xl flex items-center justify-center text-white border border-red-500 shadow-md shrink-0 hover:bg-red-750 transition cursor-pointer"
                  title="Kembali ke Web Halaman Utama"
                >
                  <Wrench className="w-4 h-4 md:w-5 md:h-5 animate-spin" style={{ animationDuration: "8s" }} />
                </button>
                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => { setActivePortalState("website"); setEditingRecord(null); }}
                      className="font-sans text-[12px] sm:text-xs md:text-base font-black tracking-tight text-neutral-900 uppercase leading-none hover:text-red-650 transition-colors cursor-pointer text-left focus:outline-none"
                      title="Kembali ke Web Halaman Utama"
                    >
                      ARSALAN JAYA AUTOMOTIF
                    </button>
                    <span className="text-[7.5px] sm:text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.2 md:px-2 md:py-0.5 rounded-full font-bold uppercase shrink-0">
                      EX Honda SA
                    </span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-mono tracking-widest text-neutral-400 block uppercase leading-none mt-0.5 md:mt-1">
                    Service Advisor System
                  </span>
                </div>
              </div>

              {/* User Avatar Box (Only visible on Mobile view here) */}
              <div className="flex items-center md:hidden shrink-0">
                {saUser && (
                  <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[9px] uppercase shadow-sm shrink-0">
                      {saUser.name.slice(0, 2)}
                    </div>
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-[9px] font-black tracking-tight text-neutral-900 uppercase max-w-[70px] truncate">
                        {saUser.name.split(" ")[0]}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="text-[8px] font-mono font-black text-red-600 hover:text-red-700 hover:underline transition self-start leading-none mt-0.5 uppercase tracking-wider cursor-pointer"
                        title="Logout"
                      >
                        LOGOUT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Switch Tab Navigation */}
            <nav className="flex flex-row overflow-x-auto w-full md:w-auto items-center justify-start md:justify-center gap-1 md:gap-1.5 p-1 bg-slate-105 rounded-xl border border-slate-200 scrollbar-none">
              <button
                onClick={() => { setActivePortalState("workspace"); }}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 shrink-0 ${
                  activePortalState === "workspace"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/15"
                    : "text-slate-600 hover:text-red-600 hover:bg-slate-200"
                }`}
              >
                <span>📝 1. Form</span>
              </button>
              <button
                onClick={() => { setActivePortalState("history"); }}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 md:space-x-1.5 shrink-0 ${
                  activePortalState === "history"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/15"
                    : "text-slate-600 hover:text-red-600 hover:bg-slate-200"
                }`}
              >
                <span>📚 2. Arsip</span>
                <span className={`text-[9px] md:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  activePortalState === "history" ? "bg-white text-red-600" : "bg-slate-205 text-slate-700"
                }`}>
                  {totalRecords}
                </span>
              </button>
              <button
                onClick={() => { setActivePortalState("cms"); }}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 shrink-0 ${
                  activePortalState === "cms"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/15"
                    : "text-slate-600 hover:text-red-600 hover:bg-slate-200"
                }`}
              >
                <span>⚙️ 3. Katalog</span>
              </button>
            </nav>

            {/* Desktop User Avatar (Hidden on Mobile) */}
            <div className="hidden md:flex items-center shrink-0">
              {saUser && (
                <div className="flex items-center space-x-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                  {/* Initials/Avatar */}
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                    {saUser.name.slice(0, 2)}
                  </div>
                  {/* Account detail & Logout beneath */}
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[11px] font-black tracking-tight text-neutral-900 uppercase">
                      {saUser.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-[9px] font-mono font-black text-red-600 hover:text-red-700 hover:underline transition self-start leading-none mt-1 uppercase tracking-widest cursor-pointer"
                      title="Keluar dari sesi portal internal SA"
                    >
                      🚪 LOGOUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sharp Red Chest Accent Stripe */}
          <div className="bg-red-600 h-1 md:h-1.5 w-full"></div>

          {/* Deep Charcoal Operational Ribbon */}
          <div className="bg-slate-950 text-slate-100 py-1.5 md:py-2.5 px-3 sm:px-6 border-b border-black">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] sm:text-[10.5px] font-mono leading-none">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="text-slate-400 font-bold uppercase text-[8px] sm:text-xs">STATUS:</span>
                <span className="text-emerald-400 font-extrabold uppercase text-[8.5px] sm:text-xs">SOP BENGKEL &amp; CLOUD SYNC</span>
              </div>
              
              {/* STATUS MONITORING RIBBON */}
              <div className="flex flex-row items-center justify-center gap-2.5 md:gap-3.5">
                <div className="flex items-center space-x-1">
                  <span className="text-neutral-400 font-bold uppercase text-[8px] sm:text-[9px]">Selesai:</span>
                  <span className="font-extrabold text-white text-[10px] sm:text-xs">{totalRecords}</span>
                </div>
                <span className="text-slate-800">|</span>
                <div className="flex items-center space-x-1">
                  <span className="text-amber-400 font-bold uppercase text-[8px] sm:text-[9px]">Draft:</span>
                  <span className="font-extrabold text-amber-300 text-[10px] sm:text-xs animate-pulse">{pendingCount}</span>
                </div>
                <span className="text-slate-800">|</span>
                <div className="flex items-center space-x-1">
                  <span className="text-emerald-400 font-bold uppercase text-[8px] sm:text-[9px]">Cetak:</span>
                  <span className="font-extrabold text-emerald-300 text-[10px] sm:text-xs">{printedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PORTAL BODY CONTAINER */}
        <div className="animate-fade-in">
          {activePortalState === "workspace" && (
            <EstimasiForm 
              onOpenCMS={() => setActivePortalState("cms")}
              onOpenHistory={() => setActivePortalState("history")}
              onOpenPrint={(rec) => {
                setActivePrintRecord(rec);
                setActivePortalState("print");
              }}
              loadRecordToEdit={editingRecord}
              clearEditRecord={() => setEditingRecord(null)}
              onDatabaseChange={handleUpdatePortalStats}
            />
          )}

          {activePortalState === "cms" && (
            <EstimasiCMS 
              onBack={() => setActivePortalState("workspace")}
              onDatabaseChange={handleUpdatePortalStats}
            />
          )}

          {activePortalState === "history" && (
            <EstimasiHistory 
              onBack={() => setActivePortalState("workspace")}
              onEditRecord={(rec) => {
                setEditingRecord(rec);
                setActivePortalState("workspace");
              }}
              onPrintRecord={(rec) => {
                setActivePrintRecord(rec);
                setActivePortalState("print");
              }}
              onDatabaseChange={handleUpdatePortalStats}
            />
          )}
        </div>
      </div>
    );
  }

  if (activePortalState === "print") {
    return (
      <EstimasiPrint 
        record={activePrintRecord}
        onBack={() => {
          setActivePortalState(editingRecord ? "workspace" : "history");
        }}
        printSize={printSize}
        onChangeSize={(size) => setPrintSize(size)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-800 font-sans selection:bg-red-600 selection:text-white">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm" id="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <a 
                href="#hero" 
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById("hero");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="hover:opacity-85 transition-opacity flex items-center space-x-2.5"
              >
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white border border-red-500 shadow-sm shrink-0">
                  <Wrench className="w-4 h-4 animate-pulse" />
                </div>
                <span className="font-display text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 block uppercase leading-none whitespace-nowrap">
                  ARSALAN JAYA <span className="text-red-600">AUTOMOTIF</span>
                </span>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-4 lg:space-x-5 text-sm font-semibold text-neutral-700 items-center">
              <a href="#services" className="hover:text-red-600 transition-colors uppercase tracking-wider text-[11px]">Layanan</a>
              <span className="text-slate-300 font-normal">|</span>
              <a href="#portfolio" className="hover:text-red-600 transition-colors uppercase tracking-wider text-[11px]">Karya Nyata</a>
              <span className="text-slate-300 font-normal">|</span>
              <a href="#about" className="hover:text-red-600 transition-colors uppercase tracking-wider text-[11px]">Kredibilitas</a>
              <span className="text-slate-300 font-normal">|</span>
              <a href="#testimonials" className="hover:text-red-600 transition-colors uppercase tracking-wider text-[11px]">Testimoni</a>
              <span className="text-slate-300 font-normal">|</span>
              <a href="#contact" className="hover:text-red-600 transition-colors uppercase tracking-wider text-[11px]">Kontak</a>
              <span className="text-slate-300 font-normal">|</span>
              <button 
                onClick={() => setActivePortalState("workspace")}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-neutral-900 text-white rounded-xl text-[11px] tracking-wider uppercase font-extrabold transition-all hover:scale-[1.03] cursor-pointer shrink-0"
              >
                SA Portal ➔
              </button>
            </nav>

            {/* WhatsApp Header CTA */}
            <div className="hidden lg:flex items-center">
              <a 
                href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20saya%20tertarik%20konsultasi%20mengenai%20perbaikan%20mobil"
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-700/10"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </div>
                <span>Konsul WA (0811-1235-229)</span>
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl border border-slate-200 text-neutral-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4 px-6 space-y-3">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-neutral-850 hover:text-red-600">Layanan</a>
            <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-neutral-850 hover:text-red-600">Karya Nyata</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-neutral-850 hover:text-red-600">Kredibilitas</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-neutral-850 hover:text-red-600">Testimoni</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-neutral-850 hover:text-red-600">Kontak</a>
            <button 
              onClick={() => { setActivePortalState("workspace"); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-sm font-extrabold text-red-600 uppercase hover:text-red-850"
            >
              SA Portal / Estimator ➔
            </button>
            <div className="pt-2">
              <a 
                href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20saya%20tertarik%20konsultasi%20mengenai%20perbaikan%20mobil"
                className="w-full justify-center inline-flex items-center space-x-2 bg-emerald-600 text-white font-extrabold text-xs tracking-wider uppercase px-4 py-3 rounded-xl"
              >
                <span>Konsultasi WA Sekarang</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* CORE CONTENT */}
      <main>
        
        {/* HERO SECTION */}
        <section id="hero" className="relative py-12 lg:py-20 bg-slate-50 border-b border-slate-200 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2.5 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full text-red-600 text-xs font-bold leading-none w-fit uppercase">
                  <span className="flex h-2 w-2 rounded-full bg-red-600"></span>
                  <span>Mantan Service Advisor (SA) Honda Resmi</span>
                </div>
                
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight uppercase leading-none">
                  BENGKEL MOBIL BEKASI <span className="text-red-600">STANDAR RESMI</span> TANPA BIAYA MAHAL
                </h1>
                
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-xl font-semibold">
                  Atasi masalah bunyi gluduk kaki-kaki, matic delay/jedug, AC panas, kelistrikan, &amp; turun mesin. Dikerjakan teliti oleh mantan SA &amp; teknisi resmi Honda dengan garansi bersahabat.
                </p>

                {/* Direct Action CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a 
                    href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20saya%20ingin%20konsultasi%20dan%20booking%20jadwal%20servis%20mobil" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-neutral-900 text-white font-extrabold py-4 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all text-center"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Booking &amp; Tanya Estimasi Biaya</span>
                  </a>
                  <a 
                    href="#diagnostics" 
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-bold py-4 px-6 rounded-2xl text-xs border border-slate-200 transition-all uppercase tracking-wider text-center"
                  >
                    <Search className="w-4 h-4" />
                    <span>Pengecekan Gejala Mandiri</span>
                  </a>
                </div>

                {/* Sub-badging list */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80">
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-700">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Mantan SA Honda</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-700">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Standby &amp; Fleksibel</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-700">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Pick-Up Servis</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-700">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Garansi Tertulis</span>
                  </div>
                </div>
              </div>

              {/* Right Column Booking/Operational Widget */}
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent rounded-3xl blur-2xl"></div>
                <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200 flex flex-col justify-between">
                  
                  {/* Widget Header */}
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider">
                      STATUS JADWAL BENGKEL
                    </span>
                  </div>

                  {/* Widget Main Box Content */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xs font-extrabold tracking-wider text-neutral-900 uppercase">
                        Emergency &amp; Service Booking
                      </h3>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                        Standby &amp; Emergency
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4">
                      <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0 h-fit self-center border border-red-100">
                        <Truck className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Layanan Darurat &amp; Jemput Mobil</h4>
                        <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed font-sans font-medium">
                          Mogok di jalan atau tidak sempat bawa mobil ke bengkel? Mekanik kami siap jemput/kunjungi lokasi Anda di Rawalumbu, Pekayon, Kemang Pratama, dan wilayah Bekasi lainnya.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="py-2 px-1 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="block text-[8px] text-neutral-500 font-mono tracking-wider uppercase font-semibold">Area Utama</span>
                        <span className="block text-[10px] font-black text-red-600 mt-0.5 uppercase">Bekasi Kota &amp; Timur</span>
                      </div>
                      <div className="py-2 px-1 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="block text-[8px] text-neutral-500 font-mono tracking-wider uppercase font-semibold">Respon Darurat</span>
                        <span className="block text-[10px] font-black text-emerald-600 mt-0.5 uppercase">Mekanik Siaga</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between text-[10px] font-serif font-semibold">
                        <span className="text-neutral-650 uppercase font-mono text-[9px] tracking-wide font-black">Slot Berjalan:</span>
                        <span className="font-mono text-emerald-600 font-bold">{currentTime || "Ready"}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-red-500 h-full rounded-full w-[85%]" />
                      </div>
                    </div>

                    <a
                      href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20mobil%20saya%20mengalami%20kendala%20di%20jalan%20dan%20meminta%20bantuan%20mekanik%20emergency"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                    >
                      <span>Tanya / Hubungi Mekanik</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TRUST BADGES SECTION */}
        <section className="py-10 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-neutral-900 uppercase">Mantan SA Honda</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-relaxed">
                    Dipimpin oleh mantan Service Advisor bengkel resmi, pengerjaan mengacu SOP dealer asli.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-neutral-900 uppercase">Standby &amp; Fleksibel</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-relaxed">
                    Jam kerja normal fleksibel (bisa melebihi jam biasa). Chat &amp; bantuan emergency jalanan standby 24 jam!
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex-shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-neutral-900 uppercase">Pick-Up &amp; Home Service</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-relaxed">
                    Malas keluar? Mobil kami jemput atau mekanik datang langsung ke garasi Anda.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-neutral-900 uppercase">Garansi Tertulis</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-relaxed">
                    Setiap pengerjaan besar memiliki jaminan garansi tertulis hitam-di-atas-putih.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION (MOVED UP) */}
        <section id="testimonials" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg w-fit uppercase">
                ULASAN GOOGLE MAPS ASLI
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-3 uppercase tracking-tight">
                APA KATA MEREKA YANG SUDAH PERBAIKAN DI SINI?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-semibold">
                Kepuasan pelanggan adalah taruhan nama baik kami. Ulasan murni dari Google Maps tanpa rekayasa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Testimonial 1 */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl relative shadow-sm">
                <span className="absolute top-6 right-6 text-red-600 font-serif text-5xl leading-none select-none opacity-20">&ldquo;</span>
                <div className="flex items-center space-x-1.5 text-yellow-450 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs sm:text-sm text-neutral-60o leading-relaxed font-sans font-medium mb-6">
                  &ldquo;Nemu bengkel ini dari google maps karena mobil Honda Jazz saya jalurnya tersendat dan matic-nya delay mengentak pas pagi hari. Ditangani langsung diarahkan ganti filter oli matic dan dibersihkan solenoid body valve-nya. Sangat hemat dibanding perkiraan saya harus ganti girboks di dealer! Penjelasannya jujur sekali.&rdquo;
                </p>
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                    EA
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 uppercase">Ego Andriano</h5>
                    <span className="block text-[10px] text-neutral-500 font-medium">Blora - Bojong Rawalumbu, Bekasi (Pemilik Jazz GK5)</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl relative shadow-sm">
                <span className="absolute top-6 right-6 text-red-600 font-serif text-5xl leading-none select-none opacity-20">&ldquo;</span>
                <div className="flex items-center space-x-1.5 text-yellow-450 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans font-medium mb-6">
                  &ldquo;Awalnya ragu karena standby darurat 24 jam tak pikir abal-abal, ternyata ownernya mantan Service Advisor Honda resmi! Sangat sabar menjelaskan kenapa setir Alphard saya bunyi gluduk pas lewat poldur Kemang Pratama. Setelah ganti karet bushing lower arm dan stabilizer, sekarang senyap empuk banget. Recommended seller!&rdquo;
                </p>
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                    MT
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 uppercase">Monika Tarihoran</h5>
                    <span className="block text-[10px] text-neutral-500 font-medium">Kemang Pratama, Bekasi (Pemilik Toyota Alphard)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <a 
                href="https://www.google.com/maps/place/arsalanjayaautomotif" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-black text-red-600 hover:underline uppercase tracking-wider"
              >
                <span>Lihat Semua Ulasan di Google Maps</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* KARYA NYATA (PORTFOLIO GALLERY) MOVED UP */}
        <section id="portfolio" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg w-fit uppercase">
                STUDI KASUS &amp; GALERI PENGERJAAN NYATA
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-3 uppercase tracking-tight">
                BUKTI NYATA PERBAIKAN TIM ARSALAN
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-semibold">
                Kami bukan sekadar menjual janji. Berikut rangkuman pekerjaan nyata pada mobil pelanggan yang kami selesaikan dengan rapi.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {["all", "mesin", "matic", "kaki", "lainnya"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActivePortfolioTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    activePortfolioTab === tab
                      ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/15"
                      : "bg-slate-50 text-neutral-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tab === "all" ? "Semua Kasus" : tab === "mesin" ? "Turun Mesin" : tab === "matic" ? "Matic delay/jedug" : tab === "kaki" ? "Kaki-Kaki" : "Tune Up & Lainnya"}
                </button>
              ))}
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {filteredPortfolio.map(item => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 sm:h-56 bg-slate-200">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {item.categoryLabel}
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="block text-[10px] text-neutral-550 font-mono font-bold uppercase tracking-wide">{item.client}</span>
                        <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mt-1 uppercase tracking-tight leading-snug">{item.title}</h3>
                      </div>
                      
                      <div className="space-y-2 text-xs sm:text-sm">
                        <p><strong className="text-slate-900 font-extrabold uppercase text-[10px] tracking-wide block">Gejala Awal:</strong> <span className="text-neutral-600 font-medium font-sans">{item.issue}</span></p>
                        <p><strong className="text-slate-900 font-extrabold uppercase text-[10px] tracking-wide block">Analisis &amp; Diagnosa:</strong> <span className="text-neutral-605 font-semibold font-sans">{item.diag}</span></p>
                        <p><strong className="text-slate-900 font-extrabold uppercase text-[10px] tracking-wide block">Solusi Yang Dilakukan:</strong> <span className="text-neutral-600 font-serif font-medium">{item.solution}</span></p>
                        <p><strong className="text-slate-900 font-extrabold uppercase text-[10px] tracking-wide block">Hasil Akhir:</strong> <span className="text-emerald-700 font-bold font-sans">{item.result}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <a
                      href={`https://wa.me/628111235229?text=${encodeURIComponent(item.waText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-red-600 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Tanya / Kirim Keluhan Kasus Ini</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES / JASA SERVIS (CONCISE & PUNCHY) */}
        <section id="services" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg w-fit uppercase">
                DAFTAR JASA PERBAIKAN MOBIL
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-3 uppercase tracking-tight">
                LAYANAN UTAMA BENGKEL ARSALAN
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-semibold">
                Kami melayani perbaikan mobil multi-merk, dengan spesialisasi keahlian di mobil Honda. Hubungi WA untuk konsultasi harga bersahabat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Service 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-500/20 transition-all shadow-sm">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit mb-4">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase">Tune Up &amp; Carbon Clean</h3>
                <p className="text-xs text-neutral-550 mt-2.5 font-medium leading-relaxed font-sans">
                  Membersihkan timbunan kerak karbon di ruang bakar piston. Hasilnya tarikan gas kembali enteng dan konsumsi bensin jadi irit.
                </p>
                <a 
                  href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20mau%20booking%20Tune%20Up%20dan%20Carbon%20Clean" 
                  className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 hover:underline mt-4 uppercase tracking-wide"
                >
                  <span>Tanya Harga Paket Tune Up</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Service 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-500/20 transition-all shadow-sm">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase">Spesialis Kaki-Kaki &amp; Suspensi</h3>
                <p className="text-xs text-neutral-550 mt-2.5 font-medium leading-relaxed font-sans">
                  Selesaikan masalah suara gluduk, setir goyang kecepatan tinggi, limbung, ganti bushing lower arm, stabilizer, ball joint, &amp; shockbreaker.
                </p>
                <a 
                  href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20mau%20konsultasi%20mengenai%20kaki-kaki%20mobil%20bunyi%20gluduk" 
                  className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 hover:underline mt-4 uppercase tracking-wide"
                >
                  <span>Cek Harga Paket Kaki-Kaki</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Service 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-500/20 transition-all shadow-sm">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase">Transmisi Matic Delay / Jedug</h3>
                <p className="text-xs text-neutral-550 mt-2.5 font-medium leading-relaxed font-sans">
                  Kuras oli matic CVT/AT, cuci dan bersihkan body valve, cek solenoid valve buntu. Hemat jutaan dibanding ganti girboks baru.
                </p>
                <a 
                  href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20mau%20tanya%20masalah%20matic%20delay%20jedug%20dan%20kuras%20oli" 
                  className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 hover:underline mt-4 uppercase tracking-wide"
                >
                  <span>Minta Estimasi Transmisi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Service 4 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-500/20 transition-all shadow-sm">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase">Turun Mesin (Overhaul)</h3>
                <p className="text-xs text-neutral-550 mt-2.5 font-medium leading-relaxed font-sans">
                  Atasi masalah mobil berasap putih, oli nyebrang campur air, overheat, mesin bergetar parah, ganti gasket head cylinder rontok.
                </p>
                <a 
                  href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20saya%20punya%20keluhan%20overheat%20atau%20ingin%20tanya%20turun%20mesin" 
                  className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 hover:underline mt-4 uppercase tracking-wide"
                >
                  <span>Konsultasi Turun Mesin</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Service 5 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-500/20 transition-all shadow-sm">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit mb-4">
                  <Wind className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase">AC Mobil Kurang Dingin</h3>
                <p className="text-xs text-neutral-550 mt-2.5 font-medium leading-relaxed font-sans">
                  Ganti magnet clutch aus, vacuum ganti freon murni, bersihkan blower, ganti filter cabin, bersihkan kondensor AC mampet.
                </p>
                <a 
                  href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20ingin%20servis%20AC%20kurang%20dingin%20atau%20ganti%20kopling%2520magnet" 
                  className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 hover:underline mt-4 uppercase tracking-wide"
                >
                  <span>Cek Estimasi Perbaikan AC</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Service 6 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-500/20 transition-all shadow-sm">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit mb-4">
                  <Droplet className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase">Ganti Oli &amp; Servis Berkala</h3>
                <p className="text-xs text-neutral-550 mt-2.5 font-medium leading-relaxed font-sans">
                  Pilihan pelumas berkualitas tinggi (mesin &amp; transmisi) sesuai rekomendasi standar pabrikan untuk menjaga kerja mesin tahan lama.
                </p>
                <a 
                  href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20mau%20tanya%20harga%20ganti%20oli%20dan%2520paket%20servis%20rutin" 
                  className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 hover:underline mt-4 uppercase tracking-wide"
                >
                  <span>Info Harga Ganti Oli</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* INSTAGRAM BANNER REPLICA SHOWCASE */}
        <section className="bg-neutral-900 py-16 text-white overflow-hidden relative border-y border-neutral-800">
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4">
                <div className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-600 px-3 py-1 rounded-full text-red-500 text-[10px] font-mono font-bold uppercase mb-4">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>DOKUMENTASI INSTAGRAM</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none text-white">
                  @arsalanjayaautomotif2
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-3 leading-relaxed font-serif">
                  Intip kegiatan harian kami langsung di workshop Rawalumbu melalui update seru di platform Instagram resmi.
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-neutral-950 p-6 sm:p-8 rounded-3xl border border-neutral-800 space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-500">Menerima Paket Perbaikan Populer:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold font-sans text-neutral-300">
                    <li className="flex items-center space-x-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Tune-Up &amp; Carbon Clean (Civic, Jazz, CRV, dll)</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Kuras Transmisi Matic &amp; Solenoid Valve</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Bongkar Kaki-Kaki Alphard &amp; Honda Series</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Servis AC Berkala &amp; Ganti Magnet Clutch</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Turun Mesin Overhaul Akibat Overheat</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Pemeriksaan Sensor bodi &amp; Scan OBD2</span>
                    </li>
                  </ul>

                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 font-mono">Halaman Beranda Instagram Resmi</span>
                    <a 
                      href="https://instagram.com/arsalanjayaautomotif2" 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-white hover:text-black text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Buka Profil Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SYMPTOM CHECKER PANEL */}
        <section id="diagnostics" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg w-fit uppercase">
                ALAT CEK GEJALA MANDIRI
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-3 uppercase tracking-tight">
                DETEKSI DINI MASALAH MOBIL ANDA
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-semibold">
                Sebelum bertanya ke mekanik, Anda bisa memilih beberapa keluhan di bawah ini untuk melihat perkiraan penyebabnya secara instan.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
              
              {/* Left Column Buttons List */}
              <div className="lg:col-span-5 space-y-3">
                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">PILIH SALAH SATU GEJALA DAN KELUHAN:</span>
                {SYMPTOMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSymptomId(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      selectedSymptomId === item.id
                        ? "bg-red-50 border-red-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl border ${
                        selectedSymptomId === item.id 
                          ? "bg-red-600 text-white border-red-600" 
                          : "bg-slate-200 text-neutral-700 border-slate-300"
                      }`}>
                        {item.icon === "Layers" ? <Layers className="w-4 h-4" /> : 
                         item.icon === "Cpu" ? <Cpu className="w-4 h-4" /> : 
                         item.icon === "Zap" ? <Zap className="w-4 h-4" /> : <Wind className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="block text-[9px] text-neutral-450 uppercase tracking-widest leading-none mb-1 font-mono">{item.category}</span>
                        <span className="block text-xs font-black text-slate-900 uppercase tracking-tight">{item.title}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedSymptomId === item.id ? "text-red-600 translate-x-1" : "text-slate-400"}`} />
                  </button>
                ))}
              </div>

              {/* Right Column Interactive Result Card */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-xs font-mono font-bold text-slate-900 uppercase">PERKIRAAN PENYEBAB &amp; ESTIMASI</span>
                  </div>
                  <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                    currentSymptom.gravity === 'parah'
                      ? "bg-red-50 text-red-700 border-red-200"
                      : currentSymptom.gravity === 'sedang'
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    Tingkat Bahaya: {currentSymptom.gravity.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Gejala Tertebak:</span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase mt-0.5">{currentSymptom.title}</h4>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Kemungkinan Penyebab:</span>
                    <p className="text-xs sm:text-sm text-neutral-700 font-medium font-sans mt-0.5 leading-relaxed">{currentSymptom.probCause}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                    <span className="text-[10px] font-mono text-neutral-550 uppercase tracking-wider block">Solusi Praktis Mekanik:</span>
                    <p className="text-xs text-neutral-60o font-serif font-semibold mt-1 leading-relaxed">{currentSymptom.practicalAdvice}</p>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex items-start gap-3">
                    <div className="bg-neutral-200 p-1.5 rounded-lg text-neutral-700 mt-0.5 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-650 uppercase tracking-wider block font-extrabold text-neutral-600">Estimasi Biaya Servis:</span>
                      <p className="text-xs font-bold text-neutral-800 mt-1 leading-relaxed">
                        Biaya disesuaikan dengan kondisi riil mobil Anda setelah dicek menyeluruh. Tenang, di Arsalan semua estimasi didiskusikan transparan di awal tanpa ada biaya siluman!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200">
                  <a
                    href={`https://wa.me/628111235229?text=Halo%20Arsalan%2C%20saya%20sudah%20mencoba%20alat%20cek%20gejala%20di%20website%20dan%20mendapat%20analisa%20untuk%20gejala%20*${encodeURIComponent(currentSymptom.title)}*.%20Bisa%20berdiskusi%20lebih%20lanjut%3F`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-emerald-600 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 hover:animate-bounce" />
                    <span>Konfirmasi Gejala Mobil Lewat WA</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ABOUT & KREDIBILITAS EX-SA HONDA (MOVED DOWN) */}
        <section id="about" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column Text */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-100 text-red-600 text-xs font-mono font-bold px-3 py-1.5 rounded-lg w-fit uppercase">
                  <span>MANTAN SERVICE ADVISOR RESMI HONDA</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 uppercase leading-none tracking-tight">
                  MENGAPA MANTAN SERVICE ADVISOR (SA) MERUPAKAN USP UTAMA KAMI?
                </h2>
                <div className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-sans font-semibold space-y-4">
                  <p>
                    Banyak pengendara mobil di Bekasi mengeluhkan transparansi perbaikan di bengkel biasa: tagihan tiba-tiba membengkak di akhir, dituduh suku cadang rusak tanpa bukti fisik, atau salah diagnosa akibat mekanik minim pengalaman.
                  </p>
                  <p>
                    Owner Arsalan Jaya Automotif merupakan mantan <strong className="text-neutral-900 font-extrabold">Service Advisor (SA)</strong> resmi dari dealer Honda HPM. Sebagai SA, posisi kami di dealer dahulu adalah konsultan utama yang menjembatani keluhan customer dan pengerjaan mekanik. Kami terlatih menganalisis kode kesalahan transmisi, membaca manual book ATPM secara presisi, serta merawat kendaraan sesuai SOP tinggi pabrikan.
                  </p>
                  <p>
                    Di bengkel Arsalan, kami mempertahankan integritas dan kedisiplinan tersebut. Suku cadang lama yang kami ganti selalu diperlihatkan kepada Anda, estimasi harga dirinci jujur hitam-di-atas-putih sebelum perbaikan dimulai, serta bebas dari biaya tersembunyi aneh di belakang.
                  </p>
                </div>
                
                <div className="pt-2">
                  <a 
                    href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20saya%20tertarik%20tanya%20estimasi%20standar%20SA%20untuk%20servis%20mobil%20saya" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-neutral-900 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Konsultasi Standar Honda Via WA</span>
                  </a>
                </div>
              </div>

              {/* Right Column Technical Level Showcase */}
              <div className="lg:col-span-6 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl relative shadow-sm">
                <span className="block text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest mb-4">KLASIFIKASI KEAHLIAN MEKANIK UTAMA KAMI:</span>
                
                {/* Tabs Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {HONDA_LEVELS.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setActiveLevel(level.id)}
                      className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase text-center border transition-all ${
                        activeLevel === level.id
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-slate-50 text-neutral-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {level.title}
                    </button>
                  ))}
                </div>

                {/* Tab Render Content */}
                {(() => {
                  const level = HONDA_LEVELS.find(l => l.id === activeLevel) || HONDA_LEVELS[0];
                  return (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <span className="bg-red-50 text-red-700 border border-red-100 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          {level.badge}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 uppercase mt-2.5 font-display tracking-tight">{level.title}</h4>
                        <p className="text-xs text-neutral-600 font-sans font-semibold leading-relaxed mt-1.5">{level.desc}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-150 space-y-2.5">
                        <span className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Tanggung Jawab Teknis:</span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-neutral-700">
                          {level.roles.map((role, idx) => (
                            <li key={idx} className="flex items-center space-x-2 font-sans">
                              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>{role}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}

              </div>

            </div>
          </div>
        </section>

        {/* EDU-TIPS & SEO BLOG HUB */}
        <section id="blog" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg w-fit uppercase">
                EDU-TIPS &amp; BLOG OTOMOTIF
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-3 uppercase tracking-tight">
                PANDUAN SOLUSI OTOMOTIF ARSALAN
              </h2>
              <p className="text-xs sm:text-sm text-neutral-505 mt-2 font-semibold">
                Tips praktis mendeteksi dini masalah mobil Anda agar tetap prima di jalan raya kota Bekasi.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
              
              {/* Article 1 */}
              <div className={`border rounded-3xl p-6 transition-all ${expandedArticleId === "blog-1" ? "border-red-600 bg-red-50/5" : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-100 text-red-700 border border-red-250 text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">Transmisi Matic</span>
                      <span className="text-[10px] text-neutral-500 font-mono font-bold">INFO 3 MENIT</span>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-black text-neutral-900 uppercase tracking-tight leading-snug">
                      Transmisi Matic Delay &amp; Jedug Pas Pagi Hari? Ini Cara Cek Murahnya!
                    </h3>
                  </div>
                  <button
                    onClick={() => setExpandedArticleId(expandedArticleId === "blog-1" ? null : "blog-1")}
                    className="shrink-0 px-4 py-2 bg-white border border-slate-300 hover:border-red-600 rounded-xl text-xs font-bold text-neutral-700 hover:text-red-600 transition-all uppercase tracking-wider"
                  >
                    {expandedArticleId === "blog-1" ? "Tutup Panduan" : "Checklist Solusi"}
                  </button>
                </div>

                {expandedArticleId === "blog-1" && (
                  <div className="mt-6 pt-6 border-t border-slate-200 text-xs sm:text-sm leading-relaxed text-neutral-700 space-y-4 animate-fadeIn">
                    <p className="font-medium text-neutral-60o">
                      Banyak pemilik mobil matic di kawasan Rawalumbu dan Pekayon Bekasi yang terkejut saat memindahkan gigi ke posisi D di pagi hari terasentakan jedug yang hebat. Jangan langsung buru-buru turun girboks dulu!
                    </p>
                    <div className="bg-white border rounded-2xl p-4 space-y-2">
                      <h4 className="text-[10px] font-mono font-extrabold text-slate-900 uppercase tracking-wider">3 Langkah Deteksi Mandiri:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-600 font-semibold font-sans">
                        <li>Cek Level Dipstick Oli Matic: Pastikan level oli matic dalam rentang normal.</li>
                        <li>Amati Warna Oli: Apabila warnanya cokelat kehitaman, oli matic sudah jenuh viskositasnya.</li>
                        <li>Bandingkan Durasi Delay: Normalnya kopling mengunci kurang dari 1.5 detik sejak tuas dipindah.</li>
                      </ol>
                    </div>
                    <div className="pt-2">
                      <a
                        href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20saya%20membaca%20artikel%20matic%20delay%20jedug%20dan%20ingin%20tanya%20kuras%20oli"
                        className="inline-flex items-center gap-2 bg-red-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase"
                      >
                        <span>Konsultasi Transmisi Matic Via WA</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Article 2 */}
              <div className={`border rounded-3xl p-6 transition-all ${expandedArticleId === "blog-2" ? "border-red-600 bg-red-50/5" : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-100 text-red-700 border border-red-250 text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">Kaki-Kaki</span>
                      <span className="text-[10px] text-neutral-500 font-mono font-bold">INFO 4 MENIT</span>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-black text-neutral-900 uppercase tracking-tight leading-snug">
                      Setir Mobil Goyang dan Bunyi Gluduk di Bekasi? Cek 4 Komponen Ini!
                    </h3>
                  </div>
                  <button
                    onClick={() => setExpandedArticleId(expandedArticleId === "blog-2" ? null : "blog-2")}
                    className="shrink-0 px-4 py-2 bg-white border border-slate-300 hover:border-red-600 rounded-xl text-xs font-bold text-neutral-700 hover:text-red-305 transition-all uppercase tracking-wider"
                  >
                    {expandedArticleId === "blog-2" ? "Tutup Panduan" : "Checklist Solusi"}
                  </button>
                </div>

                {expandedArticleId === "blog-2" && (
                  <div className="mt-6 pt-6 border-t border-slate-200 text-xs sm:text-sm leading-relaxed text-neutral-700 space-y-4 animate-fadeIn">
                    <p className="font-medium text-neutral-60o">
                      Jalanan yang padat dan sering berlubang di Bekasi memaksa komponen suspensi bekerja ekstra keras. Jangan abaikan suara mendecit kasar saat menanjak atau setir melenceng.
                    </p>
                    <div className="bg-white border rounded-2xl p-4 space-y-2">
                      <h4 className="text-[10px] font-mono font-extrabold text-slate-900 uppercase tracking-wider">4 Suku Cadang Kaki-Kaki yang Wajib Diperhatikan:</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600 font-semibold font-sans">
                        <li>Ball Joint: Sendi penghubung roda yang sering kendor memicu setir tak seimbang.</li>
                        <li>Karet Bushing Arm: Peredam getaran benturan sasis besi, rawan pecah karena panas.</li>
                        <li>Link Stabilizer: Penstabil ayunan suspensi, kalau aus memicu bunyi gluduk kasar.</li>
                        <li>Tierod / Rack End: Pemicu getaran setir kecepatan tinggi di tol.</li>
                      </ul>
                    </div>
                    <div className="pt-2">
                      <a
                        href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20mau%20pengecekan%20gratis%20kaki-kaki%20mobil%20ke%20bengkel"
                        className="inline-flex items-center gap-2 bg-red-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase"
                      >
                        <span>Tanya Harga Paket Kaki-Kaki</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Article 3 */}
              <div className={`border rounded-3xl p-6 transition-all ${expandedArticleId === "blog-3" ? "border-red-600 bg-red-50/5" : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-100 text-red-700 border border-red-250 text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">Eksklusif SA</span>
                      <span className="text-[10px] text-neutral-500 font-mono font-bold">INFO 5 MENIT</span>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-black text-neutral-900 uppercase tracking-tight leading-snug">
                      Kenapa Tanya ke Mantan SA Honda Resmi Bisa Menghemat Jutaan Rupiah?
                    </h3>
                  </div>
                  <button
                    onClick={() => setExpandedArticleId(expandedArticleId === "blog-3" ? null : "blog-3")}
                    className="shrink-0 px-4 py-2 bg-white border border-slate-300 hover:border-red-600 rounded-xl text-xs font-bold text-neutral-700 hover:text-red-305 transition-all uppercase tracking-wider"
                  >
                    {expandedArticleId === "blog-3" ? "Tutup Panduan" : "Checklist Solusi"}
                  </button>
                </div>

                {expandedArticleId === "blog-3" && (
                  <div className="mt-6 pt-6 border-t border-slate-200 text-xs sm:text-sm leading-relaxed text-neutral-700 space-y-4 animate-fadeIn">
                    <p className="font-medium text-neutral-60o">
                      Banyak pemilik mobil takut ke bengkel non-resmi karena cemas tidak standar pabrik, namun enggan ke dealer resmi karena biayanya yang sangat tinggi. Berikut rahasia menghemat biaya minimal 50%:
                    </p>
                    <div className="bg-white border rounded-2xl p-4 space-y-2 text-xs text-neutral-600 font-semibold font-sans">
                      <p>1. Transparansi Berdiskusi: Anda diperbolehkan masuk ke area kerja, melihat letak kerusakan suku cadang secara langsung.</p>
                      <p>2. Tekanan Jasa Hemat: Tidak terbebani biaya overhead gedung elite dealer resmi.</p>
                      <p>3. Pilihan Suku Cadang: Anda dibebaskan memilih barang original resmi atau alternatif OEM merk tepercaya.</p>
                    </div>
                    <div className="pt-2">
                      <a
                        href="https://wa.me/628111235229?text=Halo%20Arsalan%2C%20saya%20tertarik%20tanya%20estimasi%20standar%20SA%20Honda%20untuk%20mobil%20saya"
                        className="inline-flex items-center gap-2 bg-red-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase"
                      >
                        <span>Hubungi SA Via WA</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* RICH SEO FAQ SECTION */}
        <section className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-neutral-900 text-center mb-10 uppercase tracking-tight">
              PERTANYAAN UMUM (FAQ) BENGKEL MOBIL BEKASI
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h4 className="text-xs sm:text-sm font-black text-neutral-900 uppercase leading-snug">Bagaimana jam operasional Arsalan Jaya Automotif?</h4>
                <p className="text-xs text-neutral-550 mt-2 leading-relaxed font-sans font-medium">
                  Bengkel fisik kami beroperasi dengan jam kerja normal yang cenderung sangat fleksibel (bisa melebihi jam biasa karena sebagai bengkel berkembang). Namun untuk konsultasi tanya-jawab via WhatsApp dan bantuan darurat (emergency/jemput mobil), tim kami tetap standby 24 jam penuh!
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h4 className="text-xs sm:text-sm font-black text-neutral-900 uppercase leading-snug">Bagaimana cara memesan Pick Up &amp; Home Service?</h4>
                <p className="text-xs text-neutral-550 mt-2 leading-relaxed font-sans font-medium">
                  Cukup klik tombol WA di halaman ini. Beritahu kami tipe mobil dan keluhan awal Anda, tim kami akan mengambil mobil Anda atau menjadwalkan mekanik datang ke rumah Anda.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h4 className="text-xs sm:text-sm font-black text-neutral-900 uppercase leading-snug">Apakah ada jaminan garansi setelah perbaikan?</h4>
                <p className="text-xs text-neutral-550 mt-2 leading-relaxed font-sans font-medium">
                  Tentu. Kami memberikan jaminan garansi tertulis untuk perbaikan besar seperti turun mesin (overhaul) dan perbaikan transmisi otomatis matic sesuai kesepakatan suku cadang.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h4 className="text-xs sm:text-sm font-black text-neutral-900 uppercase leading-snug">Berapa lama pengerjaan untuk Tune up Carbon Clean?</h4>
                <p className="text-xs text-neutral-550 mt-2 leading-relaxed font-sans font-medium">
                  Pengerjaan tune-up / carbon clean dan pembersihan kerak ruang bakar menyeluruh biasanya memakan waktu kurang lebih 1 hingga 2 jam kerja tergantung kesiapan fisik antrean di base workshop.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* LOKASI DAN KONTAK WORKSHOP */}
        <section className="py-20 bg-slate-100/30 border-b border-slate-200" id="contact">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Address Info */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div>
                  <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-100 text-red-600 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg w-fit uppercase mb-4">
                    <span>INFORMASI LOKASI &amp; KONTAK</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-neutral-900 uppercase leading-tight">
                    Kunjungi Workshop Kami di Rawalumbu Bekasi
                  </h2>
                  <p className="text-neutral-555 text-xs sm:text-sm mt-3 leading-relaxed font-semibold">
                    Arsalan Jaya Automotif berpusat di wilayah Bojong Rawalumbu yang sangat mudah dijangkau dari arah Tol Bekasi Timur, Pekayon, Kemang Pratama, dan Bekasi Barat.
                  </p>
                </div>

                <address className="not-italic flex flex-col space-y-4 pt-2">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[8px] font-mono text-neutral-400 uppercase tracking-wider">Alamat Lengkap</span>
                      <span className="block text-xs sm:text-sm font-bold text-neutral-900">
                        Jl. Mirah Delima Raya No.79, Bojong Rawalumbu, Kota Bekasi 17116
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[8px] font-mono text-neutral-400 uppercase tracking-wider">Jam Operasional</span>
                        <span className="block text-xs font-bold text-neutral-900">Jam Kerja Fleksibel &amp; Standby 24 Jam</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[8px] font-mono text-neutral-400 uppercase tracking-wider">WhatsApp Hubungi</span>
                        <a href="https://wa.me/628111235229" className="block text-xs font-bold text-red-600 hover:underline">
                          0811-1235-229
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[8px] font-mono text-neutral-400 uppercase tracking-wider">Instagram Resmi</span>
                      <a href="https://instagram.com/arsalanjayaautomotif2" target="_blank" rel="noreferrer" className="block text-xs font-bold text-slate-800 hover:underline">
                        @arsalanjayaautomotif2
                      </a>
                    </div>
                  </div>
                </address>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button 
                    onClick={handleCopyAddress}
                    className="flex-1 inline-flex items-center justify-center space-x-2 bg-slate-50 hover:bg-neutral-900 hover:text-white text-neutral-700 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold transition-all uppercase tracking-wider"
                  >
                    <Copy className="w-4 h-4 text-neutral-450" />
                    <span>{copyStatus ? "Alamat Berhasil Disalin!" : "Salin Alamat Lengkap"}</span>
                  </button>
                  <a 
                    href="https://maps.google.com/?q=Jl.+Mirah+Delima+Raya+No.79,+Bojong+Rawalumbu,+Bekasi" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl text-xs font-bold transition-all text-center uppercase tracking-wider font-extrabold"
                  >
                    <span>Petunjuk Rute Jalan</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Dynamic Embed Map */}
              <div className="lg:col-span-6 min-h-[350px] lg:min-h-full">
                <div className="w-full h-full min-h-[350px] bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-sm flex flex-col justify-between">
                  <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Peta Lokasi Bengkel</span>
                    </div>
                    <span className="text-[8px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-red-100">REAL PETA</span>
                  </div>

                  <div className="flex-1 w-full min-h-[250px] relative">
                    <iframe
                      title="Arsalan Jaya Automotif Real Maps Embed"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.7332305541607!2d106.9914328!3d-6.2916598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698d74451e7483%3A0xbbfb7b0ee45c00be!2sArsalan%20Jaya%20Automotif!5e0!3m2!1sid!2sid!4v1717281600000!5m2!1sid!2sid"
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>

                  <div className="p-3 bg-white border-t border-slate-200">
                    <a 
                      href="https://www.google.com/maps/place/arsalanjayaautomotif/@-6.2916598,106.9936269" 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-neutral-800 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2 transition-all border border-slate-200 uppercase tracking-wider"
                    >
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span>Buka Aplikasi Google Maps</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-100 border-t border-slate-200 pt-16 pb-8" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-200">
            
            <div className="md:col-span-4 flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white border border-red-500 shadow-sm animate-pulse">
                  <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <span className="font-display text-lg font-bold text-slate-900 block uppercase">
                    ARSALAN JAYA
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-red-600 font-bold block uppercase -mt-1">
                    Automotif
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-60O leading-relaxed font-sans font-medium">
                Bengkel spesialis mobil Bekasi dengan kualitas pengerjaan standar resmi mantan Service Advisor (SA) Honda. Melayani perbaikan kelistrikan, kaki-kaki, tune up &amp; carbon clean, dan kuras matic dengan layanan konsultasi 24 jam penuh.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">Akses Cepat</h4>
              <nav className="flex flex-col space-y-2 text-xs text-slate-700 font-semibold font-sans">
                <a href="#hero" className="hover:text-red-600">Home</a>
                <a href="#testimonials" className="hover:text-red-600">Testimoni</a>
                <a href="#portfolio" className="hover:text-red-600">Karya Nyata</a>
                <a href="#services" className="hover:text-red-600">Layanan</a>
                <a href="#diagnostics" className="hover:text-red-600">Cek Gejala</a>
              </nav>
            </div>

            <div className="md:col-span-3 flex flex-col space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">Kata Kunci Utama</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-semibold">
                bengkel mobil Bekasi standby 24 jam • bengkel spesialis Honda Bekasi • ganti oli Bekasi • perbaikan matic delay jedug • kaki mobil bunyi gluduk • reparasi shockbreaker Bekasi • tune up mobil Rawalumbu • home service mobil Bekasi • kuras oli matic Bekasi.
              </p>
            </div>

            <div className="md:col-span-3 flex flex-col space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">Hubungi Segera</h4>
              <div className="text-xs text-neutral-60o space-y-2 font-sans font-medium">
                <p><strong>Kontak Telepon / WA:</strong> <span className="font-extrabold text-slate-900">0811-1235-229</span></p>
                <p><strong>Instagram:</strong> <span className="font-semibold text-slate-900">@arsalanjayaautomotif2</span></p>
                <p><strong>Jam Operasional:</strong> <span className="font-semibold text-slate-900">Jam Kerja Fleksibel (Konsultasi &amp; Emergency Standby 24 Jam)</span></p>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-mono gap-4">
            <span>&copy; {new Date().getFullYear()} Arsalan Jaya Automotif. Hak Cipta Dilindungi Undang-Undang.</span>
            <span>Made in Bekasi | Optimasi SEO Lokal Bersahabat | ⚠️ Not Financial Advice</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
