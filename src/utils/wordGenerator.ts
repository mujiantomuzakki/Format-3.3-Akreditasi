import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, TextRun, BorderStyle, PageOrientation, VerticalAlign } from "docx";
import { saveAs } from "file-saver";

interface TableData {
  butir: string;
  indikator: string;
  rekap: string;
  visitasi: string;
}

export async function generateWordDoc(
  manualData: {
    namaAsesor: string;
    nia: string;
    namaSekolah: string;
    npsn: string;
    provinsi: string;
  },
  tableData: TableData[]
) {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22, // 11pt
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 16838, // A4 height in twips -> now width for landscape
              height: 11906, // A4 width in twips -> now height for landscape
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Format 3.3 Persiapan Penggalian Data",
                bold: true,
                size: 28, // 14pt
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "LEMBAR KERJA PERSIAPAN PENGGALIAN DATA",
                bold: true,
                size: 24, // 12pt
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `BAN-PDM PROVINSI ${manualData.provinsi.toUpperCase()}`,
                bold: true,
                size: 24, // 12pt
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          // Identity Section using a Table for neat alignment
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Nama Asesor", bold: true }), new TextRun({ text: " : " }), new TextRun({ text: manualData.namaAsesor })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "NIA", bold: true }), new TextRun({ text: " : " }), new TextRun({ text: manualData.nia })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Nama Satuan Pendidikan", bold: true }), new TextRun({ text: " : " }), new TextRun({ text: manualData.namaSekolah })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "NPSN", bold: true }), new TextRun({ text: " : " }), new TextRun({ text: manualData.npsn })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Langkah Kerja", bold: true })],
            spacing: { before: 400, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. Asesor menelaah dokumen berikut untuk menentukan data mana yang akan digali lebih mendalam pada saat visitasi." }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "● Deskripsi Kinerja Asesi", bold: true }),
            ],
            indent: { left: 720 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Dalam proses akreditasi nanti, penjabaran ini dilakukan oleh asesi di dalam Sispena sebelum pelaksanaan visitasi." }),
            ],
            indent: { left: 1080 },
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "● Dokumentasi Wajib yang diunggah oleh asesi yaitu:", bold: true }),
            ],
            indent: { left: 720 },
          }),
          ...[
            "1. Kurikulum di tingkat satuan pendidikan",
            "2. Rencana kerja tahunan",
            "3. Rencana kegiatan dan anggaran satuan pendidikan",
            "4. Kalender tahunan kegiatan pendidikan/kalender akademik",
            "5. Contoh perencanaan pembelajaran",
            "6. Foto/video lingkungan belajar",
          ].map(text => new Paragraph({
            children: [new TextRun({ text })],
            indent: { left: 1080 },
          })),
          new Paragraph({
            children: [
              new TextRun({ text: "2. Secara individu, asesor menulis hasil telaahnya pada kolom C pada form 3.3 di bawah ini, yaitu rekap data yang sudah teridentifikasi. Lembar ini dapat diunduh oleh asesor di Sispena." }),
            ],
            spacing: { before: 100, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "3. Pada kolom D, asesor mengidentifikasi data apa saja yang perlu dikumpulkan saat visitasi." }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "4. Silakan berkoordinasi dengan rekan asesor yang juga akan melakukan visitasi. Masing-masing asesor bertanggung jawab terhadap semua isian pada aplikasi Sispena-PDM." }),
            ],
            spacing: { after: 400 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "A. Butir", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], 
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: "E2EFDA" },
                    verticalAlign: VerticalAlign.TOP
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "B. Indikator", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], 
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: "E2EFDA" },
                    verticalAlign: VerticalAlign.TOP
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "C. Rekap Data yang sudah Teridentifikasi", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], 
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: "E2EFDA" },
                    verticalAlign: VerticalAlign.TOP
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "D. Data yang perlu dikumpulkan saat visitasi", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], 
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: "E2EFDA" },
                    verticalAlign: VerticalAlign.TOP
                  }),
                ],
              }),
              ...tableData.map(
                (row, index) => {
                  const showButir = index === 0 || tableData[index - 1].butir !== row.butir;
                  
                  // Helper to split text into paragraphs for list formatting
                  const formatCellContent = (text: string) => {
                    if (!text || text.trim() === "") return [new Paragraph({ 
                      children: [new TextRun({ text: "-", size: 20 })], 
                      alignment: AlignmentType.LEFT 
                    })];

                    const lines = text.split('\n').filter(line => line.trim() !== "");
                    
                    // If only one line, don't treat as list unless it's already a bullet
                    if (lines.length === 1) {
                      return [new Paragraph({ 
                        children: [new TextRun({ text: lines[0].trim(), size: 20 })], 
                        alignment: AlignmentType.LEFT,
                        spacing: { line: 240, before: 40, after: 40 }
                      })];
                    }

                    return lines.map(line => {
                      const trimmed = line.trim();
                      // Detect if line starts with a list marker (a., 1., -, *)
                      const isList = /^[a-z0-9][\.\)]\s|^\-\s|^\*\s|^●\s/i.test(trimmed);
                      
                      return new Paragraph({ 
                        children: [new TextRun({ text: trimmed, size: 20 })], 
                        alignment: AlignmentType.LEFT,
                        indent: isList ? { left: 360, hanging: 360 } : undefined,
                        spacing: { line: 240, before: 40, after: 40 }
                      });
                    });
                  };

                  return new TableRow({
                    children: [
                      new TableCell({ 
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: showButir ? row.butir : "", size: 20 })], 
                          alignment: AlignmentType.LEFT 
                        })],
                        verticalAlign: VerticalAlign.TOP
                      }),
                      new TableCell({ 
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: row.indikator, size: 20 })], 
                          alignment: AlignmentType.LEFT 
                        })],
                        verticalAlign: VerticalAlign.TOP
                      }),
                      new TableCell({ 
                        children: formatCellContent(row.rekap),
                        verticalAlign: VerticalAlign.TOP
                      }),
                      new TableCell({ 
                        children: formatCellContent(row.visitasi),
                        verticalAlign: VerticalAlign.TOP
                      }),
                    ],
                  });
                }
              ),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 400 } }),
          new Paragraph({
            text: "@2026 Panggonan Sinau Bareng",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Dibuat oleh ${manualData.namaAsesor}`,
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Format_3.3_${manualData.namaSekolah}.docx`);
}
