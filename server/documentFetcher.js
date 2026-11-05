import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractPdfText } from "./pdfExtractor.js";
import { extractScannedPdfText } from "./ocrExtractor.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_MANIFESTO_DIR = path.resolve(
  __dirname,
  "../public/manifestos"
);
const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40 MB

// Convert common Google Drive sharing links into download links
function normalizeDocumentUrl(documentUrl) {
  const url = new URL(documentUrl);

  if (url.protocol !== "https:") {
    throw new Error("Only HTTPS manifesto URLs are supported.");
  }

  if (
    url.hostname === "drive.google.com" ||
    url.hostname === "www.drive.google.com"
  ) {
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    const fileId = fileMatch?.[1] || url.searchParams.get("id");

    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
    }
  }

  return url.toString();
}

// Extract readable text from basic HTML pages
function extractWebpageText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}
export async function fetchManifestoDocument(
  documentUrl,
  expectedLanguages = []
) {
  if (!documentUrl) {
    throw new Error("Manifesto document URL is missing.");
  }
let buffer;
let contentType = "application/pdf";
let finalUrl;

console.log("Manifesto languages:", expectedLanguages);
console.log("Received document URL:", documentUrl);
if (documentUrl.startsWith("/manifestos/")) {
  const filename = documentUrl.slice("/manifestos/".length);

  if (
    !filename ||
    filename !== path.basename(filename) ||
    !filename.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error("Invalid local manifesto file path.");
  }

  const localFilePath = path.resolve(LOCAL_MANIFESTO_DIR, filename);

  const fileInfo = await stat(localFilePath).catch(() => null);

  if (!fileInfo || !fileInfo.isFile()) {
    throw new Error("Local manifesto PDF was not found.");
  }

  if (fileInfo.size > MAX_FILE_SIZE) {
    throw new Error("Manifesto file is larger than the 40 MB limit.");
  }

  buffer = await readFile(localFilePath);
  finalUrl = documentUrl;

  console.log("Reading local manifesto:", filename);
} else {
  let normalizedUrl;

  try {
    normalizedUrl = normalizeDocumentUrl(documentUrl);
  } catch (error) {
    throw new Error(`Invalid manifesto URL: ${error.message}`);
  }

  console.log("Fetching manifesto:", normalizedUrl);

  let response;

  try {
    response = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(45000),
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 ManifestoLens/1.0",
        Accept: "application/pdf,text/html,*/*",
      },
    });
  } catch (error) {
    throw new Error(
      `Could not download manifesto. Network error: ${error.message}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Unable to access manifesto: HTTP ${response.status} ${response.statusText}`
    );
  }

  if (new URL(response.url).protocol !== "https:") {
    throw new Error("The manifesto redirected to an unsupported URL.");
  }

  const contentLength = Number(
    response.headers.get("content-length") || 0
  );

  if (contentLength > MAX_FILE_SIZE) {
    throw new Error("Manifesto file is larger than the 40 MB limit.");
  }

  buffer = Buffer.from(await response.arrayBuffer());
  contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

  finalUrl = response.url;
}

  if (buffer.length > MAX_FILE_SIZE) {
  throw new Error("Manifesto file exceeds the 40 MB limit.");
}

if (buffer.length === 0) {
  throw new Error("The manifesto source returned an empty file.");
}
  // Detect actual PDF content
  const isPdf =
    buffer.subarray(0, 5).toString() === "%PDF-";

  if (isPdf) {
    console.log("PDF detected. Extracting text...");

    let extracted = await extractPdfText(buffer);

    let readablePages = extracted.pages.filter(
      (page) => page.text.trim().length > 30
    );

   let extractionMethod = "PDF Text Extraction";

const expectsHindi = expectedLanguages.some(
  (language) => language.toLowerCase() === "hindi"
);

const hindiCharacterCount = extracted.pages.reduce(
  (count, page) =>
    count + (page.text.match(/[\u0900-\u097F]/g) || []).length,
  0
);

const hasHindiText = hindiCharacterCount >= 100;
console.log("Hindi characters extracted:", hindiCharacterCount);
// If normal extraction finds no readable text, use OCR
console.log("Document URL:", finalUrl);
console.log("Expected languages:", expectedLanguages);
console.log("Hindi characters extracted:", hindiCharacterCount);
if (readablePages.length === 0 || (expectsHindi && !hasHindiText)) {
  console.log("No readable text found. Starting OCR...");

  extracted = await extractScannedPdfText(buffer);

  readablePages = extracted.pages.filter(
    (page) => page.text.trim().length > 10
  );

  extractionMethod = "OCR";
}

if (readablePages.length === 0) {
  throw new Error(
    "Neither normal extraction nor OCR could find readable text in this PDF."
  );
}
    console.log(`Extraction completed using: ${extractionMethod}`);

    return {
      sourceType: "PDF",
      extractionMethod,
     finalUrl,
      totalPages: extracted.totalPages,
      pages: readablePages,
    };
  }

  // Detect basic HTML webpages
  const isHtml =
    contentType.includes("text/html") ||
    /<html|<!doctype html/i.test(buffer.toString("utf8", 0, 500));

  if (isHtml) {
    console.log("Manifesto downloaded as HTML:", response.url);
    const html = buffer.toString("utf8");
    const text = extractWebpageText(html);

    if (text.length < 200) {
      throw new Error(
        "The webpage does not contain enough readable manifesto text. It may be an archive page or a JavaScript-rendered page."
      );
    }

    return {
      sourceType: "Webpage",
      finalUrl: response.url,
      totalPages: null,
      pages: [
        {
          pageNumber: null,
          text,
        },
      ],
    };
  }

  throw new Error(
    `Unsupported source format. Received content type: ${contentType || "unknown"}. The source must provide a PDF or readable webpage.`
  );
}
