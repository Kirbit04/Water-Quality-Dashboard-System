import logo from '../assets/AquAguard.png';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


export default function Navigation({ currentPage, onNavigate, user }) {
  const initials = getInitials(user?.name);
  return (
    <nav className="navbar">
        {/* Left Navigation */}
      <div className="navbar-left">
        <ul className='navbar-links'>
          <li>
            <button
              onClick={() => onNavigate('dashboard')} className={`navbar-link ${currentPage === 'dashboard' ? 'active': ''}`}
            >
            Home
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('about')} className={`navbar-link ${currentPage === 'about' ? 'active': ''}`}
            >
            About Us
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('contact')} className={`navbar-link ${currentPage === 'contact' ? 'active': ''}`}
            >
            Contact Us
        </button>
          </li>
        </ul>
      </div>

          {/*Logo */}
      <div className = "navbar-center">
        <img src={logo} alt="AquaGuard Logo" className='navbar-logo'/>
      </div>

        {/* Right - Profile */}
      <div className='navbar-right'>
        <button
          onClick={() => onNavigate('profile')}
          className="profile-icon"
          title={user?.name || "Profile"}
        >
          <div className='profile-image'>{initials}</div>
        </button>
      </div>
    </nav>
  );
}
