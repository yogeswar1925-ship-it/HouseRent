import React from 'react';

export default function Navbar({ currentView, setView, user, logout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-transparent border-bottom border-secondary py-3 px-4">
      <div className="container-fluid">
        <a 
          className="navbar-brand fs-3 fw-bold" 
          href="#" 
          style={{ color: '#818cf8', fontFamily: 'Outfit' }}
          onClick={(e) => { e.preventDefault(); setView('home'); }}
        >
          RentEase
        </a>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-3">
            <li className="nav-item">
              <a 
                className={`nav-link text-white ${currentView === 'home' ? 'fw-bold' : ''}`} 
                href="#"
                onClick={(e) => { e.preventDefault(); setView('home'); }}
              >
                Home
              </a>
            </li>
            
            {!user ? (
              <>
                <li className="nav-item">
                  <a 
                    className={`nav-link text-white ${currentView === 'login' ? 'fw-bold' : ''}`} 
                    href="#"
                    onClick={(e) => { e.preventDefault(); setView('login'); }}
                  >
                    Login
                  </a>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-custom"
                    onClick={() => setView('register')}
                  >
                    Register
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a 
                    className={`nav-link text-white ${currentView === 'dashboard' ? 'fw-bold' : ''}`} 
                    href="#"
                    onClick={(e) => { e.preventDefault(); setView('dashboard'); }}
                  >
                    {user.userType === 'Owner' ? 'Dashboard' : 'My Bookings'}
                  </a>
                </li>
                <li className="nav-item ms-3 text-secondary">
                  Hi <span className="text-white fw-bold">{user.name}</span>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-danger-custom py-1.5 px-3 fs-6"
                    onClick={logout}
                  >
                    Log Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
