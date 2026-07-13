import React, { useState } from 'react';
import axios from 'axios';

export default function Register({ setView, loginUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    if (!name || !email || !password || !userType) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        userType,
      });
      loginUser(response.data);
      setView('home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(94, 82, 243, 0.1)', border: '1px solid rgba(94, 82, 243, 0.2)' }}>
            <span style={{ fontSize: '1.8rem' }}>📝</span>
          </div>
          <h2 className="text-white fw-bold mb-2">Sign Up</h2>
        </div>

        {error && (
          <div className="alert alert-danger text-center py-2" role="alert" style={{ fontSize: '0.9rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control-custom"
              placeholder="Renter Full Name / Owner Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <input
              type="email"
              className="form-control-custom"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <input
              type="password"
              className="form-control-custom"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-4">
            <select
              className="form-control-custom"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
              style={{ color: userType ? 'white' : '#6b7280' }}
            >
              <option value="" disabled>Select User Type</option>
              <option value="Renter">Renter</option>
              <option value="Owner">Owner</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-custom w-100 py-2.5 mb-3"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: '0.85rem' }}>
          <span className="text-secondary">Have an account? </span>
          <a href="#" className="text-decoration-none" style={{ color: '#ef4444' }} onClick={(e) => { e.preventDefault(); setView('login'); }}>Sign In</a>
        </div>
      </div>
    </div>
  );
}
