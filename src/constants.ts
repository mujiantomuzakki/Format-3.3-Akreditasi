export interface Indikator {
  id: number;
  text: string;
}

export interface Butir {
  id: number;
  title: string;
  description: string;
  indikators: Indikator[];
}

export const DATA_BUTIR: Butir[] = [
  {
    id: 1,
    title: "Butir 1",
    description: "1. Pendidik menyediakan dukungan sosial emosional bagi peserta didik dalam proses pembelajaran.",
    indikators: [
      { id: 1, text: "Interaksi pendidik dengan murid yang setara dan menghargai" },
      { id: 2, text: "Interaksi yang membangun pola pikir bertumbuh" },
      { id: 3, text: "Memberi perhatian dan bantuan pada murid yang membutuhkan dukungan lebih/ekstra" },
      { id: 4, text: "Strategi pengajaran yang membangun keterampilan sosial emosional pada murid" },
    ],
  },
  {
    id: 2,
    title: "Butir 2",
    description: "2. Pendidik mengelola kelas untuk menciptakan suasana belajar yang aman, nyaman, dan mendukung tercapainya tujuan pembelajaran.",
    indikators: [
      { id: 1, text: "Kesepakatan kelas yang disusun secara partisipatif" },
      { id: 2, text: "Penegakan disiplin dengan pendekatan positif" },
      { id: 3, text: "Waktu di kelas terfokus pada kegiatan belajar" },
    ],
  },
  {
    id: 3,
    title: "Butir 3",
    description: "3. Pendidik mengelola proses pembelajaran secara efektif dan bermakna.",
    indikators: [
      { id: 1, text: "Perencanaan yang memadai untuk mendukung pelaksanaan pembelajaran." },
      { id: 2, text: "Penilaian formatif digunakan sebagai umpan balik dalam proses pembelajaran" },
      { id: 3, text: "Penilaian sumatif dilakukan dengan metode yang beragam menggunakan instrumen yang sesuai dengan tujuan pembelajaran." },
      { id: 4, text: "Hasil penilaian dilaporkan secara informatif untuk mendorong tindak lanjut perbaikan." },
      { id: 5, text: "Praktik pengajaran yang memfasilitasi murid untuk menganalisis, mengutarakan gagasan, dan menghubungkan pengetahuannya dengan pengetahuan baru dan konteks aplikatif" },
    ],
  },
  {
    id: 4,
    title: "Butir 4",
    description: "4. Pendidik memfasilitasi pembelajaran yang efektif dalam membangun keimanan, ketakwaan, komitmen kebangsaan, kemampuan bernalar dan memecahkan masalah, serta karakter dan kompetensi lainnya yang relevan bagi peserta didik.",
    indikators: [
      { id: 1, text: "Pembelajaran yang efektif menguatkan keimanan dan ketakwaan murid pada Tuhan YME untuk membentuk akhlak yang mulia." },
      { id: 2, text: "Pembelajaran yang efektif dalam menguatkan kecintaan terhadap sejarah, kekayaan budaya, alam Indonesia, pemikiran, dan karya anak bangsa" },
      { id: 3, text: "Pembelajaran yang efektif dalam memfasilitasi murid untuk mengembangkan kemampuan bernalar dan memecahkan masalah" },
      { id: 4, text: "Pembelajaran yang efektif dalam membangun kompetensi dan/atau karakter yang menjadi misi utama sekolah/madrasah" },
    ],
  },
  {
    id: 5,
    title: "Butir 5",
    description: "5. Kepala satuan pendidikan menerapkan budaya refleksi untuk perbaikan pembelajaran yang berpusat pada peserta didik, serta evaluasi kinerja untuk rencana pengembangan profesional bagi pendidik dan tenaga kependidikan.",
    indikators: [
      { id: 1, text: "Fasilitasi kepada guru dan tenaga kependidikan untuk melakukan refleksi kinerja dalam rangka perbaikan pembelajaran" },
      { id: 2, text: "Evaluasi kinerja dilakukan oleh kepsek kepada guru dan tendik dalam rangka meningkatkan kualitas pembelajaran yang dilakukan secara berkala dan sistematis" },
      { id: 3, text: "Program pengembangan profesional guru untuk peningkatan kualitas pembelajaran telah dilakukan\n\nCatatan untuk Indikator 2.5.3:\nMenimbang ragamnya jenis tenaga kependidikan yang ada di sekolah/madrasah, indikator kinerja ini hanya mengukur pelaksanaan pengembangan kompetensi pada guru." },
      { id: 4, text: "Pengelolaan guru dan tenaga kependidikan yang efektif dan akuntabel dalam hal pemberian kompensasi, penghargaan atau sanksi berbasis kinerja" },
    ],
  },
  {
    id: 6,
    title: "Butir 6",
    description: "6. Kepala satuan pendidikan menghadirkan layanan belajar yang partisipatif dan kolaboratif untuk tercapainya visi dan misi.",
    indikators: [
      { id: 1, text: "Visi dan misi sekolah/madrasah yang jelas dan dipahami oleh berbagai pemangku kepentingan" },
      { id: 2, text: "Adanya kolaborasi atau kemitraan dengan berbagai pihak (termasuk orang tua/wali, mitra, dudi, dst) dalam rangka mendukung penyelenggaraan layanan pendidikan secara efektif" },
      { id: 3, text: "Pelaksanaan evaluasi/refleksi berbasis data yang melibatkan berbagai pihak yang relevan" },
      { id: 4, text: "Perencanaan kegiatan tahunan dilakukan berdasarkan data yang diperoleh dari evaluasi/refleksi." },
    ],
  },
  {
    id: 7,
    title: "Butir 7",
    description: "7. Kepala satuan pendidikan memastikan pengelolaan anggaran dilakukan sesuai perencanaan berdasarkan refleksi yang berbasis data secara transparan dan akuntabel.",
    indikators: [
      { id: 1, text: "Anggaran sekolah dikelola sesuai dengan perencanaan tahunan" },
      { id: 2, text: "Rencana anggaran sekolah menunjukkan sumber pendanaan serta alokasi pemanfaatannya" },
      { id: 3, text: "Ada laporan berkala tentang pemanfaatan anggaran sekolah kepada pemangku kepentingan" },
    ],
  },
  {
    id: 8,
    title: "Butir 8",
    description: "8. Kepala satuan pendidikan memimpin pengelolaan sarana dan prasarana sesuai dengan kebutuhan pembelajaran yang berpusat pada peserta didik.",
    indikators: [
      { id: 1, text: "Pemenuhan sarana dan prasarana yang sesuai dengan kebutuhan belajar murid (dapat disediakan secara mandiri maupun bermitra)" },
      { id: 2, text: "Pengelolaan sarana dan prasarana secara optimal" },
    ],
  },
  {
    id: 9,
    title: "Butir 9",
    description: "9. Kepala satuan pendidikan mengembangkan kurikulum di tingkat satuan pendidikan yang selaras dengan kurikulum nasional.",
    indikators: [
      { id: 1, text: "Kepemilikan kurikulum satuan pendidikan sebagai rujukan penyelenggaraan proses pembelajaran" },
      { id: 2, text: "Adanya mekanisme evaluasi terhadap penerapan kurikulum" },
      { id: 3, text: "Kurikulum satuan pendidikan relevan dengan kebutuhan belajar murid dan visi misi sekolah" },
    ],
  },
  {
    id: 10,
    title: "Butir 10",
    description: "10. Satuan pendidikan memastikan terbangunnya iklim kebinekaan bagi peserta didik, pendidik, dan tenaga kependidikan.",
    indikators: [
      { id: 1, text: "Iklim lingkungan belajar membangun sikap positif terhadap keberagaman" },
      { id: 2, text: "Iklim lingkungan belajar yang memfasilitasi hak sipil warga untuk beribadah dan berbudaya" },
      { id: 3, text: "Iklim lingkungan belajar membangun kesadaran terhadap kesetaraan gender" },
    ],
  },
  {
    id: 11,
    title: "Butir 11",
    description: "11. Satuan pendidikan menyediakan lingkungan belajar yang inklusif untuk memenuhi kebutuhan belajar peserta didik yang beragam.",
    indikators: [
      { id: 1, text: "Kebijakan dan/atau prosedur yang menghadirkan lingkungan belajar yang inklusif" },
      { id: 2, text: "Program bagi guru, orang tua/wali, dan murid untuk menghadirkan lingkungan belajar yang inklusif" },
    ],
  },
  {
    id: 12,
    title: "Butir 12",
    description: "12. Satuan pendidikan mewujudkan iklim lingkungan belajar yang aman secara psikis bagi peserta didik, pendidik, dan tenaga kependidikan.",
    indikators: [
      { id: 1, text: "Kebijakan dalam pencegahan dan penanganan perundungan dan kekerasan." },
      { id: 2, text: "Program bagi warga sekolah/madrasah dalam pencegahan dan penanganan perundungan dan kekerasan" },
    ],
  },
  {
    id: 13,
    title: "Butir 13",
    description: "13. Satuan pendidikan memastikan keselamatan peserta didik, pendidik, dan tenaga kependidikan.",
    indikators: [
      { id: 1, text: "Iklim lingkungan belajar yang menjaga keselamatan warga sekolah/madrasah" },
      { id: 2, text: "Kesiapan dalam pemberian Pertolongan Pertama pada Kecelakaan (P3K)" },
      { id: 3, text: "Kesiapan sekolah/madrasah dalam menghadapi ragam potensi bencana" },
    ],
  },
  {
    id: 14,
    title: "Butir 14",
    description: "14. Satuan pendidikan menjamin lingkungan yang sehat dan memiliki/melaksanakan program yang membangun kesehatan fisik dan mental pada peserta didik, pendidik, dan tenaga kependidikan",
    indikators: [
      { id: 1, text: "Iklim lingkungan belajar membangun pola hidup bersih dan sehat" },
      { id: 2, text: "Program untuk membangun kesehatan mental pada murid, guru, dan tenaga kependidikan" },
      { id: 3, text: "Edukasi tentang pencegahan adiksi dan kesehatan reproduksi" },
    ],
  },
];
