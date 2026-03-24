import React, { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  User as UserIcon,
  Hash,
  School,
  FileUp,
  Trash2,
  LogIn,
  LogOut,
  History,
  Save,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DATA_BUTIR } from './constants';
import { extractTextFromFile } from './utils/fileParser';
import { analyzeButir, AnalysisResult } from './services/geminiService';
import { generateWordDoc } from './utils/wordGenerator';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  Timestamp
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GeneratedRow {
  butirId: number;
  indikatorId: number;
  butirText: string;
  indikatorText: string;
  rekap: string;
  visitasi: string;
}

interface SavedResult {
  id: string;
  namaSekolah: string;
  npsn: string;
  createdAt: Timestamp;
  results: GeneratedRow[];
  namaAsesor: string;
  nia: string;
  provinsi: string;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Terjadi kesalahan yang tidak terduga.";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        errorMessage = `Kesalahan Firestore: ${parsedError.error} (Operasi: ${parsedError.operationType})`;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-soft-bg p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Ups! Terjadi Kesalahan</h2>
            <p className="text-text-secondary mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [namaAsesor, setNamaAsesor] = useState('');
  const [nia, setNia] = useState('');
  const [namaSekolah, setNamaSekolah] = useState('');
  const [npsn, setNpsn] = useState('');
  const [provinsi, setProvinsi] = useState('');
  
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    kurikulum: null,
    rkt: null,
    rkas: null,
    kalender: null,
    rpp: null,
    media: null,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<GeneratedRow[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          role: 'user', // Default role
          createdAt: serverTimestamp()
        }, { merge: true }).catch(err => {
          console.error("Error syncing user profile:", err);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for saved results
  useEffect(() => {
    if (!user || !isAuthReady) {
      setSavedResults([]);
      return;
    }

    const q = query(
      collection(db, 'analysisResults'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resultsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedResult[];
      setSavedResults(resultsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'analysisResults');
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login Error:", err);
      setError("Gagal login dengan Google.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setResults([]);
      setNamaAsesor('');
      setNia('');
      setNamaSekolah('');
      setNpsn('');
      setProvinsi('');
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const handleFileChange = (key: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleAnalyze = async () => {
    if (!namaAsesor || !nia || !namaSekolah || !npsn || !provinsi) {
      setError("Mohon lengkapi data identitas.");
      return;
    }

    const uploadedFiles = Object.values(files).filter(f => f !== null) as File[];
    if (uploadedFiles.length === 0) {
      setError("Mohon upload setidaknya satu dokumen pendukung.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults([]);

    try {
      let combinedText = "";
      for (const file of uploadedFiles) {
        const text = await extractTextFromFile(file);
        combinedText += `\n--- DOKUMEN: ${file.name} ---\n${text}\n`;
      }

      const manualData = { namaAsesor, nia, namaSekolah, npsn };
      const newResults: GeneratedRow[] = [];

      // Process each Butir (batching indicators)
      for (const butir of DATA_BUTIR) {
        const batchResults = await analyzeButir(
          manualData,
          combinedText,
          butir
        );
        
        for (const analysis of batchResults) {
          const indikator = butir.indikators.find(i => i.id === analysis.indikatorId);
          if (indikator) {
            newResults.push({
              butirId: butir.id,
              indikatorId: indikator.id,
              butirText: butir.description,
              indikatorText: indikator.text,
              rekap: analysis.rekapData,
              visitasi: analysis.dataPerluDikumpulkan,
            });
          }
        }
        
        // Update UI incrementally after each Butir
        setResults([...newResults]);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "QUOTA_EXHAUSTED") {
        setError("Kuota API Gemini telah habis. Mohon tunggu beberapa saat atau cek detail paket/billing Anda di Google AI Studio.");
      } else {
        setError("Terjadi kesalahan saat menganalisis dokumen. Silakan coba lagi nanti.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      setError("Anda harus login untuk menyimpan ke cloud.");
      return;
    }
    if (results.length === 0) return;

    setIsSaving(true);
    try {
      const resultRef = doc(collection(db, 'analysisResults'));
      await setDoc(resultRef, {
        uid: user.uid,
        namaAsesor,
        nia,
        namaSekolah,
        npsn,
        provinsi,
        results,
        createdAt: serverTimestamp()
      });
      alert("Hasil analisis berhasil disimpan ke cloud!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'analysisResults');
    } finally {
      setIsSaving(false);
    }
  };

  const loadResult = (res: SavedResult) => {
    setNamaAsesor(res.namaAsesor);
    setNia(res.nia);
    setNamaSekolah(res.namaSekolah);
    setNpsn(res.npsn);
    setProvinsi(res.provinsi);
    setResults(res.results);
    setShowHistory(false);
  };

  const handleCopy = () => {
    const header = `Format 3.3 Persiapan Penggalian Data\nNama Asesor: ${namaAsesor}\nNIA: ${nia}\nSekolah: ${namaSekolah}\nNPSN: ${npsn}\nProvinsi: ${provinsi}\n\n`;
    const tableHeader = "Butir | Indikator | Rekap Data Teridentifikasi | Data Perlu Dikumpulkan\n";
    const tableBody = results.map(r => 
      `${r.butirText} | ${r.indikatorText} | ${r.rekap} | ${r.visitasi}`
    ).join("\n");
    
    navigator.clipboard.writeText(header + tableHeader + tableBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const tableData = results.map(r => ({
      butir: r.butirText,
      indikator: r.indikatorText,
      rekap: r.rekap,
      visitasi: r.visitasi
    }));
    generateWordDoc({ namaAsesor, nia, namaSekolah, npsn, provinsi }, tableData);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-bg">
        <Loader2 className="animate-spin text-primary-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-bg text-text-primary font-sans selection:bg-highlight/10">
      {/* HEADER */}
      <header className="bg-white border-b border-border-soft sticky top-0 z-50">
        <div className="max-w-[900px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-semibold text-primary-blue tracking-tight">Format 3.3 Persiapan Penggalian Data</h1>
            <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Akreditasi Satuan Pendidikan 2025</p>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 hover:bg-soft-bg rounded-full transition-colors relative"
                  title="Riwayat Analisis"
                >
                  <History size={20} className="text-text-secondary" />
                  {savedResults.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                      {savedResults.length}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-2 bg-soft-bg px-3 py-1.5 rounded-full">
                  <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  <span className="text-xs font-medium hidden sm:inline">{user.displayName}</span>
                  <button onClick={handleLogout} className="text-text-secondary hover:text-red-500 transition-colors">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleLogin} className="btn-primary !py-2 !px-4 text-sm">
                <LogIn size={16} />
                Login Google
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-10">
        <AnimatePresence>
          {showHistory && (
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-section bg-white border-primary-blue/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <History size={20} className="text-primary-blue" />
                  Riwayat Analisis Anda
                </h2>
                <button onClick={() => setShowHistory(false)} className="text-text-secondary hover:text-primary-blue">
                  Tutup
                </button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {savedResults.length > 0 ? (
                  savedResults.map((res) => (
                    <div 
                      key={res.id} 
                      className="p-4 border border-border-soft rounded-xl hover:border-primary-blue/30 cursor-pointer transition-all flex items-center justify-between group"
                      onClick={() => loadResult(res)}
                    >
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary-blue transition-colors">{res.namaSekolah}</p>
                        <p className="text-[10px] text-text-secondary">NPSN: {res.npsn} • {res.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-soft-bg px-2 py-1 rounded-md text-text-secondary">{res.results.length} Butir</span>
                        <Plus size={16} className="text-text-secondary group-hover:text-primary-blue" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-text-secondary text-sm">Belum ada riwayat analisis yang disimpan.</p>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          
          {/* FORM AREA: Identitas */}
          <section className="card-section">
            <h2 className="text-lg font-medium text-text-primary mb-6 flex items-center gap-2">
              <UserIcon size={20} className="text-primary-blue" />
              Identitas Asesor & Sekolah
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">Nama Asesor</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                  <input 
                    value={namaAsesor} 
                    onChange={e => setNamaAsesor(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Contoh: Budi Santoso, M.Pd"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">NIA</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                  <input 
                    value={nia} 
                    onChange={e => setNia(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Contoh: 3521021009"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">Nama Sekolah</label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                  <input 
                    value={namaSekolah} 
                    onChange={e => setNamaSekolah(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Contoh: SD Negeri 1 Merdeka"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">Provinsi</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                  <input 
                    value={provinsi} 
                    onChange={e => setProvinsi(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Contoh: JAWA TIMUR"
                  />
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-text-secondary">NPSN</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                  <input 
                    value={npsn} 
                    onChange={e => setNpsn(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Contoh: 60714970"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* FORM AREA: Dokumen */}
          <section className="card-section">
            <h2 className="text-lg font-medium text-text-primary mb-6 flex items-center gap-2">
              <FileUp size={20} className="text-primary-blue" />
              Dokumen Pendukung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'kurikulum', label: 'Kurikulum Satuan Pendidikan', accept: '.pdf,.docx' },
                { id: 'rkt', label: 'Rencana Kerja Tahunan (RKT)', accept: '.pdf,.docx' },
                { id: 'rkas', label: 'Rencana Kegiatan & Anggaran (RKAS)', accept: '.pdf,.docx' },
                { id: 'kalender', label: 'Kalender Akademik', accept: '.pdf,.docx' },
                { id: 'rpp', label: 'Contoh Perencanaan Pembelajaran', accept: '.pdf,.docx' },
                { id: 'media', label: 'Foto/Video Pembelajaran', accept: '.pdf,.docx,.mp4,.gp,.wmv,.jpg,.jpeg' },
              ].map((item) => (
                <div key={item.id} className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary px-1">{item.label}</label>
                  <div className={cn(
                    "relative border border-border-soft rounded-[10px] p-3 transition-all flex items-center justify-between group",
                    files[item.id] ? "bg-primary-blue/5 border-primary-blue/20" : "bg-white hover:border-primary-blue/30"
                  )}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        files[item.id] ? "bg-primary-blue text-white" : "bg-soft-bg text-text-secondary/40"
                      )}>
                        {files[item.id] ? <Check size={14} /> : <Upload size={14} />}
                      </div>
                      <div className="overflow-hidden">
                        <p className={cn("text-xs font-medium truncate", files[item.id] ? "text-primary-blue" : "text-text-secondary")}>
                          {files[item.id] ? files[item.id]?.name : "Pilih file..."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {files[item.id] && (
                        <button 
                          onClick={() => handleFileChange(item.id, null)}
                          className="p-1.5 hover:bg-red-50 text-red-400 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <input 
                        type="file" 
                        accept={item.accept}
                        onChange={e => handleFileChange(item.id, e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="btn-primary w-full mt-8 py-3.5 text-base"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Menganalisis Dokumen...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Generate Format 3.3
                </>
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-[10px] flex items-start gap-3 text-red-600 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </section>

          {/* RESULTS AREA */}
          <section className="card-section !p-0 overflow-hidden">
            <div className="p-6 border-b border-border-soft flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-4">
              <h2 className="text-lg font-medium">Hasil Analisis</h2>
              <div className="flex flex-wrap items-center gap-3">
                {user && results.length > 0 && (
                  <button 
                    onClick={handleSaveToCloud}
                    disabled={isSaving}
                    className="btn-secondary !py-2 !px-4 text-sm border-green-600 text-green-600 hover:bg-green-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Simpan Cloud
                  </button>
                )}
                <button 
                  onClick={handleCopy}
                  disabled={results.length === 0}
                  className="btn-secondary !py-2 !px-4 text-sm"
                >
                  {copied ? <Check size={16} className="text-primary-blue" /> : <Copy size={16} />}
                  {copied ? "Tersalin" : "Salin Teks"}
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={results.length === 0}
                  className="btn-primary !py-2 !px-4 text-sm"
                >
                  <Download size={16} />
                  Download Word
                </button>
              </div>
            </div>

            <div className="min-h-[400px]">
              {results.length > 0 ? (
                <div className="divide-y divide-border-soft">
                  <div className="grid grid-cols-12 bg-soft-bg text-[11px] font-semibold uppercase tracking-wider text-text-secondary text-center">
                    <div className="col-span-3 p-4 border-r border-border-soft">A. Butir</div>
                    <div className="col-span-3 p-4 border-r border-border-soft">B. Indikator</div>
                    <div className="col-span-3 p-4 border-r border-border-soft">C. Rekap Data</div>
                    <div className="col-span-3 p-4">D. Data Visitasi</div>
                  </div>
                  {results.map((row, idx) => (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={`${row.butirId}-${row.indikatorId}`}
                      className="grid grid-cols-12 hover:bg-soft-bg/50 transition-colors"
                    >
                      <div className="col-span-3 p-4 border-r border-border-soft text-xs font-medium text-text-primary">
                        {idx === 0 || results[idx-1].butirId !== row.butirId ? row.butirText : ""}
                      </div>
                      <div className="col-span-3 p-4 border-r border-border-soft text-xs text-text-secondary">
                        {row.indikatorText}
                      </div>
                      <div className="col-span-3 p-4 border-r border-border-soft text-xs text-text-secondary whitespace-pre-wrap text-left">
                        {row.rekap || "-"}
                      </div>
                      <div className="col-span-3 p-4 text-xs font-medium text-primary-blue whitespace-pre-wrap text-left">
                        {row.visitasi}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-text-secondary/30 p-12 text-center">
                  <div className="w-16 h-16 bg-soft-bg rounded-full flex items-center justify-center mb-4">
                    <FileText size={32} />
                  </div>
                  <p className="font-medium text-lg text-text-secondary/60">Belum Ada Data</p>
                  <p className="text-sm mt-1">Upload dokumen dan klik "Generate" untuk mulai menganalisis.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-10 border-t border-border-soft py-10 bg-white">
        <div className="max-w-[900px] mx-auto px-6 text-center space-y-2">
          <p className="text-sm font-semibold text-text-primary">@2026 Panggonan Sinau Bareng</p>
          <p className="text-xs text-text-secondary">Dibuat oleh <span className="font-semibold text-primary-blue">Mujianto</span></p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
