import React from 'react';
import './table.css';

const formatDuration = (ns) => {
  if (!ns) return 'N/A';
  return (ns / 1e9).toFixed(2) + ' s';
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString(); 
  } catch (e) {
    return 'Invalid Date';
  }
};

const ServiceHistoryTable = ({ history }) => {
  return (
    <div className="data-table-container">
      <div className="data-table-header data-table-header--history">
        <h2 className="data-table-header__title">Service Detection History</h2>
        <p className="data-table-header__description">
          History of previously initiated service detection scans.
        </p>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col" className="data-table__header-cell">Target</th>
              <th scope="col" className="data-table__header-cell">Port Range</th>
              <th scope="col" className="data-table__header-cell">Status</th>
              <th scope="col" className="data-table__header-cell">Duration</th>
              <th scope="col" className="data-table__header-cell">Open Ports</th>
              <th scope="col" className="data-table__header-cell">Scan Time</th>
              {/* <th scope="col" className="data-table__header-cell">User</th> */}
            </tr>
          </thead>
          <tbody>
            {history && history.length > 0 ? (
              history.map((item) => (
                <tr key={item._id} className="data-table__row">
                  <td className="data-table__cell data-table__cell--nowrap">
                    <div className="cell-text-main">{item.target_address}</div>
                     <div className="cell-text-subtle">ID: {item._id}</div>
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap">
                     {item.requested_port_range}
                   </td>
                  <td className="data-table__cell">
                    <span className={`status-badge status-badge--${item.status?.toLowerCase() || 'unknown'}`}>
                      {item.status || 'Unknown'}
                    </span>
                  </td>
                   <td className="data-table__cell data-table__cell--nowrap">
                     {formatDuration(item.scan_duration)}
                   </td>
                  <td className="data-table__cell">
                     {/* Show count or list of open ports */}
                     {item.scan_result_detail && item.scan_result_detail.length > 0
                        ? `${item.scan_result_detail.length} open (${item.scan_result_detail.map(p => p.port).join(', ')})`
                        : 'None detected'
                     }
                     {/* Alternatively, just show count: */}
                     {/* {item.scan_result_detail?.length || 0} */}
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap data-table__cell--muted">
                    {formatDateTime(item.scan_start_time)}
                  </td>
                   {/* Optional User Column
                   <td className="data-table__cell data-table__cell--nowrap">
                      {item.user_id} // Fetch user details if needed
                   </td>
                   */}
                </tr>
              ))
            ) : (
              <tr className="data-table__row">
                <td colSpan="6" className="data-table__cell data-table__cell--empty">
                  No service detection history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceHistoryTable;