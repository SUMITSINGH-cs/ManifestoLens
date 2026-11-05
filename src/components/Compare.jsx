import { useState } from "react";
import { manifestos } from "../Data/manifestos";



function Compare() {
  

  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [aiResults, setAiResults] = useState({
  partyA: null,
  partyB: null,
});

const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All");
const categories = [
  "All",
  "Education",
  "Healthcare",
  "Employment",
  "Agriculture",
  "Women Empowerment"
];

const availableManifestos = manifestos;

  const selectedA = availableManifestos.find(
    (item) => item.id === partyA
  );

  const selectedB = availableManifestos.find(
    (item) => item.id === partyB
  );
  

const handleAIComparison = async () => {
  if (!selectedA || !selectedB) {
    setAiError("Please select both manifestos.");
    return;
  }

  if (selectedA.id === selectedB.id) {
    setAiError("Please select two different manifestos.");
    return;
  }

  if (selectedCategory === "All") {
    setAiError("Please select one specific topic for AI comparison.");
    return;
  }

  if (!selectedA.documentUrl || !selectedB.documentUrl) {
    setAiError("A manifesto source URL is missing.");
    return;
  }

  setAiLoading(true);
  setAiError("");
  setAiResults({
    partyA: null,
    partyB: null,
  });

  try {
    const response = await fetch(
      "http://localhost:5001/api/compare-manifestos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manifestoA: {
            id: selectedA.id,
            partyName: selectedA.partyName,
            electionType: selectedA.electionType,
            electionYear: selectedA.electionYear,
            documentUrl: selectedA.documentUrl,
            language: selectedA.language || [],
          },
          manifestoB: {
            id: selectedB.id,
            partyName: selectedB.partyName,
            electionType: selectedB.electionType,
            electionYear: selectedB.electionYear,
            documentUrl: selectedB.documentUrl,
            language: selectedB.language || [],
          },
          topic: selectedCategory,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Manifesto comparison failed.");
    }

    setAiResults({
      partyA: {
        party: data.analysis.manifestoA.party,
        promises: data.analysis.manifestoA.promises || [],
      },
      partyB: {
        party: data.analysis.manifestoB.party,
        promises: data.analysis.manifestoB.promises || [],
      },
      similarities: data.analysis.similarities || [],
      differences: data.analysis.differences || [],
      summary: data.analysis.comparisonSummary || "",
    });
  } catch (error) {
    setAiError(error.message);
  } finally {
    setAiLoading(false);
  }
};

 



  

  return (
    <section className="compare-section" id="compare">
     <div className="promise-comparison-heading">
  <p className="section-label">EXPLORE POLICY PRIORITIES</p>
  <h2>Compare Manifestos</h2>
  <p>
    Explore and compare policy topics across political party manifestos.
Select any topic to examine both parties' available information and original sources.
  </p>
</div>


<button
  className="reset-compare"
  onClick={() => {
    setPartyA("");
    setPartyB("");
  }}
>
  Reset Comparison
</button>
      <div className="promise-controls">
        <div>
          <label>Manifesto A</label>
          <select
            value={partyA}
            onChange={(e) => setPartyA(e.target.value)}
          >
            <option value="">Select Manifesto A</option>
            {availableManifestos.map((item) => (
              <option key={item.id} value={item.id}>
  {item.partyName} - {item.electionType} - {item.electionYear}
  {item.state ? ` (${item.state})` : ""}
</option>
            ))}
          </select>
        </div>

        <div>
          <label>Manifesto B</label>
          <select
            value={partyB}
            onChange={(e) => setPartyB(e.target.value)}
          >
            <option value="">Select Manifesto B</option>
            {availableManifestos.map((item) => (
             <option key={item.id} value={item.id}>
  {item.partyName} - {item.electionType} - {item.electionYear}
  {item.state ? ` (${item.state})` : ""}
</option>
            ))}
          </select>
        </div>

        <div>
          <label>Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
<div className="ai-comparison-controls">
  <button
    className="ai-compare-button"
    onClick={handleAIComparison}
    disabled={aiLoading || !selectedA || !selectedB}
  >
    {aiLoading ? "Analyzing Manifestos..." : "Compare"}
  </button>

  {aiError && (
    <p className="ai-error">{aiError}</p>
  )}
</div>
{selectedA && selectedB && aiResults.partyA && aiResults.partyB && (
  <div className="ai-comparison-results">
    <h3>AI-Powered Manifesto Comparison</h3>
    <p>Topic: {selectedCategory}</p>

    <div className="promise-comparison-grid">
      {[
        { manifesto: selectedA, result: aiResults.partyA },
        { manifesto: selectedB, result: aiResults.partyB },
      ].map(({ manifesto, result }) => (
        <div className="promise-party-column" key={manifesto.id}>
          <h3>{manifesto.partyName}</h3>

          <p className="promise-result-count">
            {result.promises.length} AI-identified commitments
          </p>

          {result.promises.map((promise, index) => (
            <article
              className="promise-card"
            key={`${promise.pageNumber ?? "web"}-${index}`}
            >
              <span className="promise-category">
                {promise.type}
              </span>

              <h4>{promise.commitment}</h4>

              {promise.sourceQuote ? (
  <blockquote>{promise.sourceQuote}</blockquote>
) : (
  <p className="promise-no-quote">
    {promise.pageNumber
      ? "No exact quotation could be verified."
      : "No exact quotation available from the extracted source."}
  </p>
)}

            <span className="promise-source">
  {promise.pageNumber
    ? `PDF Page ${promise.pageNumber}`
    : /page|webpage/i.test(
        `${manifesto.documentType || ""} ${manifesto.sourceType || ""}`
      )
    ? "Official Manifesto Page"
    : "Source: Webpage"}
</span>

<a
  className="promise-source-link"
  href={
    promise.pageNumber
      ? `${manifesto.documentUrl}#page=${promise.pageNumber}`
      : manifesto.documentUrl
  }
  target="_blank"
  rel="noreferrer"
>
  {promise.pageNumber
    ? "View Original PDF ↗"
    : "View Official Manifesto Page ↗"}
</a>
            </article>
          ))}

          {result.promises.length === 0 && (
            <p>No commitments were identified for this topic.</p>
          )}
        </div>
      ))}
      <div className="ai-insights">
  <h3>Comparison Insights</h3>

  <div>
    <h4>Similarities</h4>
    {aiResults.similarities?.length > 0 ? (
      <ul>
        {aiResults.similarities.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      <p>No supported similarities identified.</p>
    )}
  </div>

  <div>
    <h4>Key Differences</h4>
    {aiResults.differences?.length > 0 ? (
      <ul>
        {aiResults.differences.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      <p>No supported differences identified.</p>
    )}
  </div>

  <div>
    <h4>Neutral Summary</h4>
    <p>{aiResults.summary || "No summary available."}</p>
  </div>
</div>
    </div>
  </div>
)}
    </section>
  );
}

export default Compare;
