
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { extractPdfText } from "./pdfExtractor.js";
import { fetchManifestoDocument } from "./documentFetcher.js";
import { topics } from "./topics.js";
import { manifestos } from "../src/Data/manifestos.js";
import path from "node:path";
dotenv.config();

const app = express();
const PORT = 5001;

// Allow requests only from the local ManifestoLens frontend
app.use(cors({
  origin: /^http:\/\/localhost:\d+$/
}));

// Limit incoming JSON request size
app.use(express.json({ limit: "100kb" }));
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Backend status
app.get("/", (req, res) => {
  res.json({
    message: "ManifestoLens AI Backend is running!",
  });
});

// Test Gemini connection
app.get("/api/test-gemini", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is missing.",
      });
    }

    console.log("Gemini request started...");

    const response = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: [
    ...safeHistory,
    {
      role: "user",
      parts: [{ text: message.trim() }],
    },
  ],
  config: {
    systemInstruction,
    tools: [
      {
        googleSearch: {},
      },
    ],
  },
});
  } catch (error) {
    console.error("FULL GEMINI ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message,
      status: error.status || error.statusCode || 500,
    });
  }
});

// Test automatic manifesto PDF fetching
app.get("/api/test-pdf", async (req, res) => {
  try {
    const pdfUrl =
      "https://www.bjp.org/files/2024-04/Modi-Ki-Guarantee-Sankalp-Patra-English.pdf";

    console.log("Fetching BJP 2024 manifesto...");

    const response = await fetch(pdfUrl, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`PDF download failed: HTTP ${response.status}`);
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    if (pdfBuffer.subarray(0, 5).toString() !== "%PDF-") {
      throw new Error("The URL did not return a valid PDF file.");
    }

    console.log("PDF downloaded. Extracting text...");

    const extracted = await extractPdfText(pdfBuffer);
   
    res.json({
  success: true,
  manifesto: "BJP Lok Sabha 2024",
  totalPages: extracted.totalPages,
  preview: extracted.pages
    .filter((page) => page.text.length > 100)
    .slice(0, 3),
});

    console.log("PDF extraction completed!");
  } catch (error) {
    console.error("PDF extraction error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test AI-powered Education promise extraction
app.get("/api/test-education", async (req, res) => {
  try {
    const pdfUrl =
      "https://www.bjp.org/files/2024-04/Modi-Ki-Guarantee-Sankalp-Patra-English.pdf";

    console.log("Fetching manifesto for Education analysis...");

    const response = await fetch(pdfUrl, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`PDF download failed: HTTP ${response.status}`);
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    if (pdfBuffer.subarray(0, 5).toString() !== "%PDF-") {
      throw new Error("The URL did not return a valid PDF.");
    }

    const extracted = await extractPdfText(pdfBuffer);

    // Find pages containing Education-related content
    const educationKeywords =
      /\beducation\b|\bschool\b|\buniversit(y|ies)\b|\bcollege\b|\bstudent(s)?\b|\bteacher(s)?\b|\bscholarship(s)?\b|\blearning\b|\bclassroom(s)?\b|\bNEP\b|\bskill development\b|\bIIT(s)?\b|\bmedical college(s)?\b/i;

    const relevantPages = extracted.pages
      .filter((page) => educationKeywords.test(page.text))
      .map((page) => ({
        pageNumber: page.pageNumber,
        text: page.text,
      }));

    if (relevantPages.length === 0) {
      return res.json({
        success: true,
        message: "No Education-related pages were found.",
      });
    }

    console.log(
      `Found ${relevantPages.length} potentially relevant pages.`
    );

    const prompt = `
You are an evidence-based Indian political manifesto analyst.

Analyze the following pages from the BJP Lok Sabha 2024 manifesto.

TASK:
Extract every clearly identifiable promise or commitment related to EDUCATION.

RULES:
1. Use only the supplied manifesto text.
2. Do not invent or assume any promises.
3. Distinguish future promises from achievements or existing schemes.
4. Include the exact PDF page number supplied with each page.
5. Include a short exact supporting quotation from the supplied text.
6. If a statement is not a clear promise, label it accordingly.
7. If no clear education promise is found, say so.

Return valid JSON in this structure:

{
  "topic": "Education",
  "party": "BJP",
  "election": "Lok Sabha 2024",
  "promises": [
    {
      "commitment": "Description of the commitment",
      "sourceQuote": "Exact quotation from the manifesto",
      "pdfPage": 59,
      "type": "Promise or Existing Achievement"
    }
  ]
}

MANIFESTO PAGES:

${relevantPages
  .map(
    (page) =>
      `PDF PAGE ${page.pageNumber}:\n${page.text}`
  )
  .join("\n\n")}
`;

    console.log("Sending Education content to Gemini...");

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
    const rawText = aiResponse.text;

const cleanedText = rawText
  .replace(/```json\s*/i, "")
  .replace(/```\s*$/, "")
  .trim();

const analysis = JSON.parse(cleanedText);
// Verify AI quotations against the original extracted manifesto text
const normalizeText = (text) =>
  (text || "").replace(/\s+/g, " ").trim().toLowerCase();

const verifyPromises = (promises, document, evidenceType) => {
  if (evidenceType === "illustrative" || !document) {
    return (promises || []).map((promise) => ({
      ...promise,
      sourceQuote: null,
      pageNumber: null,
    }));
  }

  return (promises || []).map((promise) => {
    const quote = normalizeText(promise.sourceQuote);

    if (!quote) {
      return {
        ...promise,
        sourceQuote: null,
        pageNumber: null,
      };
    }

    const matchingPage = document.pages.find((page) =>
      normalizeText(page.text).includes(quote)
    );

    if (!matchingPage) {
      return {
        ...promise,
        sourceQuote: null,
        pageNumber: null,
      };
    }

    return {
      ...promise,
      pageNumber: matchingPage.pageNumber ?? null,
    };
  });
};

// Apply verification to both parties
analysis.manifestoA.promises = verifyPromises(
  analysis.manifestoA.promises,
  documentA,
  evidenceTypeA
);

analysis.manifestoB.promises = verifyPromises(
  analysis.manifestoB.promises,
  documentB,
  evidenceTypeB
);
    res.json({
      success: true,
      manifesto: "BJP Lok Sabha 2024",
      topic: "Education",
      relevantPagesFound: relevantPages.length,
      analysis: analysis,
    });

    console.log("Education analysis completed!");
  } catch (error) {
    console.error("Education analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/analyze-manifesto", async (req, res) => {
  try {
    const { party, election, manifestoUrl, topic } = req.body;

    // Validate request
    if (!party || !election || !manifestoUrl || !topic) {
      return res.status(400).json({
        success: false,
        error: "Party, election, manifestoUrl and topic are required.",
      });
    }

    if (!topics[topic]) {
      return res.status(400).json({
        success: false,
        error: "Invalid topic. Choose one of the five supported topics.",
      });
    }

    // Validate URL
    let parsedUrl;

    try {
      parsedUrl = new URL(manifestoUrl);
    } catch {
      return res.status(400).json({
        success: false,
        error: "Invalid manifesto URL.",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        error: "Only HTTP and HTTPS URLs are supported.",
      });
    }

    console.log(`Analyzing ${party} manifesto for ${topic}...`);

    // Download manifesto PDF
    const response = await fetch(manifestoUrl, {
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(`Manifesto download failed: HTTP ${response.status}`);
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    if (pdfBuffer.subarray(0, 5).toString() !== "%PDF-") {
      throw new Error("The supplied URL did not return a valid PDF.");
    }

    // Extract text from PDF
    const extracted = await extractPdfText(pdfBuffer);

    // Find pages related to the selected topic
    const keywords = topics[topic];

    const keywordPattern = new RegExp(
      keywords.map((word) =>
        word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      ).join("|"),
      "i"
    );

    const relevantPages = extracted.pages
      .filter((page) => keywordPattern.test(page.text))
      .map((page) => ({
        pageNumber: page.pageNumber,
        text: page.text,
      }));

    if (relevantPages.length === 0) {
      return res.json({
        success: true,
        party,
        election,
        topic,
        totalPages: extracted.totalPages,
        relevantPagesFound: 0,
        promises: [],
        message: "No pages matching the selected topic were found.",
      });
    }

    console.log(`Found ${relevantPages.length} relevant pages.`);

    // Prepare AI instructions
    const prompt = `
You are an evidence-based political manifesto analyst.

PARTY: ${party}
ELECTION: ${election}
SELECTED TOPIC: ${topic}

TASK:
Identify commitments and promises related specifically to ${topic}.
EVIDENCE STATUS:

Manifesto A:
- Selected election: ${manifestoA.electionType}, ${manifestoA.electionYear}
- Evidence type: ${evidenceTypeA}
- Actual evidence source election: ${
  resultA.usedManifesto
    ? `${resultA.usedManifesto.electionType}, ${resultA.usedManifesto.electionYear}`
    : "No verified manifesto source; use illustrative proposals only"
}

Manifesto B:
- Selected election: ${manifestoB.electionType}, ${manifestoB.electionYear}
- Evidence type: ${evidenceTypeB}
- Actual evidence source election: ${
  resultB.usedManifesto
    ? `${resultB.usedManifesto.electionType}, ${resultB.usedManifesto.electionYear}`
    : "No verified manifesto source; use illustrative proposals only"
}
STRICT RULES:
1. Use only the supplied manifesto text.
2. Never invent or assume a promise.
3. Distinguish future promises from existing achievements.
4. Preserve the exact PDF page number supplied below.
5. Include a short exact supporting quotation.
6. Do not describe an existing achievement as a future promise.
7. Exclude unrelated commitments.
8. If no clear promise exists, return an empty promises array.
9. Do not invent page numbers or quotations.

Return ONLY valid JSON in this format:

{
  "topic": "${topic}",
  "party": "${party}",
  "election": "${election}",
  "promises": [
    {
      "commitment": "Description of commitment",
      "sourceQuote": "Exact quotation",
      "pdfPage": 10,
      "type": "Promise"
    }
  ]
}

MANIFESTO CONTENT:

${relevantPages.map((page) =>
  `PDF PAGE ${page.pageNumber}:\n${page.text}`
).join("\n\n")}
`;

    // Send relevant content to Gemini
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    // Convert Gemini response into JSON
    const cleanedText = aiResponse.text
      .replace(/```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    res.json({
      success: true,
      party,
      election,
      topic,
      totalPages: extracted.totalPages,
      relevantPagesFound: relevantPages.length,
      promises: analysis.promises || [],
    });

    console.log(`${party} ${topic} analysis completed!`);

  } catch (error) {
    console.error("Manifesto analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
function findHistoricalManifesto(selectedManifesto) {
  return manifestos
    .filter(
      (item) =>
        item.partyId === selectedManifesto.partyId &&
        item.id !== selectedManifesto.id &&
item.documentUrl &&
item.electionYear <= selectedManifesto.electionYear &&
item.verificationStatus === "verified"
    )
    .sort(
      (a, b) => b.electionYear - a.electionYear
    )[0] || null;
}
app.post("/api/compare-manifestos", async (req, res) => {
  try {
    const { manifestoA, manifestoB, topic } = req.body;

    // Validate the request
    if (!manifestoA || !manifestoB || !topic) {
      return res.status(400).json({
        success: false,
        error: "Both manifestos and a topic are required.",
      });
    }

    if (
      !manifestoA.partyName ||
      !manifestoA.documentUrl ||
      !manifestoB.partyName ||
      !manifestoB.documentUrl
    ) {
      return res.status(400).json({
        success: false,
        error: "Each manifesto must have a party name and document URL.",
      });
    }

    const validTopics = ["All", ...Object.keys(topics)];

    if (!validTopics.includes(topic)) {
      return res.status(400).json({
        success: false,
        error: "Invalid comparison topic.",
      });
    }

    // Validate both URLs
   // Validate both manifesto URLs
for (const manifesto of [manifestoA, manifestoB]) {
  const documentUrl = manifesto.documentUrl;

  // Allow local manifesto PDFs from the approved folder
  if (documentUrl?.startsWith("/manifestos/")) {
    const filename = documentUrl.slice("/manifestos/".length);

    if (
      !filename ||
      filename !== path.basename(filename) ||
      !filename.toLowerCase().endsWith(".pdf")
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid local manifesto file path.",
      });
    }

    continue;
  }

  // External manifesto URLs must use HTTPS
  try {
    const url = new URL(documentUrl);

    if (url.protocol !== "https:") {
      return res.status(400).json({
        success: false,
        error: "Only HTTPS manifesto URLs are supported.",
      });
    }
  } catch {
    return res.status(400).json({
      success: false,
      error: "Invalid manifesto URL.",
    });
  }
}

    console.log(
      `Comparing ${manifestoA.partyName} and ${manifestoB.partyName} for ${topic}...`
    );
// Find historical manifestos if needed
const historicalA = findHistoricalManifesto(manifestoA);
const historicalB = findHistoricalManifesto(manifestoB);
    // Fetch both manifesto documents
    const fetchWithFallback = async (selectedManifesto, historicalManifesto) => {
      console.log("COMPARISON SOURCE:", {
  party: selectedManifesto.partyName,
  manifestoId: selectedManifesto.id,
  language: selectedManifesto.language,
  url: selectedManifesto.documentUrl,
});
  try {
   const document = await fetchManifestoDocument(
  selectedManifesto.documentUrl,
  selectedManifesto.language || []
);
console.log("DOCUMENT FETCH RESULT:", {
  party: selectedManifesto.partyName,
  id: selectedManifesto.id,
  language: selectedManifesto.language,
  sourceType: document.sourceType,
  extractionMethod: document.extractionMethod || "Not applicable",
  finalUrl: document.finalUrl,
  totalPages: document.totalPages,
});
    return {
      document,
      evidenceType: "original",
      usedManifesto: selectedManifesto,
    };
  } catch (error) {
    console.log(
      `Original source failed for ${selectedManifesto.partyName}:`,
      error.message
    );
  }

  if (historicalManifesto) {
    try {
     const document = await fetchManifestoDocument(
  historicalManifesto.documentUrl,
  historicalManifesto.language || []
);
      return {
        document,
        evidenceType: "historical",
        usedManifesto: historicalManifesto,
      };
    } catch (error) {
      console.log(
        `Historical source failed for ${selectedManifesto.partyName}:`,
        error.message
      );
    }
  }

  return {
    document: null,
    evidenceType: "illustrative",
    usedManifesto: null,
  };
};
const resultA = await fetchWithFallback(manifestoA, historicalA);
const resultB = await fetchWithFallback(manifestoB, historicalB);
let documentA = resultA.document;
let documentB = resultB.document;
    // Get keywords for the selected topic
    const keywords =
      topic === "All"
        ? [...new Set(Object.values(topics).flat())]
        : topics[topic];

    const escapedKeywords = keywords.map((word) =>
      word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );

    const keywordPattern = new RegExp(
      escapedKeywords.join("|"),
      "i"
    );

    // Find relevant pages or webpage content
    const getRelevantContent = (document) => {
      const relevantPages = document.pages.filter((page) =>
        keywordPattern.test(page.text)
      );

      return relevantPages
        .map((page) => {
          const pageLabel =
            page.pageNumber === null
              ? "WEBPAGE CONTENT (no PDF page number)"
              : `PDF PAGE ${page.pageNumber}`;

          return `${pageLabel}:\n${page.text}`;
        })
        .join("\n\n")
        .slice(0, 35000);
    };

   let contentA = documentA
  ? getRelevantContent(documentA)
  : "";

let contentB = documentB
  ? getRelevantContent(documentB)
  : "";
// Try historical manifestos if the selected topic has no relevant content
if (!contentA && resultA.evidenceType === "original" && historicalA) {
  try {
    console.log(`Trying historical manifesto for ${manifestoA.partyName}...`);

   const historicalDocument = await fetchManifestoDocument(
  historicalA.documentUrl,
  historicalA.language || []
);

    const historicalContent = getRelevantContent(historicalDocument);

    if (historicalContent) {
      documentA = historicalDocument;
      contentA = historicalContent;
      resultA.evidenceType = "historical";
      resultA.usedManifesto = historicalA;
    }
  } catch (error) {
    console.log("Historical A fallback failed:", error.message);
  }
}

if (!contentB && resultB.evidenceType === "original" && historicalB) {
  try {
    console.log(`Trying historical manifesto for ${manifestoB.partyName}...`);

    const historicalDocument = await fetchManifestoDocument(
      historicalB.documentUrl,
       historicalB.language || []
    );

    const historicalContent = getRelevantContent(historicalDocument);

    if (historicalContent) {
      documentB = historicalDocument;
      contentB = historicalContent;
      resultB.evidenceType = "historical";
      resultB.usedManifesto = historicalB;
    }
  } catch (error) {
    console.log("Historical B fallback failed:", error.message);
  }
}
// Use illustrative mode if neither source provides relevant content
if (!contentA) {
  resultA.evidenceType = "illustrative";
  resultA.usedManifesto = null;
  documentA = null;
}

if (!contentB) {
  resultB.evidenceType = "illustrative";
  resultB.usedManifesto = null;
  documentB = null;
}
   // Prepare clearly labelled illustrative fallback content
const evidenceTypeA = resultA.evidenceType;
const evidenceTypeB = resultB.evidenceType;

const fallbackInstructionsA =
  evidenceTypeA === "illustrative"
    ? `No usable manifesto evidence is available for ${manifestoA.partyName}.
       Generate 3-5 plausible illustrative policy proposals about ${topic}.
       These are NOT verified party promises. Do not attribute them as actual commitments.`
    : "";

const fallbackInstructionsB =
  evidenceTypeB === "illustrative"
    ? `No usable manifesto evidence is available for ${manifestoB.partyName}.
       Generate 3-5 plausible illustrative policy proposals about ${topic}.
       These are NOT verified party promises. Do not attribute them as actual commitments.`
    : "";

const safeContentA = contentA || fallbackInstructionsA;
const safeContentB = contentB || fallbackInstructionsB;

    // Prepare comparison instructions for Gemini
    const prompt = `
You are an evidence-based Indian political manifesto comparison analyst.

Compare these two manifestos.

MANIFESTO A:
Party: ${manifestoA.partyName}
Election: ${manifestoA.electionType || ""} ${manifestoA.electionYear || ""}
Source type: ${documentA?.sourceType ?? "AI-generated illustration"}

MANIFESTO B:
Party: ${manifestoB.partyName}
Election: ${manifestoB.electionType || ""} ${manifestoB.electionYear || ""}
Source type: ${documentB?.sourceType ?? "AI-generated illustration"}

SELECTED TOPIC: ${topic}

STRICT RULES:
1. For source-backed content, use only the supplied manifesto text.
2. Never invent or assume actual party promises.
3. Historical manifesto commitments must be labelled as historical and include their election year.
4. Illustrative proposals must NEVER be presented as actual party commitments.
5. For illustrative proposals, use sourceQuote: null and pageNumber: null.
6. Never invent quotations or page numbers.
7. Distinguish future promises from existing achievements.
8. Identify similarities and differences only when supported by actual evidence.
9. If no reliable source exists, generate 3-5 neutral illustrative policy proposals.
10. Clearly identify the evidence type for each party.
11. Never imply that illustrative proposals were published, announced or endorsed by the party.
12. Keep the comparison politically neutral.

Return ONLY valid JSON in this structure:

{
  "topic": "${topic}",
  "manifestoA": {
  "party": "${manifestoA.partyName}",
  "evidenceType": "${evidenceTypeA}",
  "evidenceElectionYear": ${resultA.usedManifesto?.electionYear ?? "null"},
  "promises": [
      {
        "commitment": "Description",
        "sourceQuote": "Exact quotation",
        "pageNumber": 10,
        "type": "Promise"
      }
    ]
  },
  "manifestoB": {
    "party": "${manifestoB.partyName}",
    "evidenceType": "${evidenceTypeB}",
    "evidenceElectionYear": ${resultB.usedManifesto?.electionYear ?? "null"},
    "promises": [
      {
        "commitment": "Description",
        "sourceQuote": "Exact quotation",
        "pageNumber": 12,
        "type": "Promise"
      }
    ]
  },
  "similarities": [
    "Evidence-based similarity"
  ],
  "differences": [
    "Evidence-based difference"
  ],
  "comparisonSummary": "A neutral summary based only on the supplied content."
}

MANIFESTO A CONTENT:
${safeContentA}

MANIFESTO B CONTENT:
${safeContentB}
`;

    console.log("Sending both manifestos to Gemini...");

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const cleanedText = aiResponse.text
      .replace(/```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    res.json({
      success: true,
      topic,
      sourceA: {
  party: manifestoA.partyName,
  evidenceType: evidenceTypeA,
  evidenceElectionYear: resultA.usedManifesto?.electionYear ?? null,
  sourceType: documentA?.sourceType ?? "AI-generated illustration",
  totalPages: documentA?.totalPages ?? null,
  relevantPagesFound: documentA
    ? documentA.pages.filter((page) =>
        keywordPattern.test(page.text)
      ).length
    : 0,
},
     sourceB: {
  party: manifestoB.partyName,
  evidenceType: evidenceTypeB,
  evidenceElectionYear: resultB.usedManifesto?.electionYear ?? null,
  sourceType: documentB?.sourceType ?? "AI-generated illustration",
  totalPages: documentB?.totalPages ?? null,
  relevantPagesFound: documentB
    ? documentB.pages.filter((page) =>
        keywordPattern.test(page.text)
      ).length
    : 0,
},
      analysis,
    });

    console.log("Manifesto comparison completed!");
  } catch (error) {
    console.error("Manifesto comparison error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// ECI Assistant - Gemini chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Validate user message
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: "Message is too long. Please keep it under 2000 characters.",
      });
    }

    // Prepare ManifestoLens data for ECI
    const manifestoContext = manifestos.map((item) => ({
      party: item.partyName,
      election: item.electionType,
      year: item.electionYear,
      state: item.state,
      verificationStatus: item.verificationStatus,
      sourceName: item.sourceName,
      sourceType: item.sourceType,
      topics: item.topics,
      sourceUrl: item.sourceUrl,
    }));

  
const systemInstruction = `
You are ECI (Election Companion Intelligence), the AI assistant
for ManifestoLens, an Indian political manifesto exploration website.

YOUR THREE MAIN RESPONSIBILITIES:

1. MANIFESTOLENS SUPPORT
Explain the website, its features, manifesto records, available
political parties, sources, verification statuses and how to use it.

2. INDIAN POLITICS
Answer questions about Indian political parties, elections,
government, policies, democracy and political history.

3. WEBSITE SUPPORT
Help users understand navigation, filters, comparisons and
troubleshoot common website issues.

MANIFESTOLENS WEBSITE STRUCTURE:

- Home: Introduction to ManifestoLens.
- Explore: Browse available manifesto records and their details.
- Compare: Compare two manifestos using supported topics.
- Parties: Explore political party information.
- About: Learn about the project.
- Methodology: Understand the project's research and verification approach.

Supported comparison topics:
Education, Healthcare, Employment, Agriculture and Women Empowerment.

SOURCE RELIABILITY AND VERIFICATION:

- Prefer primary and official sources whenever available.
- For election-related information, prioritize the Election Commission
  of India and official election documents.
- For government policies, prioritize government ministries,
  Parliament and official government publications.
- For manifesto promises, prioritize the original party manifesto.
- Use reputable news organizations for independent reporting
  and additional context.
- Clearly distinguish official announcements, media reports,
  political statements, allegations and independent analysis.
- Mention publication dates when available.
- Never invent source titles, URLs, publication dates or citations.
- Never claim that a source supports information it does not contain.
- If sources disagree, explain the disagreement objectively.
- Do not treat a political party's statement as independently verified fact.

MANIFESTOLENS DATA INTEGRITY:

- Use the supplied ManifestoLens data when answering questions
  about records available on this website.
- Never invent manifesto promises, statistics, parties or elections.
- Treat verificationStatus as the project's recorded status,
  not independent proof that a political claim is true.
- Clearly distinguish verified records from needs-review records.
- Never present needs-review information as independently verified.
- Do not describe an unavailable manifesto as available.
- If information is missing, clearly state that it is not present
  in the supplied project data.
- Distinguish direct manifesto commitments from your own
  interpretation or summary.
- Never attribute a promise to a party without supporting evidence.
- Do not assume that a party fulfilled a promise simply because
  it appeared in its manifesto.

POLITICAL NEUTRALITY:

- Be neutral, factual and non-partisan.
- Never promote or campaign for a political party.
- Apply the same standards of evidence to every political party.
- Do not use emotionally loaded or partisan language.
- Present relevant arguments and evidence fairly.
- Distinguish facts from opinions and political interpretations.
- Do not assume that an election result proves a policy was successful.

CURRENT INFORMATION:

- For current political developments, use Google Search grounding
  whenever it is available.
- Prefer recent and reliable sources.
- Mention dates to establish when information was published.
- Do not present outdated information as current.
- If reliable current information cannot be established,
  clearly acknowledge the limitation.
- Never pretend to have performed a live search when one
  was not available.

ANSWER QUALITY:

- Use simple, clear and professional language.
- Structure longer answers with headings and bullet points.
- Use tables when comparing political parties, policies or manifestos.
- Explain technical political and electoral terms when necessary.
- Answer the user's actual question without unnecessary repetition.
- Do not make up website features that are not listed above.
- If a question is ambiguous, ask for clarification when necessary.

MANIFESTOLENS MANIFESTO DATA:

${JSON.stringify(manifestoContext)}

IMPORTANT IDENTITY RULE:

You are an unofficial AI assistant for ManifestoLens.
You are not the Election Commission of India.
Never imply that your answers are official government statements.
`;

    // Keep only recent, valid conversation messages
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              ["user", "model"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            parts: [{ text: item.content.slice(0, 3000) }],
          }))
      : [];

   console.log("ECI chatbot request received...");

let response;

// First, try Gemini with Google Search grounding
try {
  response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: [
      ...safeHistory,
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ],
    config: {
      systemInstruction,
      tools: [
        {
          googleSearch: {},
        },
      ],
    },
  });

 
  console.log("ECI: Google Search grounding successful.");

} catch (searchError) {
  console.error(
    "ECI Google Search failed. Trying normal Gemini response:",
    searchError.message
  );

  // Retry without Google Search grounding
  response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: [
      ...safeHistory,
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ],
    config: {
      systemInstruction,
    },
  });

  console.log("ECI: Normal Gemini fallback successful.");
}

const reply = response.text;

// Extract Google Search grounding sources
const groundingChunks =
  response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

const sources = groundingChunks
  .filter((chunk) => chunk.web?.uri)
  .map((chunk) => ({
    title: chunk.web.title || "Web source",
    url: chunk.web.uri,
  }))
  .filter(
    (source, index, array) =>
      array.findIndex((item) => item.url === source.url) === index
  );

 res.json({
  success: true,
  reply,
  sources,
  searchUsed: sources.length > 0,
});
  } catch (error) {
    console.error("ECI chatbot error:", error);
    res.status(500).json({
      success: false,
      error: "The assistant could not process your request.",
    });
  }
});
// Start ManifestoLens backend server
const server = app.listen(PORT, () => {
  console.log(`ManifestoLens server running on http://localhost:${PORT}`);
  console.log("Server listening:", server.listening);
});