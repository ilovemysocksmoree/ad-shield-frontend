import React from 'react';
import './table.css'; // Reuse existing table CSS

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};


const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleString();
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date';
    }
};


const PcapTable = ({ pcapMetadata = [], onRowClick }) => {
  if (!pcapMetadata || pcapMetadata.length === 0) {
    return <p className="no-data-message">No PCAP files uploaded yet.</p>;
  }

  return (
    <div className="data-table-container">
      <div className="data-table-header data-table-header--pcap">
        <h2 className="data-table-header__title">Uploaded PCAP Files</h2>
        <p className="data-table-header__description">
          List of uploaded PCAP files available for analysis. Click a row to view details.
        </p>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table data-table--clickable-rows"> {/* Add class for hover effect */}
          <thead>
            <tr>
              <th scope="col" className="data-table__header-cell">Original Name</th>
              {/* <th scope="col" className="data-table__header-cell">Stored Name</th> */}
              <th scope="col" className="data-table__header-cell">Size</th>
              <th scope="col" className="data-table__header-cell">Uploaded At</th>
              <th scope="col" className="data-table__header-cell">Uploaded By</th>
              <th scope="col" className="data-table__header-cell">Last Analyzed</th>
              <th scope="col" className="data-table__header-cell">File Hash</th>
            </tr>
          </thead>
          <tbody>
            {pcapMetadata && pcapMetadata.length > 0 ? (
              pcapMetadata.map((pcap) => (
                <tr
                    key={pcap.id}
                    className="data-table__row"
                    onClick={() => onRowClick(pcap.id)}
                    style={{ cursor: 'pointer' }} // Add pointer cursor
                >
                  <td className="data-table__cell data-table__cell--nowrap">
                    <div className="cell-text-main">{pcap.original_file_name}</div>
                    <div className="cell-text-subtle">ID: {pcap.id}</div>
                  </td>
                  {/* <td className="data-table__cell data-table__cell--nowrap data-table__cell--muted">{pcap.stored_file_name}</td> */}
                  <td className="data-table__cell data-table__cell--nowrap">
                    {formatBytes(pcap.file_size_bytes)}
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap data-table__cell--muted">
                    {formatDateTime(pcap.uploaded_at)}
                  </td>
                   <td className="data-table__cell data-table__cell--nowrap data-table__cell--muted">
                     {/* You might want to fetch user details based on ID if needed */}
                     {pcap.uploaded_by || 'N/A'}
                   </td>
                  <td className="data-table__cell data-table__cell--nowrap data-table__cell--muted">
                    {pcap.LastAnalyzedTime ? formatDateTime(pcap.LastAnalyzedTime) : 'Never'}
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap data-table__cell--muted" title={pcap.file_hash}>
                    {/* Show truncated hash */}
                    {pcap.file_hash ? `${pcap.file_hash.substring(0, 12)}...` : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="data-table__row">
                <td colSpan="6" className="data-table__cell data-table__cell--empty">
                  No PCAP files uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PcapTable;