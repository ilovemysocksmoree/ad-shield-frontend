import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './auth-form.css';

const Register = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    first_name: '',
    last_name: '',
    email: '',
    role_id: '',
    password: '',
    contact_number: ''
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const navigate = useNavigate();
  const { login } = useAuth();

 
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.getAllRoles();
        if (response.status === 'success' && Array.isArray(response.role)) {
          setRoles(response.role);
          if (response.role.length > 0) {
            const defaultRole = response.role.find(r => r.name === 'user') || response.role[0];
             if(defaultRole) {
                setFormData(prev => ({ ...prev, role_id: defaultRole._id }));
             }
          }
        } else {
             throw new Error(response.message || 'Invalid roles data received');
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Failed to load roles. Please try again later.'); // Show initial loading error
        setPopup({ show: true, message: 'Failed to load roles.', type: 'error'});
        setTimeout(() => setPopup(p => ({ ...p, show: false })), 5000);
      }
    };
    fetchRoles();
  }, []);

   useEffect(() => {
    let timer;
    if (popup.show) {
      timer = setTimeout(() => {
        setPopup(p => ({ ...p, show: false }));
      }, 5000);
    }
    return () => clearTimeout(timer); 
  }, [popup.show]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
       // Keep number conversion logic
      [name]: name === 'contact_number' ? (value === '' ? '' : parseInt(value, 10)) : value
    });
     // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous form error
    // Optionally hide any existing popup immediately
    // setPopup({ show: false, message: '', type: '' });

    try {
      const dataToSend = {
        ...formData,
        contact_number: formData.contact_number === '' ? undefined : Number(formData.contact_number)
      };
      const response = await api.registerUser(dataToSend);

      if (response.status === 'success') {
        // --- Show Success Pop-up ---
        setPopup({ show: true, message: 'Registration Successful! Redirecting...', type: 'success' });
        // Perform login action from context
        login(response.user, response.token); // Make sure login context expects user & token
        // Navigate after a short delay to allow user to see the popup
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // --- Show Error Pop-up ---
        const errorMessage = response.message || 'Registration failed. Please check your details.';
        setError(errorMessage); // Optionally keep form error too
        setPopup({ show: true, message: errorMessage, type: 'error' });
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = 'An unexpected error occurred during registration.';
      setError(errorMessage); // Optionally keep form error too
      // --- Show Error Pop-up ---
      setPopup({ show: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use new container class with modifier
    <div className="auth-page-container auth-page-container--register">
      {/* Use new card class */}
      <div className="auth-card">
        {/* Use new card body class */}
        <div className="auth-card__body">
          {/* Use new header classes */}
          <div className="auth-card__header">
            <h2 className="auth-card__title">Create an Account</h2>
            <p className="auth-card__subtitle">
              Already have an account?{' '}
              {/* Use new link class with modifier */}
              <Link to="/login" className="auth-card__link auth-card__link--register">
                Sign in
              </Link>
            </p>
          </div>

          {/* Optional: Keep inline error display if desired alongside popup */}
          {/* {error && (
            <div className="error-message">
              {error}
            </div>
          )} */}

          {/* Use new form class */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Wrap inputs in form-group */}
            <div className="form-group">
              <label htmlFor="user_name" className="form-label">
                Username
              </label>
              <input
                id="user_name"
                name="user_name"
                type="text"
                required
                value={formData.user_name}
                onChange={handleChange}
                className="form-input" // Use standard input class
                placeholder="Choose a unique username"
              />
            </div>

            {/* Use grid class for name fields */}
            <div className="form-group form-grid--name">
              <div> {/* No need for extra form-group inside grid items */}
                <label htmlFor="first_name" className="form-label">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="form-label">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role_id" className="form-label">
                Role
              </label>
              {/* Use standard select class */}
              <select
                id="role_id"
                name="role_id"
                required
                value={formData.role_id}
                onChange={handleChange}
                className="form-select"
                disabled={!roles.length} // Disable if roles haven't loaded
              >
                <option value="" disabled>
                   {roles.length ? 'Select a role' : 'Loading roles...'}
                 </option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="5" // Add basic validation
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a secure password (min 5 chars)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_number" className="form-label">
                Contact Number
              </label>
              <input
                id="contact_number"
                name="contact_number"
                type="number" // Keep for number input benefits
                required
                value={formData.contact_number}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 1234567890"
              />
            </div>

            {/* Last form group for the button */}
            <div className="form-group">
              <button
                type="submit"
                disabled={loading || !formData.role_id} // Disable if loading or no role selected
                 // Use new button classes
                className="button button--auth button--auth-register"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- Pop-up Notification Element --- */}
      {popup.show && (
        <div className={`toast-notification toast-notification--bottom-right toast-notification--${popup.type} show`}>
          <span>{popup.message}</span>
          <button
             onClick={() => setPopup(p => ({ ...p, show: false }))}
             className="toast-notification__close"
             aria-label="Close notification"
          >
             ×
           </button>
        </div>
      )}
    </div>
  );
};

export default Register;