import React from 'react';
import { format } from 'date-fns';
import './analysis.css'; 

const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const GeneralAnalysisTab = ({ metaData }) => {
  if (!metaData) {
    return <p className="tab-no-data">General metadata not available.</p>;
  }

  return (
    <div className="analysis-tab general-tab">
      <h3 className="tab-title">General Information</h3>
      <div className="info-grid">
         <div className="info-item">
             <span className="info-label">Original Filename:</span>
             <span className="info-value">{metaData.original_file_name || 'N/A'}</span>
         </div>
         <div className="info-item">
             <span className="info-label">Stored Filename:</span>
             <span className="info-value">{metaData.stored_file_name || 'N/A'}</span>
         </div>
          <div className="info-item">
             <span className="info-label">File Size:</span>
             <span className="info-value">{formatBytes(metaData.file_size_bytes)}</span>
         </div>
         <div className="info-item">
             <span className="info-label">File Hash (SHA256):</span>
             <span className="info-value code-value">{metaData.file_hash || 'N/A'}</span>
         </div>
         <div className="info-item">
             <span className="info-label">Uploaded At:</span>
             <span className="info-value">
                {metaData.uploaded_at ? format(new Date(metaData.uploaded_at), 'yyyy-MM-dd HH:mm:ss zzz') : 'N/A'}
            </span>
         </div>
         <div className="info-item">
             <span className="info-label">Last Analyzed:</span>
             <span className="info-value">
                {metaData.LastAnalyzedTime ? format(new Date(metaData.LastAnalyzedTime), 'yyyy-MM-dd HH:mm:ss zzz') : 'Never'}
             </span>
         </div>
          <div className="info-item">
             <span className="info-label">Uploaded By:</span>
             <span className="info-value code-value">{metaData.uploaded_by || 'N/A'}</span>
         </div>
         <div className="info-item">
             <span className="info-label">Content Type:</span>
             <span className="info-value">{metaData.content_type || 'N/A'}</span>
         </div>
         <div className="info-item full-width">
             <span className="info-label">Storage Path:</span>
             <span className="info-value code-value">{metaData.storage_path || 'N/A'}</span>
         </div>

      </div>
    </div>
  );
};

export default GeneralAnalysisTab;