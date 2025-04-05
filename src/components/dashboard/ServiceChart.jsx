import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from 'recharts';

// Helper to format duration (nanoseconds to seconds) - keep this
const formatDuration = (ns) => {
  if (!ns) return 0; // Return 0 for chart data if undefined/null
  return parseFloat((ns / 1e9).toFixed(2)); // Return number for chart Y-axis
};

// Helper to format date/time for Tooltip/Axis - keep this
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Simple format for axis, more detail in tooltip maybe
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};


const processHistoryData = (history) => {
  const portCounts = {};
  const serviceCounts = {};
  // Remove statusCounts logic
  // const statusCounts = {};
  const scanDurations = []; // New array for duration chart

  // Sort history by scan start time to make the timeline meaningful
  const sortedHistory = [...history].sort((a, b) =>
    new Date(a.scan_start_time) - new Date(b.scan_start_time)
  );

  sortedHistory.forEach(item => {
    // Process details for port/service counts (only for successful scans maybe?)
    const status = item.status?.toLowerCase() || 'unknown';
    if (status === 'success' && Array.isArray(item.scan_result_detail)) {
      item.scan_result_detail.forEach(detail => {
        const port = detail.port?.toString();
        if (port) portCounts[port] = (portCounts[port] || 0) + 1;
        const service = detail.service || 'unknown';
        if (service) serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      });
    }

    // Add data point for duration chart for *every* scan that has timing info
    if (item.scan_start_time && item.scan_duration) {
      scanDurations.push({
        time: new Date(item.scan_start_time).getTime(), // Use timestamp for sorting/positioning
        formattedTime: formatDateTime(item.scan_start_time), // For display
        duration: formatDuration(item.scan_duration), // Duration in seconds
        target: item.target_address, // Add target for tooltip info
        ports: item.requested_port_range // Add port range for tooltip info
      });
    }
  });

  // Convert counts for Bar charts (keep this logic)
  const topPorts = Object.entries(portCounts)
    .map(([port, count]) => ({ port: parseInt(port, 10), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topServices = Object.entries(serviceCounts)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Remove statusDistribution
  // const statusDistribution = ...

  return { topPorts, topServices, scanDurations }; // Return new scanDurations array
};


// Custom Tooltip for Duration Chart
const DurationTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Access the full data point object
    return (
      <div className="recharts-tooltip-wrapper" style={{ background: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{`Time: ${data.formattedTime}`}</p>
        <p style={{ margin: '4px 0 0 0', color: payload[0].color }}>{`Duration: ${data.duration} s`}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', color: '#666' }}>{`Target: ${data.target}`}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', color: '#666' }}>{`Ports: ${data.ports}`}</p>
      </div>
    );
  }
  return null;
};


const ServiceHistoryCharts = ({ history }) => {
  const { topPorts, topServices, scanDurations } = useMemo(() => {
    if (!history || history.length === 0) {
      return { topPorts: [], topServices: [], scanDurations: [] };
    }
    return processHistoryData(history);
  }, [history]);

  return (
    <div className="charts-container">
      {/* Chart 1: Top Open Ports (Keep as is) */}
      <div className="chart-wrapper">
        <h3 className="chart-title">Top 5 Open Ports</h3>
        {topPorts.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPorts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="port" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Occurrences"/>
            </BarChart>
          </ResponsiveContainer>
        ) : (
             <p className="no-chart-data">No open port data available.</p>
        )}
      </div>

      {/* Chart 2: Top Detected Services (Keep as is) */}
      <div className="chart-wrapper">
        <h3 className="chart-title">Top 5 Detected Services</h3>
         {topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topServices} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="service" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" name="Occurrences"/>
                </BarChart>
            </ResponsiveContainer>
         ) : (
             <p className="no-chart-data">No service data available.</p>
         )}
      </div>

      {/* Chart 3: Scan Duration Timeline */}
      <div className="chart-wrapper">
        <h3 className="chart-title">Scan Duration Over Time</h3>
        {scanDurations.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={scanDurations}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                 dataKey="time" // Use the timestamp for positioning
                 type="number" // Treat as number (timestamp)
                 domain={['dataMin', 'dataMax']} // Ensure full range is shown
                 scale="time" // Interpret the number as time
                 tickFormatter={(unixTime) => formatDateTime(unixTime)} // Format ticks nicely
                 // You might need to adjust tickCount or interval for readability on smaller screens
                 // interval="preserveStartEnd" // or a number
                 // tickCount={5} // Example
              />
              <YAxis
                 label={{ value: 'Duration (s)', angle: -90, position: 'insideLeft', offset: 10 }}
                 allowDecimals={true}
               />
              <Tooltip content={<DurationTooltip />} /> {/* Use custom tooltip */}
              <Line
                 type="monotone"
                 dataKey="duration"
                 stroke="#ff7300" // Orange color for duration line
                 strokeWidth={2}
                 dot={{ r: 3 }} // Show small dots on data points
                 activeDot={{ r: 6 }} // Larger dot when hovering
                 name="Scan Duration (s)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
            <p className="no-chart-data">No scan duration data available.</p>
        )}
      </div>
    </div>
  );
};

export default ServiceHistoryCharts;