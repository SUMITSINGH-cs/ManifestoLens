
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        ManifestoLens<span>.</span>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/explore">Explore</NavLink>
        <NavLink to="/compare">Compare</NavLink>
        <NavLink to="/parties">Parties</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/methodology">Methodology</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
