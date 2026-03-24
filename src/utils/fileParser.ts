import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

// Set worker source for pdfjs using Vite's asset loader
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return extractTextFromPdf(file);
  } else if (extension === 'docx') {
    return extractTextFromDocx(file);
  } else if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
    return `[File Gambar: ${file.name}]`;
  } else if (['mp4', 'gp', 'wmv'].includes(extension || '')) {
    return `[File Video: ${file.name}]`;
  }
  
  return "";
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
