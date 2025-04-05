import React, { useState, useEffect } from 'react';
import './form.css';
import "../../pages/auth-form.css";

const AddRoleForm = ({ onAdd, onCancel }) => {
  const initialFormData = { // Define initial state for easy reset
    name: '',
    description: '',
    permissions: ['']
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // For inline validation errors

  // --- Add State for Pop-up Notification ---
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  // --- Add Pop-up Timer Cleanup ---
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
    setFormData({ ...formData, [name]: value });
    if (error) setError(''); // Clear inline error on change
  };

  const handlePermissionChange = (index, value) => {
    const updatedPermissions = [...formData.permissions];
    updatedPermissions[index] = value;
    setFormData({ ...formData, permissions: updatedPermissions });
    if (error) setError(''); // Clear inline error on change
  };

  const addPermissionField = () => {
    setFormData({ ...formData, permissions: [...formData.permissions, ''] });
  };

  const removePermissionField = (index) => {
    const updatedPermissions = formData.permissions.filter((_, i) => i !== index);
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear inline errors first
    setPopup({ show: false, message: '', type: '' }); // Hide previous popups

    // Client-side validation
    const filteredPermissions = formData.permissions.filter(perm => perm.trim() !== '');
    if (filteredPermissions.length === 0) {
      setError('At least one permission is required');
      return;
    }
     if (!formData.name.trim()) {
      setError('Role Name is required');
      return;
    }
     if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }


    setLoading(true); // Start loading AFTER validation passes

    // Prepare role data
    const roleData = {
      ...formData,
      permissions: filteredPermissions
    };

    try {
      // Call the onAdd function passed from Dashboard
      // It should return the API response or throw an error
      const response = await onAdd(roleData);

      // --- Handle Success ---
      if (response && response.status === 'success') {
         setPopup({
           show: true,
           message: response.message || "Role created successfully!",
           type: 'success'
         });
         setFormData(initialFormData); // Reset the form fields
         // Close the form via the parent's state after a delay
         setTimeout(() => {
            onCancel(); // Call the cancel handler passed from parent
         }, 1500); // Delay to allow user to see popup

      } else {
        // --- Handle API failure status ---
        const errorMessage = response?.description || response?.message || 'Failed to add role.';
        setPopup({ show: true, message: errorMessage, type: 'error' });
      }

    } catch (err) {
      // --- Handle Network/Other Errors ---
      console.error("Add role error in form:", err);
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
        <h3 className="form-title">Add New Role</h3>
        <p className="form-subtitle">Create a new role with specific permissions.</p>
      </div>

      {/* Inline validation error display */}
       {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Form remains the same */}
      <form className="data-entry-form" onSubmit={handleSubmit}>
        {/* Role Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">Role Name</label>
          <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="form-input" placeholder="e.g. admin, user, editor"/>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" name="description" rows="3" required value={formData.description} onChange={handleChange} className="form-textarea" placeholder="Describe the role and its responsibilities"></textarea>
        </div>

        {/* Permissions */}
        <div className="form-group">
          <label className="form-label permissions-label">Permissions</label>
          {formData.permissions.map((permission, index) => (
            <div key={index} className="permission-input-group">
              <input type="text" value={permission} onChange={(e) => handlePermissionChange(index, e.target.value)} className="form-input permission-input" placeholder="e.g. scan_port, read_data"/>
              {formData.permissions.length > 1 && (
                <button type="button" onClick={() => removePermissionField(index)} className="button button-remove-permission">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" style={{height: '1.25em', width: '1.25em'}}>
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPermissionField} className="button button-add-permission">
             <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" style={{height: '1.25em', width: '1.25em', marginRight: '0.25em'}}>
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Permission
          </button>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="button button-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="button button-primary">
             {loading && <span className="spinner" aria-hidden="true"></span>}
            <span className="button-text">{loading ? 'Saving...' : 'Save Role'}</span>
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

export default AddRoleForm;