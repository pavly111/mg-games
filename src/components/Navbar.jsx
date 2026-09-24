import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <img src={import.meta.env.BASE_URL + "logo.png"} alt="MG Games" className="logo-img" />
        <span className="logo-text">MG GAMES</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Browse</Link>
        <Link to="/add" className="nav-link add-link">+ Add Game</Link>
      </div>
    </nav>
  )
}

export default Navbar