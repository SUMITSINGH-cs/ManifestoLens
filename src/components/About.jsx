
function About() {
  return (
    <section className="about-section" id="about">

      <p className="about-label">ABOUT MANIFESTOLENS</p>

      <h2>Making Political Promises Easier to Understand</h2>

      <p className="about-intro">
        ManifestoLens is an information platform designed to help
        citizens explore political manifestos, understand party
        proposals and compare commitments across elections.
      </p>

      <div className="about-content">

        <div className="about-card">
          <h3>Our Purpose</h3>
          <p>
            We aim to make political manifesto information easier
            to access, explore and understand through a structured
            and user-friendly platform.
          </p>
        </div>

        <div className="about-card">
          <h3>Explore Political Parties</h3>
          <p>
            Discover political parties, their recognition categories,
            official information and available manifesto records.
          </p>
        </div>

        <div className="about-card">
          <h3>Compare Manifestos</h3>
          <p>
            Explore similarities and differences between available
            manifesto topics across parties and elections.
          </p>
        </div>

        <div className="about-card">
          <h3>Source Transparency</h3>
          <p>
            Manifesto records include source classifications and
            document links wherever available. Users can refer
            to the original documents for further verification.
          </p>
        </div>

      </div>

      <div className="about-note">
        <h3>Our Commitment to Transparency</h3>
        <p>
          ManifestoLens is an independent information project.
          It does not endorse or oppose any political party.
          Information availability depends on the sources and
          records included in the platform. A missing document
          or incomplete record should not be interpreted as
          evidence that a political party has made no commitment.
        </p>
      </div>

    </section>
  )
}

export default About
