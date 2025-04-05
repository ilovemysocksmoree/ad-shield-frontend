import React, { useState } from 'react';
import "./form.css";
import "../../pages/auth-form.css";

const DetectServiceForm = ({ onDetect, onCancel, users }) => {
  const [targetAddress, setTargetAddress] = useState('');
  const [portRange, setPortRange] = useState('');
  const [userID, setUserID] = useState('');
  const [isScanning, setIsScanning] = useState(false); // True while waiting for INITIATION response
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const validateIp = (ip) => {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    // Very basic check for domain-like structure, improve if needed
    const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/;
    return ipRegex.test(ip) || domainRegex.test(ip); // Allow IP or domain-like names
  };

  const validatePortRange = (range) => {
    const rangeRegex = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/;
    return rangeRegex.test(range.replace(/\s+/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: '', type: '' });

    // --- Validation ---
    if (!validateIp(targetAddress)) {
      setStatusMessage({ text: 'Invalid IP address or domain format.', type: 'error' });
      return;
    }
    if (!validatePortRange(portRange)) {
      setStatusMessage({ text: 'Invalid port range format (e.g., 1-1000, 80, 22,80).', type: 'error' });
      return;
    }
    // --- Add User ID Validation ---
    if (!userID) {
       setStatusMessage({ text: 'Please select a user.', type: 'error' });
       return;
    }
    // --- End Validation ---


    // Set loading state specifically for the API call to initiate the scan
    setIsScanning(true);
    setStatusMessage({ text: `Initiating scan for ${targetAddress} on ports ${portRange}...`, type: 'info' });

    try {
      // Call the function passed from Dashboard, which calls the API
      // `await` here waits for the API call *to start the scan* to finish
      const response = await onDetect({
        target_address: targetAddress,
        port_range: portRange,
        user_id: userID // Pass the selected user ID
      });

      // This code runs *after* the initiation API call completes

      // Check if the INITIATION was successful based on API response structure
      if (response && response.status === 'success') {
        setStatusMessage({
            text: `Scan for ${targetAddress} started successfully. Results will appear in the history table shortly.`, // More descriptive message
            type: 'success'
        });
        // Reset form fields
        setTargetAddress('');
        setPortRange('');
        setUserID('');
   
        // Close the form after showing the message
        setTimeout(() => {
            onCancel();
        }, 5000);
    } else {
        // The API call to initiate the scan failed
        setStatusMessage({ text: response?.description || response?.message || 'Failed to initiate scan.', type: 'error' });
      }

    } catch (err) {
      // Network error or error thrown from onDetect/API call
      console.error("Detect service error:", err);
      setStatusMessage({ text: err.message || 'An error occurred while starting the scan.', type: 'error' });
    } finally {
      // This ALWAYS runs after the try/catch finishes
      // Stop the loading indicator because the *initiation request* is complete.
      setIsScanning(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h3 className="form-title">Detect Network Services</h3>
        <p className="form-subtitle">Enter target details to scan for open ports and services.</p>
      </div>

      {statusMessage.text && (
        <div className={`form-status-message form-status-message--${statusMessage.type} ${isScanning && statusMessage.type === 'info' ? 'pulsing' : ''}`}>
          {statusMessage.text}
        </div>
      )}

      <form className="data-entry-form" onSubmit={handleSubmit}>
        {/* IP Address Input */}
        <div className="form-group">
          <label htmlFor="target_address" className="form-label">
            Target IP Address or Domain
          </label>
          <input
            type="text"
            name="target_address"
            id="target_address"
            required
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            className="form-input"
            placeholder="e.g., 192.168.1.1 or example.com"
            disabled={isScanning}
          />
        </div>

        {/* Port Range Input */}
        <div className="form-group">
          <label htmlFor="port_range" className="form-label">
            Port Range
          </label>
          <input
            type="text"
            name="port_range"
            id="port_range"
            required
            value={portRange}
            onChange={(e) => setPortRange(e.target.value)}
            className="form-input"
            placeholder="e.g., 1-1024, 80, 443, 22"
            disabled={isScanning}
          />
          <p className="form-help-text">
            Specify single ports, ranges (1-100), or comma-separated lists.
          </p>
        </div>

        {/* User Selection Dropdown */}
        <div className="form-group"> {/* Added form-group for consistent spacing */}
          <label htmlFor="user_id" className="form-label">
            Scan As User
          </label>
          <select
            id="user_id"
            name="user_id"
            required
            value={userID}
            onChange={(e) => { setUserID(e.target.value) }} // Update userID state
            className="form-select"
            disabled={isScanning || !users || users.length === 0} // Disable if scanning or no users
          >
            <option value="" disabled>Select a user</option>
            {/* Ensure 'users' prop is passed correctly from Dashboard */}
            {users && users.map((user) => (
              // Make sure user object has 'id' and 'user_name' fields
              <option key={user.id || user._id} value={user.id || user._id}>
                {user.user_name} {user.first_name ? `(${user.first_name})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="button button-secondary"
            disabled={isScanning}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isScanning} // Disable button while initiation is in progress
            className="button button-primary"
          >
            {isScanning && <span className="spinner" aria-hidden="true"></span>}
            <span className="button-text">{isScanning ? 'Initiating...' : 'Start Scan'}</span>
          </button>
        </div>
      </form>

    </div>
  );
};

export default DetectServiceForm;