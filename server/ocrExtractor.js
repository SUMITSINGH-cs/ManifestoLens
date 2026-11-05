

import {
  createCanvas,
  DOMMatrix,
  ImageData,
  Path2D,
} from "@napi-rs/canvas";
import { createWorker } from "tesseract.js";
let ocrInProgress = false;
export async function extractScannedPdfText(pdfBuffer) {
  if (ocrInProgress) {
    throw new Error("Another OCR job is already running. Please try again later.");
  }

  ocrInProgress = true;

  let worker;
  let pdf;

  try {
    console.log("Starting OCR extraction...");
globalThis.DOMMatrix ??= DOMMatrix;
globalThis.ImageData ??= ImageData;
globalThis.Path2D ??= Path2D;
const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
console.log("OCR language configured: eng+hin");
    worker = await createWorker("eng+hin");
    pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
    }).promise;
const MAX_PDF_PAGES = 100;

if (pdf.numPages > MAX_PDF_PAGES) {
  throw new Error(
    `PDF exceeds the maximum allowed limit of ${MAX_PDF_PAGES} pages.`
  );
}
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      console.log(`OCR processing page ${pageNumber}/${pdf.numPages}`);

      const page = await pdf.getPage(pageNumber);
     const MAX_RENDER_DIMENSION = 4000;
const MAX_RENDER_PIXELS = 12_000_000;

let scale = 2;
let viewport = page.getViewport({ scale });

const dimensionScale = Math.min(
  MAX_RENDER_DIMENSION / viewport.width,
  MAX_RENDER_DIMENSION / viewport.height
);

const pixelScale = Math.sqrt(
  MAX_RENDER_PIXELS / (viewport.width * viewport.height)
);

scale = Math.min(scale, dimensionScale, pixelScale);

viewport = page.getViewport({ scale });

      const canvas = createCanvas(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height)
      );

      const context = canvas.getContext("2d");

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const imageBuffer = canvas.toBuffer("image/png");
      const result = await worker.recognize(imageBuffer);

      pages.push({
        pageNumber,
        text: result.data.text.trim(),
      });
    }

    console.log("OCR extraction completed!");

    return {
      totalPages: pages.length,
      pages,
    };
  } finally {
    if (pdf) await pdf.destroy();
    if (worker) await worker.terminate();
    ocrInProgress = false;
  }
}
