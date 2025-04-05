import React, { useState, useEffect } from 'react';
import "./form.css";
import "../../pages/auth-form.css";

const AddUserForm = ({ onAdd, onCancel, roles }) => {
  const initialFormData = { 
    user_name: '',
    first_name: '',
    last_name: '',
    email: '',
    role_id: '',
    password: '',
    contact_number: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });


  useEffect(() => {
    let timer;
    if (popup.show) {
      timer = setTimeout(() => {
        setPopup(p => ({ ...p, show: false }));
      }, 5000); // Auto-hide after 5 seconds
    }
    return () => clearTimeout(timer);
  }, [popup.show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'contact_number' ? (value === '' ? '' : parseInt(value, 10)) : value
    });
    if (error) setError(''); // Clear inline error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear inline errors first
    setPopup({ show: false, message: '', type: '' }); // Hide previous popups

    // Client-side validation
    if (!formData.role_id) {
      setError('Please select a role.');
      return;
    }
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    setLoading(true); // Start loading AFTER validation passes

    try {
      const dataToSend = {
        ...formData,
        contact_number: formData.contact_number === '' ? undefined : Number(formData.contact_number)
      };

      // Call the onAdd function passed from Dashboard
      // It should return the API response or throw an error
      const response = await onAdd(dataToSend);

      // --- Handle Success ---
      if (response && response.status === 'success') {
         setPopup({
           show: true,
           message: response.message || "User created successfully!",
           type: 'success'
         });
         setFormData(initialFormData); // Reset the form fields
         // Close the form via the parent's state after a delay
         setTimeout(() => {
            onCancel(); // Call the cancel handler passed from parent
         }, 1500); // Delay to allow user to see popup

      } else {
        // --- Handle API failure status ---
        const errorMessage = response?.description || response?.message || 'Failed to add user.';
        setPopup({ show: true, message: errorMessage, type: 'error' });
      }

    } catch (err) {
      // --- Handle Network/Other Errors ---
      console.error("Add user error in form:", err);
      let errorMessage = 'An unexpected error occurred.';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.description || err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setPopup({ show: true, message: errorMessage, type: 'error' });

    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="form-container">
      {/* Header remains the same */}
      <div className="form-header">
        <h3 className="form-title">Add New User</h3>
        <p className="form-subtitle">Create a new user account.</p>
      </div>

      {/* Inline validation error display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Form remains the same */}
      <form className="data-entry-form" onSubmit={handleSubmit}>
        <div className="form-grid">
           {/* ... all input fields ... */}
           {/* Username */}
          <div>
            <label htmlFor="user_name" className="form-label">Username</label>
            <input type="text" name="user_name" id="user_name" required value={formData.user_name} onChange={handleChange} className="form-input" placeholder="unique username"/>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role_id" className="form-label">Role</label>
            <select id="role_id" name="role_id" required value={formData.role_id} onChange={handleChange} className="form-select" disabled={!roles || roles.length === 0}>
              <option value="" disabled>Select a role</option>
              {roles && roles.map((role) => (
                // Ensure role object has _id (or id) and name
                <option key={role._id || role.id} value={role._id || role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="form-label">First Name</label>
            <input type="text" name="first_name" id="first_name" required value={formData.first_name} onChange={handleChange} className="form-input"/>
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="form-label">Last Name</label>
            <input type="text" name="last_name" id="last_name" required value={formData.last_name} onChange={handleChange} className="form-input"/>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">Email Address</label>
            <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="form-input"/>
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contact_number" className="form-label">Contact Number</label>
            <input type="number" name="contact_number" id="contact_number" required value={formData.contact_number} onChange={handleChange} className="form-input" placeholder="e.g., 1234567890"/>
          </div>

          {/* Password */}
          <div className="form-grid__item--span-2-sm">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" name="password" id="password" required minLength="5" value={formData.password} onChange={handleChange} className="form-input" placeholder="••••••••"/>
            <p className="form-help-text">Password must be at least 5 characters long.</p>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="button button-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="button button-primary">
            {loading && <span className="spinner" aria-hidden="true"></span>}
            <span className="button-text">{loading ? 'Saving...' : 'Create User'}</span>
          </button>
        </div>
      </form>

      {/* --- Pop-up Notification Element --- */}
      {popup.show && (
        <div className={`toast-notification toast-notification--bottom-right toast-notification--${popup.type} show`}>
           <span>{popup.message}</span>
           <button onClick={() => setPopup(p => ({ ...p, show: false }))} className="toast-notification__close" aria-label="Close notification">
             ×
           </button>
        </div>
      )}
    </div>
  );
};

export default AddUserForm;