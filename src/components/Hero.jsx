import { Link } from "react-router-dom";
function Hero() {
  return (
    <section className="hero" id="home">

      <div className="hero-content">

        <p className="hero-label">
          POLITICAL TRANSPARENCY, MADE SIMPLE
        </p>

        <h1>
          Promises deserve
          <br />
          <span>more than promises.</span>
        </h1>

        <p className="hero-description">
          Explore political manifestos, compare promises, and understand
          what parties are proposing — all in one place.
        </p>

        <div className="hero-buttons">

         <Link to="/explore" className="hero-primary-btn">
  Explore Manifestos ↗
</Link>

<Link to="/compare" className="hero-secondary-btn">
  Compare Manifestos
</Link> 

        </div>

        <div className="hero-trust">
          <span>Explore</span>
          <span>·</span>
          <span>Compare</span>
          <span>·</span>
          <span>Understand</span>
        </div>

      </div>

      <div className="hero-visual">

        <div className="hero-visual-glow"></div>

        <div className="hero-document-card">

          <div className="document-top">
            <span>MANIFESTOLENS</span>
            <span>01 / 03</span>
          </div>

          <div className="document-icon">▤</div>

          <h3>Political Manifestos</h3>

          <p>
            Explore commitments.
            Understand proposals.
            Compare available topics.
          </p>

          <div className="document-line"></div>
          <div className="document-line short"></div>
          <div className="document-line"></div>

          <div className="document-footer">
            <span>INFORMATION</span>
            <span>TRANSPARENCY</span>
          </div>

        </div>

        <div className="hero-floating-tag">
          <span>✓</span> Source-based exploration
        </div>

      </div>

    </section>
  )
}

export default Hero
