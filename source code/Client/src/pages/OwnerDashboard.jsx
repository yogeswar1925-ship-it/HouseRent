import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OwnerDashboard({ user, token }) {
  const [activeTab, setActiveTab] = useState('add-property'); // 'add-property', 'all-properties', 'all-bookings'
  
  // Add Property State
  const [propertyType, setPropertyType] = useState('Residential');
  const [propertyAdType, setPropertyAdType] = useState('Rent');
  const [address, setAddress] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [amount, setAmount] = useState('0');
  const [details, setDetails] = useState('');
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [addMsg, setAddMsg] = useState({ text: '', type: '' });
  const [addLoading, setAddLoading] = useState(false);

  // All Properties State
  const [properties, setProperties] = useState([]);
  const [propsLoading, setPropsLoading] = useState(false);

  // All Bookings State
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'all-properties') {
      fetchMyProperties();
    } else if (activeTab === 'all-bookings') {
      fetchReceivedBookings();
    }
  }, [activeTab]);

  const fetchMyProperties = async () => {
    setPropsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/properties/owner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPropsLoading(false);
    }
  };

  const fetchReceivedBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/owner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setAddMsg({ text: '', type: '' });
    setAddLoading(true);

    if (!address || !contactNo || !amount) {
      setAddMsg({ text: 'Please fill out all required fields.', type: 'danger' });
      setAddLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('type', propertyType);
    formData.append('adType', propertyAdType);
    formData.append('address', address);
    formData.append('contactNo', contactNo);
    formData.append('amount', amount);
    formData.append('additionalDetails', details);

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
    }

    try {
      await axios.post('http://localhost:5000/api/properties', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setAddMsg({ text: 'Property added successfully!', type: 'success' });
      // Reset form
      setAddress('');
      setContactNo('');
      setAmount('0');
      setDetails('');
      setSelectedFiles(null);
      // Reset file input element
      const fileInput = document.getElementById('property-images');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      setAddMsg({ text: err.response?.data?.message || 'Failed to add property', type: 'danger' });
    } finally {
      setAddLoading(false);
    }
  };

  const togglePropertyStatus = async (propId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/properties/${propId}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setProperties(properties.map(p => p._id === propId ? response.data : p));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh list
      fetchReceivedBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status');
    }
  };

  return (
    <div className="container py-5">
      {/* Tabs Headers */}
      <div className="d-flex border-bottom border-secondary mb-5" style={{ gap: '2rem' }}>
        <button
          className="btn text-white pb-3 rounded-0 fw-bold border-0"
          style={{
            borderBottom: activeTab === 'add-property' ? '3px solid var(--accent-color) !important' : 'none',
            color: activeTab === 'add-property' ? 'white' : 'var(--text-secondary)',
            boxShadow: 'none',
            outline: 'none',
            borderBottomStyle: 'solid',
            borderBottomWidth: activeTab === 'add-property' ? '3px' : '0px',
            borderBottomColor: 'var(--accent-color)',
            background: 'transparent'
          }}
          onClick={() => setActiveTab('add-property')}
        >
          Add Property
        </button>
        <button
          className="btn text-white pb-3 rounded-0 fw-bold border-0"
          style={{
            borderBottom: activeTab === 'all-properties' ? '3px solid var(--accent-color) !important' : 'none',
            color: activeTab === 'all-properties' ? 'white' : 'var(--text-secondary)',
            boxShadow: 'none',
            outline: 'none',
            borderBottomStyle: 'solid',
            borderBottomWidth: activeTab === 'all-properties' ? '3px' : '0px',
            borderBottomColor: 'var(--accent-color)',
            background: 'transparent'
          }}
          onClick={() => setActiveTab('all-properties')}
        >
          All Properties
        </button>
        <button
          className="btn text-white pb-3 rounded-0 fw-bold border-0"
          style={{
            borderBottom: activeTab === 'all-bookings' ? '3px solid var(--accent-color) !important' : 'none',
            color: activeTab === 'all-bookings' ? 'white' : 'var(--text-secondary)',
            boxShadow: 'none',
            outline: 'none',
            borderBottomStyle: 'solid',
            borderBottomWidth: activeTab === 'all-bookings' ? '3px' : '0px',
            borderBottomColor: 'var(--accent-color)',
            background: 'transparent'
          }}
          onClick={() => setActiveTab('all-bookings')}
        >
          All Bookings
        </button>
      </div>

      {/* Tab 1: Add Property */}
      {activeTab === 'add-property' && (
        <div className="glass-card" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <h3 className="text-center text-white fw-bold mb-4" style={{ fontFamily: 'Outfit' }}>Add New Property</h3>

          {addMsg.text && (
            <div className={`alert alert-${addMsg.type} text-center py-2`} role="alert">
              {addMsg.text}
            </div>
          )}

          <form onSubmit={handleAddProperty}>
            <div className="row">
              <div className="col-md-6 form-group mb-3">
                <label className="form-label">Property Type</label>
                <select
                  className="form-control-custom"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div className="col-md-6 form-group mb-3">
                <label className="form-label">Property Ad Type</label>
                <select
                  className="form-control-custom"
                  value={propertyAdType}
                  onChange={(e) => setPropertyAdType(e.target.value)}
                >
                  <option value="Rent">Rent</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Property Full Address</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 form-group mb-3">
                <label className="form-label">Property Images</label>
                <input
                  type="file"
                  id="property-images"
                  className="form-control-custom"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="col-md-3 form-group mb-3">
                <label className="form-label">Owner Contact No.</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="Contact number"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3 form-group mb-3">
                <label className="form-label">Property Amount</label>
                <input
                  type="number"
                  className="form-control-custom"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Additional Details for the Property</label>
              <textarea
                className="form-control-custom"
                rows="4"
                placeholder="Add any details here..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-custom px-4 py-2"
                disabled={addLoading}
              >
                {addLoading ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: All Properties */}
      {activeTab === 'all-properties' && (
        <div>
          {propsLoading ? (
            <div className="text-center text-secondary py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-card text-center text-secondary py-5">
              <p className="fs-5 mb-0">You have not listed any properties yet.</p>
            </div>
          ) : (
            <div className="property-grid">
              {properties.map((prop) => (
                <div className="property-card" key={prop._id}>
                  <div className="property-image-container">
                    {prop.images?.length > 0 ? (
                      <img
                        src={`http://localhost:5000${prop.images[0]}`}
                        alt="Property"
                        className="property-img"
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary text-secondary fs-1">🏡</div>
                    )}
                    <span className="property-badge">{prop.adType}</span>
                    <span className="property-price-badge">₹{prop.amount.toLocaleString()} {prop.adType === 'Rent' ? '/mo' : ''}</span>
                  </div>
                  <div className="property-details">
                    <h4 className="property-address">{prop.address}</h4>
                    <div className="property-info">
                      <span>Type: <strong className="text-white text-capitalize">{prop.type}</strong></span>
                      <span>Contact: <strong className="text-white">{prop.contactNo}</strong></span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className={`status-badge ${prop.status === 'Available' ? 'available' : 'unavailable'}`}>
                        {prop.status}
                      </span>
                      <button
                        className={`btn ${prop.status === 'Available' ? 'btn-secondary-custom' : 'btn-custom'} py-1.5 px-3 fs-7`}
                        onClick={() => togglePropertyStatus(prop._id)}
                      >
                        {prop.status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Bookings */}
      {activeTab === 'all-bookings' && (
        <div>
          {bookingsLoading ? (
            <div className="text-center text-secondary py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-card text-center text-secondary py-5">
              <p className="fs-5 mb-0">No booking requests received yet.</p>
            </div>
          ) : (
            <div className="glass-card p-4">
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead>
                    <tr className="text-secondary" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th scope="col" className="pb-3">Renter Details</th>
                      <th scope="col" className="pb-3">Property Address</th>
                      <th scope="col" className="pb-3">Booking Date</th>
                      <th scope="col" className="pb-3">Status</th>
                      <th scope="col" className="pb-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td className="py-3">
                          <div className="text-white fw-bold">{booking.renter?.name || 'N/A'}</div>
                          <small className="text-secondary">{booking.renter?.email || 'N/A'}</small>
                        </td>
                        <td className="py-3 text-white">
                          {booking.property?.address || 'N/A'}
                        </td>
                        <td className="py-3 text-secondary">
                          {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </td>
                        <td className="py-3">
                          <span className={`status-badge ${booking.status === 'Approved' ? 'available' : booking.status === 'Rejected' ? 'unavailable' : 'text-warning bg-warning bg-opacity-10 border border-warning border-opacity-30'}`} style={{ textTransform: 'capitalize' }}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 text-end">
                          {booking.status === 'Pending' ? (
                            <div className="d-flex gap-2 justify-content-end">
                              <button
                                className="btn btn-custom py-1.5 px-3 fs-7"
                                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                                onClick={() => handleBookingAction(booking._id, 'Approved')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger-custom py-1.5 px-3 fs-7"
                                onClick={() => handleBookingAction(booking._id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-secondary fs-7">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
