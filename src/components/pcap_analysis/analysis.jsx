import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GeneralAnalysisTab from './generalAnalysis';
import NetworkAnalysisTab from './networkAnalysis';
import TransportAnalysisTab from './transportAnalysis';
import ApplicationAnalysisTab from './applicationAnalysis';
import './analysis.css';

const PcapAnalysisView = ({ pcapId, onBack }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('general');

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!pcapId) {
        setError('No PCAP ID provided.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      setAnalysisData(null); // Clear previous data
      try {
        const data = await api.getDetailedPcapAnalysis(pcapId);
        setAnalysisData(data);
      } catch (err) {
        setError(err.message || 'Failed to load analysis data.');
         console.error("Error in PcapAnalysisView fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [pcapId]); // Re-fetch when pcapId changes

  const renderActiveTabContent = () => {
    if (!analysisData) return null; // Don't render tabs if no data

    switch (activeAnalysisTab) {
      case 'general':
        return <GeneralAnalysisTab metaData={analysisData.meta} />;
      case 'network':
        return <NetworkAnalysisTab networkData={analysisData.network_layer_metrics} />;
      case 'transport':
        return <TransportAnalysisTab transportData={analysisData.transport_layer_metrics} />;
      case 'application':
        return <ApplicationAnalysisTab applicationData={analysisData.application_layer_metrics} />;
      default:
        return <GeneralAnalysisTab metaData={analysisData.meta} />;
    }
  };

  return (
    <div className="analysis-view-container">
      <div className="analysis-header">
        <button onClick={onBack} className="button button-secondary">
          ← Back to List
        </button>
        <h2 className="analysis-title">
            PCAP Analysis Details {analysisData?.meta?.original_file_name ? `- ${analysisData.meta.original_file_name}` : ''}
        </h2>
      </div>


      {loading && (
        <div className="loading-indicator-container analysis-loading">
          <div className="loading-spinner"></div>
          <p>Loading Analysis...</p>
        </div>
      )}

      {error && (
        <div className="notification-message error-message analysis-error">
          <p>{error}</p>
           <button className="notification-close-button" onClick={() => setError('')}>×</button>
        </div>
      )}

      {!loading && !error && analysisData && (
        <>
          {/* Analysis Tabs */}
          <div className="analysis-tabs-container">
            <nav className="analysis-tabs-nav">
              <button
                onClick={() => setActiveAnalysisTab('general')}
                className={`analysis-tab ${activeAnalysisTab === 'general' ? 'active' : ''}`}
              >
                General Info
              </button>
              <button
                onClick={() => setActiveAnalysisTab('network')}
                className={`analysis-tab ${activeAnalysisTab === 'network' ? 'active' : ''}`}
              >
                Network Layer
              </button>
              <button
                onClick={() => setActiveAnalysisTab('transport')}
                className={`analysis-tab ${activeAnalysisTab === 'transport' ? 'active' : ''}`}
              >
                Transport Layer
              </button>
              <button
                onClick={() => setActiveAnalysisTab('application')}
                className={`analysis-tab ${activeAnalysisTab === 'application' ? 'active' : ''}`}
              >
                Application Layer
              </button>
            </nav>
          </div>

          {/* Tab Content Area */}
          <div className="analysis-tab-content">
            {renderActiveTabContent()}
          </div>
        </>
      )}
       {!loading && !error && !analysisData && (
           <p className="no-data-message">No analysis data could be loaded for this PCAP.</p>
       )}
    </div>
  );
};

export default PcapAnalysisView;