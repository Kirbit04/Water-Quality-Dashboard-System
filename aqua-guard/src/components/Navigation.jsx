import logo from '../assets/AquAguard.png';

export default function Navigation({ currentPage, onNavigate }) {
  return (
    <nav className="navbar">
        {/* Left Navigation */}
      <div className="navbar-left">
        <ul className='navbar-links'>
          <li>
            <button
              onClick={() => onNavigate('dashboard')} className="navbar-link"
            >
            Home
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('about')} className="navbar-link"
            >
            About Us
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('contact')} className="navbar-link"
            >
            Contact Us
        </button>
          </li>
        </ul>
      </div>

          {/*Logo */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <img src={logo} alt="AquaGuard Logo" className='navbar-logo'/>
      </div>

        {/* Right - Profile */}
      <div className='navbar-right'>
        <button
          onClick={() => onNavigate('profile')}
          className="profile-icon"
          title="Profile"
        >
        👤
        </button>
      </div>
    </nav>
  );
}
