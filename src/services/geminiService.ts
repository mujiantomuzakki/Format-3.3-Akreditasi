import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface AnalysisResult {
  indikatorId: number;
  rekapData: string;
  dataPerluDikumpulkan: string;
}

export async function analyzeButir(
  manualData: {
    namaAsesor: string;
    nia: string;
    namaSekolah: string;
    npsn: string;
  },
  documentsText: string,
  butir: { description: string; indikators: { id: number; text: string }[] }
): Promise<AnalysisResult[]> {
  const indicatorsList = butir.indikators.map((ind, i) => `${i + 1}. ${ind.text}`).join("\n");
  
  const prompt = `
    Anda adalah seorang Asesor Akreditasi Sekolah/Madrasah.
    Tugas Anda adalah mengisi Format 3.3 Persiapan Penggalian Data berdasarkan dokumen yang diunggah.
    
    Data Sekolah:
    Nama Sekolah: ${manualData.namaSekolah}
    NPSN: ${manualData.npsn}
    Nama Asesor: ${manualData.namaAsesor}
    NIA: ${manualData.nia}

    Butir: ${butir.description}

    Daftar Indikator yang harus dianalisis:
    ${indicatorsList}

    Teks dari Dokumen Pendukung (Kurikulum, RKT, RKAS, Kalender, RPP, dll):
    ${documentsText.substring(0, 30000)} // Limit text to avoid token limits

    Instruksi untuk SETIAP indikator:
    1. Isi kolom "C. Rekap Data yang sudah Teridentifikasi":
       - Cari bukti spesifik dari teks dokumen yang mendukung indikator tersebut.
       - Tuliskan secara rinci dan jelas (Contoh: "Pada RPP kelas IV semester 1 terdapat...", "Dalam Kurikulum Satuan Pendidikan bab II disebutkan...").
       - Jika terdapat lebih dari satu poin atau kalimat, susunlah secara vertikal menggunakan penomoran huruf (a., b., c., dst.).
       - Jika TIDAK ADA bukti yang relevan dalam dokumen, kosongkan (string kosong "").
       - JANGAN memberikan jawaban generik. Harus berdasar pada isi dokumen.

    2. Isi kolom "D. Data yang perlu dikumpulkan saat visitasi":
       - Tentukan data apa saja yang perlu digali lebih lanjut melalui wawancara, observasi, atau penelaahan dokumen fisik saat visitasi.
       - Harus rinci, jelas, dan spesifik menyesuaikan dengan apa yang sudah ditemukan (atau belum ditemukan) di kolom C.
       - Susunlah secara vertikal menggunakan penomoran huruf (a., b., c., dst.) jika terdapat lebih dari satu poin.
       - Kolom ini HARUS diisi untuk setiap indikator sebagai bahan visitasi.

    Berikan jawaban dalam format JSON berupa ARRAY of objects, di mana setiap object mewakili hasil analisis untuk satu indikator sesuai urutan daftar di atas.
  `;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rekapData: { type: Type.STRING },
                dataPerluDikumpulkan: { type: Type.STRING },
              },
              required: ["rekapData", "dataPerluDikumpulkan"],
            },
          },
        },
      });

      const results = JSON.parse(response.text || "[]");
      return butir.indikators.map((ind, i) => ({
        indikatorId: ind.id,
        rekapData: results[i]?.rekapData || "",
        dataPerluDikumpulkan: results[i]?.dataPerluDikumpulkan || "",
      }));
    } catch (error: any) {
      const isQuotaError = error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isQuotaError && retryCount < maxRetries) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`Gemini Quota Exceeded. Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      console.error("Error analyzing with Gemini:", error);
      
      if (isQuotaError) {
        throw new Error("QUOTA_EXHAUSTED");
      }
      
      return butir.indikators.map(ind => ({
        indikatorId: ind.id,
        rekapData: "",
        dataPerluDikumpulkan: "Gagal menganalisis data.",
      }));
    }
  }

  return butir.indikators.map(ind => ({
    indikatorId: ind.id,
    rekapData: "",
    dataPerluDikumpulkan: "Gagal setelah beberapa kali percobaan.",
  }));
}
