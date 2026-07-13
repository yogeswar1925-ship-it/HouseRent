import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80',
    title: 'Find Your Dream Rental Property',
    subtitle: 'Comfort, Convenience & Class — All in One Place'
  },
  {
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    title: 'Discover Luxury Living Spaces',
    subtitle: 'Handpicked properties in prime urban locations'
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    title: 'Premium Offices & Commercial Sites',
    subtitle: 'Expand your business footprint with top-tier commercial spaces'
  },
  {
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1600&q=80',
    title: 'Seamless Booking Experience',
    subtitle: 'Connect directly with owners and lock your next space in minutes'
  }
];

export default function Home({ setView, user, token }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [adType, setAdType] = useState('All Ad Types');
  const [type, setType] = useState('All Types');

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Auto Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch properties on filters update
  useEffect(() => {
    fetchProperties();
  }, [search, adType, type]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/properties', {
        params: {
          search,
          adType,
          type
        }
      });
      setProperties(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookProperty = async () => {
    if (!user || user.userType !== 'Renter') return;
    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(false);

    try {
      await axios.post('http://localhost:5000/api/bookings', {
        propertyId: selectedProperty._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingSuccess(true);
      // Refresh current properties to show updated status if needed
      fetchProperties();
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.message || 'Failed to submit booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setBookingSuccess(false);
    setBookingError('');
  };

  const closePropertyDetails = () => {
    setSelectedProperty(null);
  };

  return (
    <div>
      {/* Hero Carousel */}
      <div className="hero-slider">
        {SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-overlay">
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
              
              {index === 0 && !user && (
                <div className="d-flex gap-3">
                  <button className="btn btn-custom px-4 py-2.5 fs-5" onClick={() => setView('register')}>
                    Get Started
                  </button>
                  <button className="btn btn-secondary-custom px-4 py-2.5 fs-5 text-white" onClick={() => setView('login')}>
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Indicators */}
        <div className="carousel-indicators-custom">
          {SLIDES.map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Filter and Property List Section */}
      <div className="properties-container">
        <h2 className="text-center text-white fw-bold mb-4 fs-1" style={{ fontFamily: 'Outfit' }}>Explore Our Premium Properties</h2>
        
        {/* Search & Filter Bar */}
        <div className="search-filter-bar">
          <div className="filter-item" style={{ flex: '2' }}>
            <input
              type="text"
              className="form-control-custom"
              placeholder="Search by Address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <select
              className="form-control-custom"
              value={adType}
              onChange={(e) => setAdType(e.target.value)}
            >
              <option value="All Ad Types">All Ad Types</option>
              <option value="Rent">Rent</option>
              <option value="Sale">Sale</option>
            </select>
          </div>
          <div className="filter-item">
            <select
              className="form-control-custom"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="All Types">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="text-center text-secondary py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="glass-card text-center text-secondary py-5">
            <p className="fs-5 mb-0">No properties found matching your criteria.</p>
          </div>
        ) : (
          <div className="property-grid">
            {properties.map((property) => (
              <div className="property-card" key={property._id}>
                <div className="property-image-container">
                  {property.images?.length > 0 ? (
                    <img
                      src={`http://localhost:5000${property.images[0]}`}
                      alt="Property"
                      className="property-img"
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary text-secondary fs-1">🏡</div>
                  )}
                  <span className="property-badge">{property.adType}</span>
                  <span className="property-price-badge">₹{property.amount.toLocaleString()} {property.adType === 'Rent' ? '/mo' : ''}</span>
                </div>
                
                <div className="property-details">
                  <h4 className="property-address">{property.address}</h4>
                  
                  <div className="property-info">
                    <span className="text-capitalize">{property.type}</span>
                    <span className={`status-badge ${property.status === 'Available' ? 'available' : 'unavailable'}`}>
                      {property.status}
                    </span>
                  </div>

                  <div className="property-action mt-3">
                    {property.status === 'Not Available' ? (
                      <button className="btn btn-secondary-custom w-100 py-2 text-danger border-danger fw-bold" disabled>
                        Not Available
                      </button>
                    ) : !user ? (
                      <button className="btn btn-secondary-custom w-100 py-2 text-warning border-warning" onClick={() => setView('login')}>
                        Login to see details
                      </button>
                    ) : user.userType === 'Owner' ? (
                      <button 
                        className="btn btn-secondary-custom w-100 py-2 text-white" 
                        onClick={() => setView('dashboard')}
                      >
                        Manage in Dashboard
                      </button>
                    ) : (
                      <button className="btn btn-custom w-100 py-2" onClick={() => openPropertyDetails(property)}>
                        View Details & Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Owner Registration Banner */}
        {!user && (
          <div className="glass-card text-center mt-5 p-5">
            <h3 className="text-white fw-bold mb-3" style={{ fontFamily: 'Outfit' }}>Looking to post your property?</h3>
            <p className="text-secondary mb-4">Register as an Owner to list your residential or commercial properties and receive bookings instantly.</p>
            <button className="btn btn-custom px-4 py-2" onClick={() => setView('register')}>
              Register as Owner
            </button>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content text-white border-0 glass-card p-0" style={{ backgroundColor: '#111827', borderRadius: '16px' }}>
              <div className="modal-header border-bottom border-secondary px-4 py-3 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-white fs-4" style={{ fontFamily: 'Outfit' }}>Property Details</h5>
                <button type="button" className="btn-close btn-close-white border-0 bg-transparent fs-4 text-white" onClick={closePropertyDetails}>&times;</button>
              </div>
              
              <div className="modal-body p-4">
                <div className="row">
                  <div className="col-md-6 mb-4 mb-md-0">
                    {selectedProperty.images?.length > 0 ? (
                      <img
                        src={`http://localhost:5000${selectedProperty.images[0]}`}
                        alt="Property Details"
                        className="img-fluid rounded border border-secondary"
                        style={{ width: '100%', height: '280px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-100 h-100 rounded d-flex align-items-center justify-content-center bg-secondary text-secondary fs-1" style={{ minHeight: '280px' }}>🏡</div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <h3 className="fw-bold mb-3" style={{ fontFamily: 'Outfit', color: '#818cf8' }}>
                      ₹{selectedProperty.amount.toLocaleString()} {selectedProperty.adType === 'Rent' ? '/mo' : ''}
                    </h3>
                    <p className="text-white fw-bold mb-2">Address:</p>
                    <p className="text-secondary mb-3">{selectedProperty.address}</p>
                    
                    <div className="row mb-3">
                      <div className="col-6">
                        <span className="text-secondary d-block">Property Type:</span>
                        <strong className="text-white text-capitalize">{selectedProperty.type}</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-secondary d-block">Ad Type:</span>
                        <strong className="text-white text-capitalize">{selectedProperty.adType}</strong>
                      </div>
                    </div>

                    <div className="border-top border-secondary pt-3 mt-3">
                      <p className="text-white fw-bold mb-2">Owner Contact Details:</p>
                      <p className="text-secondary mb-1">Name: <strong className="text-white">{selectedProperty.owner?.name}</strong></p>
                      <p className="text-secondary mb-1">Email: <strong className="text-white">{selectedProperty.owner?.email}</strong></p>
                      <p className="text-secondary">Phone: <strong className="text-warning">{selectedProperty.contactNo}</strong></p>
                    </div>
                  </div>
                </div>

                {selectedProperty.additionalDetails && (
                  <div className="border-top border-secondary pt-3 mt-4">
                    <p className="text-white fw-bold mb-2">Description / Additional Details:</p>
                    <p className="text-secondary mb-0">{selectedProperty.additionalDetails}</p>
                  </div>
                )}

                {bookingError && (
                  <div className="alert alert-danger mt-3 py-2 text-center" role="alert">
                    {bookingError}
                  </div>
                )}

                {bookingSuccess && (
                  <div className="alert alert-success mt-3 py-2 text-center" role="alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
                    🎉 Booking request submitted successfully! The owner will review your request.
                  </div>
                )}
              </div>

              <div className="modal-footer border-top border-secondary px-4 py-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary-custom text-white" onClick={closePropertyDetails}>
                  Close
                </button>
                {user && user.userType === 'Renter' && !bookingSuccess && (
                  <button type="button" className="btn btn-custom" onClick={handleBookProperty} disabled={bookingLoading}>
                    {bookingLoading ? 'Requesting...' : 'Request Booking / Rent Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
