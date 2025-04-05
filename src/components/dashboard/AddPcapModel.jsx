import React, { useState, useCallback, useRef } from 'react';
import './pcap_model.css'; 

const PcapUploadModal = ({ isOpen, onClose, onUploadSuccess, apiUploadFunction }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null); // Ref to trigger file input click

  const resetModalState = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadError('');
    setDragOver(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose(); 
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
       if (file.name.endsWith('.pcap') || file.name.endsWith('.pcapng')) {
            setSelectedFile(file);
            setUploadError(''); 
       } else {
            setSelectedFile(null);
            setUploadError('Invalid file type. Please upload a .pcap or .pcapng file.');
       }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const result = await apiUploadFunction(selectedFile);
      console.log('Upload successful:', result);

      if(result.status === "failed") {
        setUploadError(result.description)
        return
      }

      onUploadSuccess(result.pcap_meta_data); 
      handleClose(); 
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error.message || 'An unknown error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
     setDragOver(true);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
         if (file.name.endsWith('.pcap') || file.name.endsWith('.pcapng')) {
            setSelectedFile(file);
            setUploadError('');
         } else {
            setSelectedFile(null);
            setUploadError('Invalid file type. Please drop a .pcap or .pcapng file.');
         }
    }
  }, []);

  // --- Trigger file input when drop zone is clicked ---
   const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
   }


  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={handleClose} aria-label="Close modal">
          ×
        </button>
        <h2 className="modal-title">Upload PCAP File</h2>

        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput} // Make the whole area clickable
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pcap,.pcapng" // Restrict file types
            style={{ display: 'none' }} // Hide the default input
            id="pcap-file-input"
          />
          {selectedFile ? (
             <>
               <span className="file-icon">📄</span> {/* Simple file icon */}
               <p>Selected: <strong>{selectedFile.name}</strong></p>
               <p className='click-or-drag-text'>(Click or drag another file to replace)</p>
             </>
          ) : (
             <>
                <span className="upload-icon">☁️</span> {/* Simple cloud icon */}
                <p><strong>Drag & Drop</strong> your .pcap file here</p>
                <p>or</p>
                <button type="button" className="button button-secondary browse-button">Browse Files</button>
             </>

          )}
        </div>

        {uploadError && <p className="modal-error-message">{uploadError}</p>}

        <div className="modal-actions">
          <button
            className="button button-primary upload-button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <span className="spinner"></span> Uploading...
              </>
            ) : (
              'Upload File'
            )}
          </button>
          <button
            className="button button-secondary cancel-button"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PcapUploadModal;