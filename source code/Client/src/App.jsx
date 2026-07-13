import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import RenterDashboard from './pages/RenterDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('home');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('rentease_user');
    const storedToken = localStorage.getItem('rentease_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setInitialized(true);
  }, []);

  const loginUser = (data) => {
    setUser(data);
    setToken(data.token);
    localStorage.setItem('rentease_user', JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      userType: data.userType,
    }));
    localStorage.setItem('rentease_token', data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rentease_user');
    localStorage.removeItem('rentease_token');
    setView('home');
  };

  if (!initialized) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#0a0e17' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentView={view} setView={setView} user={user} logout={logout} />
      
      <main className="flex-grow-1">
        {view === 'home' && <Home setView={setView} user={user} token={token} />}
        {view === 'login' && <Login setView={setView} loginUser={loginUser} />}
        {view === 'register' && <Register setView={setView} loginUser={loginUser} />}
        {view === 'dashboard' && user && (
          user.userType === 'Owner' ? (
            <OwnerDashboard user={user} token={token} />
          ) : (
            <RenterDashboard user={user} token={token} />
          )
        )}
      </main>

      <footer className="py-4 text-center border-top border-secondary mt-5" style={{ backgroundColor: 'rgba(10, 14, 23, 0.5)', fontSize: '0.9rem' }}>
        <p className="text-secondary mb-0">&copy; {new Date().getFullYear()} RentEase. All rights reserved.</p>
      </footer>
    </div>
  );
}
