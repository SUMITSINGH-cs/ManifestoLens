
function Features() {
  return (
    <section className="features">

      <div className="features-heading">
        <p className="features-label">WHAT YOU CAN DO</p>

        <h2>
          Everything you need to understand political promises.
        </h2>

        <p className="features-subtitle">
          Explore public commitments, examine policy proposals,
          and understand what political parties are offering.
        </p>
      </div>

      <div className="features-container">

        <div className="feature-card">
          <div className="feature-icon explore-icon">⌕</div>
          <span className="feature-number">01 / EXPLORE</span>

          <h3>Explore Manifestos</h3>

          <p>
            Browse available political manifestos from different
            parties and elections in one place.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon compare-icon">⇄</div>
          <span className="feature-number">02 / COMPARE</span>

          <h3>Compare Policies</h3>

          <p>
            Examine two parties' proposals on education,
            employment, healthcare and more.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon ai-icon">✳</div>
          <span className="feature-number">03 / UNDERSTAND</span>

          <h3>Ask AI</h3>

          <p>
            Explore AI-assisted answers grounded in available
            manifesto evidence and source references.
          </p>
        </div>

      </div>
    </section>
  )
}

export default Features;
