import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector
} from 'recharts';
import './analysis.css';
import ChartCard from './ChartCard';

// --- Helper Functions ---
const getTopNFromObject = (obj, n, keyName = 'name', valueName = 'value') => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj)
    .map(([key, val]) => ({ [keyName]: key, [valueName]: val }))
    .sort((a, b) => b[valueName] - a[valueName])
    .slice(0, n);
};

const formatPortValue = (value) => {
    if (value == 0) return 0;
    if (value >= 1000) return `${(value/1000).toFixed(1)}k`;
    return value;
}

// --- Recharts Config ---
const COLORS_TCP_UDP = ['#8884d8', '#82ca9d']; // TCP, UDP

// Custom label for Pie Chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (!percent || percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="bold">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
};


// --- Component ---
const TransportAnalysisTab = ({ transportData }) => {
  if (!transportData) {
    return <p className="tab-no-data">Transport layer analysis data not available.</p>;
  }

  // --- Data Transformation ---
  const tcpUdpData = [
    { name: 'TCP', packets: transportData.TCPPacketCount || 0 },
    { name: 'UDP', packets: transportData.UDPPacketCount || 0 },
  ].filter(p => p.packets > 0); // Only show if packets exist

  const topPortsData = getTopNFromObject(transportData.PortStats, 20, 'port', 'count');
  const topUdpFloodPorts = getTopNFromObject(transportData.UDPFloodPorts, 15, 'port', 'count');

  // Example: Top Stream Talkers (by byte count - Needs careful implementation if needed)
  // This requires processing `StreamData` which maps flow keys to byte counts.
  // Let's keep it simple for now and focus on ports/protocols.

  return (
    <div className="analysis-tab transport-tab chart-grid">

       {/* TCP vs UDP Packet Count */}
       <ChartCard title="TCP vs UDP (Packet Count)">
         {tcpUdpData.length > 0 ? (
           <ResponsiveContainer width="100%" height={300}>
             <PieChart>
               <Pie
                 data={tcpUdpData}
                 cx="50%"
                 cy="50%"
                 labelLine={false}
                 label={renderCustomizedLabel}
                 outerRadius={100}
                 fill="#8884d8"
                 dataKey="packets"
                 nameKey="name"
               >
                 {tcpUdpData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS_TCP_UDP[index % COLORS_TCP_UDP.length]} />
                 ))}
               </Pie>
               <Tooltip formatter={(value) => `${value.toLocaleString()} packets`} />
               <Legend />
             </PieChart>
           </ResponsiveContainer>
         ) : <p className="chart-no-data">No TCP/UDP packet data available.</p>}
       </ChartCard>

        {/* Top Ports Used */}
       <ChartCard title="Top 20 Ports (Packet Count)">
         {topPortsData.length > 0 ? (
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={topPortsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false}/>
               <XAxis dataKey="port" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={40}/>
               <YAxis tickFormatter={formatPortValue}/>
               <Tooltip formatter={(value, name) => [`${value.toLocaleString()} packets`, `Port ${name}`]}/>
               {/* <Legend /> */}
               <Bar dataKey="count" fill="#00C49F" />
             </BarChart>
           </ResponsiveContainer>
         ) : <p className="chart-no-data">No port statistics available.</p>}
       </ChartCard>

        {/* Top UDP Flood Ports (if applicable) */}
        {topUdpFloodPorts.length > 0 && ( // Only show if data exists
           <ChartCard title="Potential UDP Flood Ports (Packet Count)">
             <ResponsiveContainer width="100%" height={300}>
               <BarChart data={topUdpFloodPorts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                 <XAxis dataKey="port" />
                 <YAxis />
                 <Tooltip formatter={(value, name) => [`${value.toLocaleString()} packets`, `Port ${name}`]}/>
                 {/* <Legend /> */}
                 <Bar dataKey="count" fill="#FFBB28" />
               </BarChart>
             </ResponsiveContainer>
           </ChartCard>
        )}

        {/* Other Simple Stats */}
        <ChartCard title="Other Transport Metrics" isSimple={true}>
            <div className="simple-stats-grid">
                <div><span>TCP Connections (approx):</span> <strong>{transportData.TCPConnections ?? 'N/A'}</strong></div>
                <div><span>TCP Retransmissions:</span> <strong>{transportData.Retransmissions ?? 'N/A'}</strong></div>
                <div><span>Invalid TCP Flags:</span> <strong>{transportData.InvalidTCPFlags ?? 'N/A'}</strong></div>
            </div>
        </ChartCard>

    </div>
  );
};

export default TransportAnalysisTab;