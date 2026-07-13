import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RenterDashboard({ user, token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/renter', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-white fw-bold mb-4" style={{ fontFamily: 'Outfit' }}>My Booking Requests</h2>

      {error && (
        <div className="alert alert-danger" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-secondary py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card text-center text-secondary py-5">
          <p className="fs-5 mb-0">You have not submitted any booking requests yet.</p>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr className="text-secondary" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th scope="col" className="pb-3">Property Details</th>
                  <th scope="col" className="pb-3">Owner Contact</th>
                  <th scope="col" className="pb-3">Request Date</th>
                  <th scope="col" className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        {booking.property?.images?.length > 0 ? (
                          <img
                            src={`http://localhost:5000${booking.property.images[0]}`}
                            alt="Property"
                            className="rounded"
                            style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div className="rounded d-flex align-items-center justify-content-center bg-secondary text-secondary" style={{ width: '60px', height: '60px' }}>🏡</div>
                        )}
                        <div>
                          <div className="text-white fw-bold">{booking.property?.address || 'N/A'}</div>
                          <small className="text-secondary text-capitalize">{booking.property?.type} - {booking.property?.adType}</small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-white">{booking.owner?.name || 'N/A'}</div>
                      <small className="text-secondary">{booking.owner?.email || 'N/A'}</small>
                    </td>
                    <td className="py-3 text-secondary">
                      {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3">
                      <span className={`status-badge ${booking.status === 'Approved' ? 'available' : booking.status === 'Rejected' ? 'unavailable' : 'text-warning bg-warning bg-opacity-10 border border-warning border-opacity-30'}`} style={{ textTransform: 'capitalize' }}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
