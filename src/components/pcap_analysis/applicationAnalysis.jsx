import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector
} from 'recharts';
import './analysis.css';
import ChartCard from './ChartCard';

// --- Helpers ---
const getTopNFromObject = (obj, n, keyName = 'name', valueName = 'value') => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj)
    .map(([key, val]) => ({ [keyName]: key, [valueName]: val }))
    .sort((a, b) => b[valueName] - a[valueName])
    .slice(0, n);
};

const formatValue = (value) => {
    if (value == 0) return 0;
    if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value/1000).toFixed(1)}k`;
    return value;
}

// --- Recharts Config ---
const COLORS_APP = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];


// --- Component ---
const ApplicationAnalysisTab = ({ applicationData }) => {
  if (!applicationData || !applicationData.ProtocolStats) {
    return <p className="tab-no-data">Application layer analysis data not available.</p>;
  }

  const protocolStats = applicationData.ProtocolStats;

  // --- Data Transformation ---
  const appProtocolPacketCounts = Object.entries(protocolStats)
    .map(([protoName, stats]) => ({
      name: protoName,
      packets: stats?.PacketCount || 0,
    }))
    .filter(p => p.packets > 0) // Only include protocols with packets
    .sort((a, b) => b.packets - a.packets); // Sort by packet count

  const topDnsDomains = getTopNFromObject(protocolStats.DNS?.Domains, 20, 'domain', 'count');

  // DNS Anomalies (Simple Count)
  const dnsAnomalies = Object.entries(protocolStats.DNS?.Anomalies || {})
     .map(([anomalyName, count]) => ({ name: anomalyName, count }))
     .filter(a => a.count > 0);


  // Basic HTTP Stats (if available)
  const httpDomains = getTopNFromObject(protocolStats.HTTP?.Domains, 15, 'domain', 'count');


  // Basic TLS Stats (if available) - Example: Cipher Suites count
  const tlsCipherSuites = getTopNFromObject(applicationData.TLSStats?.CipherSuites, 10, 'suite', 'count');


  return (
    <div className="analysis-tab application-tab chart-grid">

       {/* App Protocol Packet Counts */}
       <ChartCard title="Application Protocols (Packet Count)">
         {appProtocolPacketCounts.length > 0 ? (
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={appProtocolPacketCounts} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
               <XAxis type="number" tickFormatter={formatValue}/>
               <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10 }}/>
               <Tooltip formatter={(value) => `${value.toLocaleString()} packets`} />
               <Bar dataKey="packets" barSize={20}>
                   {appProtocolPacketCounts.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS_APP[index % COLORS_APP.length]} />
                   ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         ) : <p className="chart-no-data">No application protocol data found.</p>}
       </ChartCard>

       {/* Top DNS Domains Queried */}
       {topDnsDomains.length > 0 && (
            <ChartCard title="Top 20 DNS Domains Queried">
             <ResponsiveContainer width="100%" height={300}>
               <BarChart data={topDnsDomains} layout="vertical" margin={{ top: 5, right: 20, left: 150, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                 <XAxis type="number" />
                 <YAxis dataKey="domain" type="category" width={150} tick={{ fontSize: 9 }}/>
                 <Tooltip formatter={(value, name) => [`${value.toLocaleString()} queries`, name]}/>
                 <Bar dataKey="count" fill="#00C49F" barSize={10}/>
               </BarChart>
             </ResponsiveContainer>
           </ChartCard>
       )}

        {/* DNS Anomalies */}
        {dnsAnomalies.length > 0 && (
            <ChartCard title="DNS Anomalies Detected">
             <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={dnsAnomalies} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="name" tick={{fontSize: 10}}/>
                   <YAxis />
                   <Tooltip />
                   <Legend />
                   <Bar dataKey="count" fill="#FF8042" />
                 </BarChart>
               </ResponsiveContainer>
            </ChartCard>
        )}

        {/* Top HTTP Domains Accessed */}
        {httpDomains.length > 0 && (
             <ChartCard title="Top 15 HTTP Domains Accessed">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={httpDomains} layout="vertical" margin={{ top: 5, right: 20, left: 150, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" />
                  <YAxis dataKey="domain" type="category" width={150} tick={{ fontSize: 9 }}/>
                  <Tooltip formatter={(value, name) => [`${value.toLocaleString()} packets`, name]}/>
                  <Bar dataKey="count" fill="#8884d8" barSize={10}/>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
        )}

        {/* Top TLS Cipher Suites */}
         {tlsCipherSuites.length > 0 && (
              <ChartCard title="Top 10 TLS Cipher Suites Used">
               <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={tlsCipherSuites} layout="vertical" margin={{ top: 5, right: 20, left: 150, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                   <XAxis type="number" />
                   <YAxis dataKey="suite" type="category" width={150} tick={{ fontSize: 9 }}/>
                   <Tooltip formatter={(value, name) => [`${value.toLocaleString()} times`, name]}/>
                   <Bar dataKey="count" fill="#ffc658" barSize={10}/>
                 </BarChart>
               </ResponsiveContainer>
             </ChartCard>
         )}

         {/* Add more charts based on available data (FTP, SMTP, etc.) if needed */}

    </div>
  );
};

export default ApplicationAnalysisTab;