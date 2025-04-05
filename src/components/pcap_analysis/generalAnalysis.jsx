import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    FiFileText,      // For filename
    FiDatabase,      // For storage/stored name
    FiHardDrive,     // For file size
    FiHash,          // For hash
    FiClock,         // For dates
    FiUploadCloud,   // For uploaded at/by
    FiInfo,          // For content type
    FiCopy,          // Copy icon
    FiCheck          // Check icon for copy success
} from 'react-icons/fi'; // Using Feather icons (choose any set)
import './analysis.css'; // Assuming updated styles are here or in analysis.css

// Helper function (can be moved to a utils file)
const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // Ensure result is not NaN if bytes is very small but not 0
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    return isNaN(value) ? '0 Bytes' : value + ' ' + sizes[i];
};

// Simple copy-to-clipboard helper
const copyToClipboard = (text, setCopied) => {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset after 1.5s
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Optionally show an error state
  });
};

// Reusable Info Block Component
const InfoBlock = ({ icon, label, value, isCode = false, fullWidth = false, allowCopy = false }) => {
  const [copied, setCopied] = useState(false);

  if (!value && value !== 0) { // Handle null, undefined, empty strings but allow 0
      value = 'N/A';
  }

  const handleCopy = (e) => {
      e.stopPropagation(); // Prevent triggering other clicks if nested
      if (value && value !== 'N/A') {
          copyToClipboard(value, setCopied);
      }
  };

  return (
    <div className={`info-block ${fullWidth ? 'full-width' : ''} ${isCode ? 'code-block' : ''}`}>
      <div className="info-block-header">
        {icon && <span className="info-block-icon">{icon}</span>}
        <span className="info-block-label">{label}</span>
      </div>
      <div className="info-block-value-wrapper">
        <span className={`info-block-value ${isCode ? 'code-value' : ''}`}>
          {value}
        </span>
        {allowCopy && value && value !== 'N/A' && (
          <button
            onClick={handleCopy}
            className="copy-button"
            title={copied ? "Copied!" : "Copy to clipboard"}
            aria-label="Copy to clipboard"
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </button>
        )}
      </div>
    </div>
  );
};


const GeneralAnalysisTab = ({ metaData }) => {
  if (!metaData) {
    return (
        <div className="tab-no-data">
            <FiInfo size={40} style={{ marginBottom: '15px', color: 'var(--text-color-muted)' }}/>
            <p>General metadata not available for this analysis.</p>
        </div>
    );
  }

  return (
    <div className="analysis-tab general-tab">
      {/* Tab title can be kept from parent or added here if needed */}
      {/* <h3 className="tab-title">General Information</h3> */}

      <div className="info-blocks-container">
         {/* Grouping related items visually */}
         <InfoBlock
             icon={<FiFileText />}
             label="Original Filename"
             value={metaData.original_file_name}
         />
         <InfoBlock
             icon={<FiHardDrive />}
             label="File Size"
             value={formatBytes(metaData.file_size_bytes)}
         />
         <InfoBlock
             icon={<FiHash />}
             label="File Hash (SHA256)"
             value={metaData.file_hash}
             isCode={true}
             allowCopy={true}
             fullWidth={true} // Example: Make hash take full width if desired
         />
         <InfoBlock
             icon={<FiDatabase />}
             label="Stored Filename"
             value={metaData.stored_file_name}
             isCode={true} // Often stored names are less readable
         />
          <InfoBlock
             icon={<FiInfo />}
             label="Content Type"
             value={metaData.content_type}
         />
         <InfoBlock
             icon={<FiUploadCloud />}
             label="Uploaded By"
             value={metaData.uploaded_by}
             isCode={true} // User IDs/emails might fit 'code' style
         />
         <InfoBlock
             icon={<FiClock />}
             label="Uploaded At"
             value={metaData.uploaded_at ? format(new Date(metaData.uploaded_at), 'PPpp zzz') : 'N/A'} // More readable format
         />
         <InfoBlock
             icon={<FiClock />}
             label="Last Analyzed"
             value={metaData.LastAnalyzedTime ? format(new Date(metaData.LastAnalyzedTime), 'PPpp zzz') : 'Never'} // More readable format
         />
         <InfoBlock
             icon={<FiDatabase />}
             label="Storage Path"
             value={metaData.storage_path}
             isCode={true}
             fullWidth={true} // Paths are often long
             allowCopy={true} // Paths can be useful to copy
         />
      </div>
    </div>
  );
};

export default GeneralAnalysisTab;