# ManifestoLens 🇮🇳

### Understand political promises. Explore the evidence.

ManifestoLens is an AI-powered political manifesto exploration and comparison platform designed to make election promises easier to understand.

It helps users explore political parties and their manifestos, examine policy commitments, and compare what different parties promise across important public issues.

## ✨ Features

- **Explore Manifestos:** Browse available political manifestos across elections and states.
- **Party Directory:** Discover political parties and explore their information.
- **Manifesto Comparison:** Compare two parties' commitments across common policy topics.
- **AI-Powered Analysis:** Use AI to analyze and compare manifesto content.
- **PDF Processing:** Extract text from manifesto documents, including scanned PDFs using OCR.
- **Topic-Based Comparison:** Examine commitments across areas such as education, healthcare and employment.
- **AI Chatbot:** Interact with the platform through an AI-powered chat interface.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend interface |
| Vite | Frontend development and build |
| JavaScript | Application logic |
| Node.js | Backend runtime |
| Express.js | Backend API |
| Google Gemini API | AI-powered analysis |
| PDF.js | PDF text extraction |
| Tesseract.js | OCR for scanned documents |
| CSS | Styling and responsive layouts |

## 📁 Project Structure

```text
ManifestoLens/
│
├── public/
│   └── manifestos/
│
├── server/
│   ├── server.js
│   ├── documentFetcher.js
│   ├── pdfExtractor.js
│   ├── ocrExtractor.js
│   └── topics.js
│
├── src/
│   ├── Components/
│   ├── Data/
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

*Note: The structure above highlights the main project areas; individual files may vary.*

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SUMITSINGH-cs/ManifestoLens.git
```

### 2. Open the project

```bash
cd ManifestoLens
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root and configure your Google Gemini API key using the environment variable expected by `server/server.js`.

**Important:** Never upload your `.env` file or expose your API key publicly.

### 5. Start the application

Run both the frontend and backend together:

```bash
npm run start:all
```

Open the local URL displayed by Vite in your browser.

## 🎯 Project Objective

Political manifestos contain important promises and policy commitments, but understanding and comparing lengthy documents can be difficult.

ManifestoLens aims to make this information more accessible by bringing manifesto exploration, topic-based comparison and AI-assisted analysis into one platform.

## 🔮 Future Improvements

- Expand manifesto coverage across more elections and political parties.
- Improve evidence-based verification of political promises.
- Add more detailed policy comparison tools.
- Improve source transparency and document references.
- Enhance the user experience and accessibility.

## 👨‍💻 Author

**Sumit Singh**

B.Tech Computer Science Student

[GitHub Profile](https://github.com/SUMITSINGH-cs)

---

*ManifestoLens — Understand political promises. Explore the evidence.*