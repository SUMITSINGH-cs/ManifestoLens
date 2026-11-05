
function MethodologyPage() {
  const steps = [
    {
      number: "01",
      title: "Manifesto Collection",
      description:
        "We collect available political manifesto records from official party websites, public documents and other accessible sources. Each record is associated with a party and election."
    },
    {
      number: "02",
      title: "Source Verification",
      description:
        "We record source details, document links, hosting information and verification status. A third-party copy is not treated as an official publication."
    },
    {
      number: "03",
      title: "Document Processing",
      description:
        "PDF documents are processed to extract their text. For scanned documents, OCR helps recognise text from page images. Accessible webpages may also be processed."
    },
    {
      number: "04",
      title: "Topic Identification",
      description:
        "Extracted content is examined for five topics: Education, Healthcare, Employment, Agriculture and Women Empowerment."
    },
    {
      number: "05",
      title: "AI-Assisted Comparison",
      description:
        "The comparison system examines two selected manifesto records and identifies relevant proposals, similarities and differences for the chosen topic."
    },
    {
      number: "06",
      title: "Evidence and Transparency",
      description:
        "Results distinguish original manifesto evidence, historical manifesto evidence and illustrative AI-generated proposals. Historical and illustrative content must not be mistaken for commitments in the selected election."
    }
  ];

  return (
    <main className="methodology-page">

      <section className="methodology-hero">
        <p className="methodology-label">HOW IT WORKS</p>

        <h1>Our Methodology</h1>

        <p>
          Understand how ManifestoLens collects, processes,
          examines and compares political manifesto information
          through a structured, evidence-focused approach.
        </p>
      </section>

      <section className="methodology-content">

        <div className="methodology-heading">
          <h2>From manifesto to comparison</h2>
          <p>
            Every comparison follows a series of processing
            and evidence-handling steps.
          </p>
        </div>

        <div className="methodology-steps">

          {steps.map((step) => (
            <div className="methodology-card" key={step.number}>

              <span className="methodology-number">
                {step.number}
              </span>

              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>

            </div>
          ))}

        </div>

        <div className="methodology-note">
          <h3>Important Evidence Note</h3>

          <p>
            AI-generated analysis is not a substitute for
            the original manifesto. Where original evidence
            is unavailable, historical or illustrative
            information must be clearly identified. Missing
            information does not mean that a political party
            has made no commitment.
          </p>
        </div>

      </section>

    </main>
  );
}

export default MethodologyPage;
