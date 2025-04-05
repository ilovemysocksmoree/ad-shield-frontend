import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './auth-form.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    user_name: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Keep for form-level errors if needed briefly
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- State for Pop-up Notification ---
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

   // --- Pop-up Timer Cleanup ---
   useEffect(() => {
    let timer;
    if (popup.show) {
      timer = setTimeout(() => {
        setPopup(p => ({ ...p, show: false }));
      }, 5000); // Auto-hide after 5 seconds
    }
    return () => clearTimeout(timer); // Cleanup timer on component unmount or popup change
  }, [popup.show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
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
      const response = await api.loginUser(credentials);
      if (response.status === 'success') {
        // --- Show Success Pop-up ---
        setPopup({ show: true, message: 'Login Successful! Redirecting...', type: 'success' });
        // Perform login action from context
        login(response.user, response.token); // Ensure context expects these args
        // Navigate after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        const errorMessage = response.message || 'Invalid username or password.';
        setError(errorMessage); // Optionally keep form error too
        // --- Show Error Pop-up ---
        setPopup({ show: true, message: errorMessage, type: 'error' });
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = 'An unexpected error occurred during login.';
      setError(errorMessage); // Optionally keep form error too
      // --- Show Error Pop-up ---
      setPopup({ show: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use new container class with modifier
    <div className="auth-page-container auth-page-container--login">
       {/* Use new card class */}
      <div className="auth-card">
         {/* Use new card body class */}
        <div className="auth-card__body">
          {/* Use new header classes */}
          <div className="auth-card__header">
            <h2 className="auth-card__title">Sign in to your account</h2>
            <p className="auth-card__subtitle">
              Don't have an account?{' '}
              {/* Use new link class with modifier */}
              <Link to="/register" className="auth-card__link auth-card__link--login">
                Register
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
                value={credentials.user_name}
                onChange={handleChange}
                className="form-input" // Use standard input class
                placeholder="Your username"
              />
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
                value={credentials.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Your password"
              />
            </div>

             {/* Last form group for the button */}
            <div className="form-group">
              <button
                type="submit"
                disabled={loading}
                 // Use new button classes
                className="button button--auth button--auth-login"
              >
                {loading ? 'Signing in...' : 'Sign in'}
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

export default Login;