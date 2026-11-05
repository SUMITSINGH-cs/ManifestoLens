import { PDFParse } from "pdf-parse";

export async function extractPdfText(pdfBuffer) {
  const parser = new PDFParse({
    data: pdfBuffer,
  });
const MAX_PDF_PAGES = 100;
  try {
    
const info = await parser.getInfo();

if (info.total > MAX_PDF_PAGES) {
  throw new Error(
    `PDF exceeds the maximum allowed limit of ${MAX_PDF_PAGES} pages.`
  );
}

const result = await parser.getText();
    const pages = result.pages.map((page) => ({
      pageNumber: page.num,
      text: page.text.trim(),
    }));

    return {
      totalPages: pages.length,
      pages,
    };
  } finally {
    await parser.destroy();
  }
}