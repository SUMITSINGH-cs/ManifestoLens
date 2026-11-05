
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        <div className="footer-brand">
          <h2>ManifestoLens<span>.</span></h2>

          <p>
            Understand political promises.
            Explore the evidence.
          </p>

          <p className="footer-tagline">
            Making political information easier to explore.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/explore">Manifestos</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/parties">Political Parties</Link>
        </div>

        <div className="footer-links">
          <h3>About</h3>
          <Link to="/about">About Us</Link>
          <Link to="/methodology">Our Methodology</Link>
        </div>

        <div className="footer-links">
          <h3>Official Resources</h3>

          <a
            href="https://www.eci.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Election Commission ↗
          </a>

          <a
            href="https://sansad.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sansad ↗
          </a>
        </div>

        <div className="footer-transparency">
          <h3>Our Commitment</h3>

          <p>
            ManifestoLens is an independent information
            project. We do not endorse or oppose any
            political party.
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} ManifestoLens. All rights reserved.
        </p>

        <p>Built for political transparency.</p>
      </div>
    </footer>
  );
}

export default Footer;
