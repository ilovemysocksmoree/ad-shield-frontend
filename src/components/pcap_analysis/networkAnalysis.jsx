import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector // Added Sector for ActiveShape Pie
} from 'recharts';
import './analysis.css'; 
import ChartCard from './ChartCard';

// Get Top N items from an object { key: value } sorted by value
const getTopNFromObject = (obj, n, keyName = 'name', valueName = 'value') => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj)
    .map(([key, val]) => ({ [keyName]: key, [valueName]: val }))
    .sort((a, b) => b[valueName] - a[valueName])
    .slice(0, n);
};

// --- Recharts Configuration ---
const COLORS_PROTO = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const RADIAN = Math.PI / 180;

// Custom label for Pie Chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    if (!percent || percent < 0.03) return null; // Don't render label for tiny slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + (radius + 10) * Math.cos(-midAngle * RADIAN); // Move label slightly out
    const y = cy + (radius + 10) * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
};


// --- Component ---
const NetworkAnalysisTab = ({ networkData }) => {
  if (!networkData) {
    return <p className="tab-no-data">Network layer analysis data not available.</p>;
  }

  // Transform data for charts
  const protocolDistData = getTopNFromObject(networkData.ProtocolDist, 6, 'name', 'count');
  const topIpData = getTopNFromObject(networkData.IPStats, 15, 'ip', 'packets');
  const ttlData = getTopNFromObject(networkData.TTLStats, 20, 'ttl', 'count');


  return (
    <div className="analysis-tab network-tab chart-grid">
      {/* Protocol Distribution */}
      <ChartCard title="Protocol Distribution (Packet Count)">
        {protocolDistData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={protocolDistData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={110}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
              >
                {protocolDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_PROTO[index % COLORS_PROTO.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()} packets`} />
              {/* <Legend /> */}
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="chart-no-data">No protocol data available.</p>}
      </ChartCard>

      {/* Top IP Addresses */}
       <ChartCard title="Top 15 IP Addresses (Packet Count)">
         {topIpData.length > 0 ? (
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={topIpData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
               <XAxis type="number" />
               <YAxis dataKey="ip" type="category" width={80} tick={{ fontSize: 10 }}/>
               <Tooltip formatter={(value) => `${value.toLocaleString()} packets`} />
               {/* <Legend /> */}
               <Bar dataKey="packets" fill="#82ca9d" barSize={15}/>
             </BarChart>
           </ResponsiveContainer>
         ) : <p className="chart-no-data">No IP address data available.</p>}
       </ChartCard>

       {/* TTL Distribution */}
       <ChartCard title="TTL Value Distribution (Top 20)">
         {ttlData.length > 0 ? (
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={ttlData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false}/>
               <XAxis dataKey="ttl" />
               <YAxis allowDecimals={false}/>
               <Tooltip formatter={(value) => `${value.toLocaleString()} packets`} />
               {/* <Legend /> */}
               <Bar dataKey="count" fill="#ffc658" />
             </BarChart>
           </ResponsiveContainer>
         ) : <p className="chart-no-data">No TTL data available.</p>}
       </ChartCard>

        {/* Other Simple Stats */}
        <ChartCard title="Other Network Metrics" isSimple={true}>
            <div className="simple-stats-grid">
                <div><span>Fragmented Packets:</span> <strong>{networkData.FragmentedPackets ?? 'N/A'}</strong></div>
                <div><span>Reassembled Flows:</span> <strong>{networkData.ReassembledFlows ?? 'N/A'}</strong></div>
                <div><span>Total Packets (Network Layer):</span> <strong>{networkData.TotalPacket?.toLocaleString() ?? 'N/A'}</strong></div>
            </div>
        </ChartCard>

    </div>
  );
};

export default NetworkAnalysisTab;