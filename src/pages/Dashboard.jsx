// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import "../components/dashboard/form.css";
import "../components/dashboard/charts.css"; // Keep this for shared chart styles if any

// Dashboard Specific Components
import RoleTable from '../components/dashboard/RoleTable';
import UserTable from '../components/dashboard/UserTable';
import ServiceTable from '../components/dashboard/ServiceTable';
import PCAPTable from '../components/dashboard/PcapTable';
import ServiceHistoryCharts from '../components/dashboard/ServiceChart';
import AddRoleForm from '../components/dashboard/AddRoleForm';
import AddUserForm from '../components/dashboard/AddUserForm';
import AddServiceForm from '../components/dashboard/AddServiceForm';
import PcapUploadModal from '../components/dashboard/AddPcapModel'; // Assuming this is the correct path

// Import the new Analysis View
import PcapAnalysisView from '../components/pcap_analysis/analysis';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [showAddForm, setShowAddForm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [pcaps, setPCAP] = useState([]);
  const [isPcapModalOpen, setIsPcapModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Overall dashboard loading
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // State for showing the detailed PCAP analysis view
  const [selectedPcapId, setSelectedPcapId] = useState(null);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

   // Fetch PCAP list function (modified slightly)
   const fetchPcapData = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true); // Use main loader if requested
        try {
            const pcapResponse = await api.getAllPCAPMetaHistory();
            if(pcapResponse.status === 'success') {
                setPCAP(pcapResponse.pcaps || []);
            } else {
                console.error("failed to fetch pcap meta datas: ", pcapResponse.message);
                // Avoid overwriting other errors if appending
                setError(prev => prev ? prev + "\nFailed to load PCAP list." : "Failed to load PCAP list.");
            }
        } catch (err) {
             console.error('Error fetching PCAP list:', err);
             setError(prev => prev ? prev + `\nError fetching PCAP data: ${err.message}` : `Error fetching PCAP data: ${err.message}`);
        } finally {
             if (showLoader) setLoading(false);
        }
   }, []);


  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Reset detail view if navigating away or changing main tab
    setSelectedPcapId(null);

    const pathSegments = location.pathname.split('/');
    const currentTab = pathSegments[pathSegments.length - 1];
    const validTabs = ['roles', 'users', 'history', 'pcap'];

    // Determine active tab
    if (validTabs.includes(currentTab)) {
      setActiveTab(currentTab);
    } else {
      setActiveTab('roles'); // Default to roles
      if (location.pathname.startsWith('/dashboard') && currentTab !== 'dashboard' && !validTabs.includes(currentTab)) {
        navigate('/dashboard/roles', { replace: true });
      }
    }

    // Initial data fetch
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        const promises = [
          api.getAllRoles(),
          api.getAllUsers(),
          api.getAllServiceDetectionHistory(),
          api.getAllPCAPMetaHistory(), // Fetch PCAP list initially too
        ];
        const [rolesResponse, usersResponse, serviceResponse, pcapResponse] = await Promise.all(promises);

        // Handle responses (same as before)
        if (rolesResponse.status === 'success') setRoles(rolesResponse.role || []);
        else console.error("Failed to fetch roles:", rolesResponse.message);

        if (usersResponse.status === 'success') setUsers(usersResponse.users || []);
        else console.error("Failed to fetch users:", usersResponse.message);

        if (serviceResponse.status === 'success') setServices(serviceResponse.docs || []);
        else console.error("Failed to fetch service history:", serviceResponse.message);

        if (pcapResponse.status === 'success') setPCAP(pcapResponse.pcaps || []);
        else console.error("failed to fetch pcap meta datas: ", pcapResponse.message);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
        setRoles([]); setUsers([]); setServices([]); setPCAP([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, navigate, location.pathname]); // location.pathname dependency handles tab changes


  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setShowAddForm(false);
      setIsPcapModalOpen(false);
      setSelectedPcapId(null); // Clear selected pcap when changing main tabs
      setError('');
      setSuccessMessage('');
      navigate(`/dashboard/${tab}`);
    } else {
      // Clicking the same tab closes forms/modals/details
      setShowAddForm(false);
      setIsPcapModalOpen(false);
      setSelectedPcapId(null); // Go back to list view if clicking 'pcap' tab again
    }
  };

  // --- Action Button / Modal Logic (existing) ---
  const handleActionButtonClick = () => {
    // If already viewing details, this button shouldn't be visible or should do something else
    if (selectedPcapId && activeTab === 'pcap') return;

     setError(''); setSuccessMessage('');
    if (activeTab === 'pcap') {
      setIsPcapModalOpen(!isPcapModalOpen);
      setShowAddForm(false);
    } else {
      setShowAddForm(!showAddForm);
      setIsPcapModalOpen(false);
    }
  };

   const handlePcapUploadSuccess = async (newPcapMetaData) => { // Make async
    console.log('PCAP uploaded in Dashboard, new metadata:', newPcapMetaData);
    setSuccessMessage('PCAP file uploaded successfully! Refreshing list...');
    setIsPcapModalOpen(false); // Close modal
    await fetchPcapData(false); // Re-fetch the list without global loader
    setSuccessMessage('PCAP file uploaded successfully!'); // Update message
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handlePcapRowClick = (pcapId) => {
      console.log("Row clicked, PCAP ID:", pcapId);
      setSelectedPcapId(pcapId);
      window.scrollTo(0, 0);
  };

  // --- Handler to go back from Analysis View ---
  const handleBackToList = () => {
      setSelectedPcapId(null);
  };


  const handleLogout = () => { logout(); navigate('/login'); };
  // Add Role/User/Service Handlers (keep existing implementations)
  const handleAddRole = async (roleData) => { /* ... existing code ... */ };
  const handleAddUser = async (userData) => { /* ... existing code ... */ };
  const handleDetectService = async (scanData) => { /* ... existing code ... */ };

  const getActionButtonText = () => {
      // Hide action button if viewing details
      if (activeTab === 'pcap' && selectedPcapId) return null;

      if (activeTab === 'pcap') {
        return isPcapModalOpen ? 'Cancel Upload' : 'Upload PCAP file';
      }
      if (showAddForm) return 'Cancel';
      switch (activeTab) {
        case 'roles': return 'Add Role';
        case 'users': return 'Add User';
        case 'history': return 'Detect Services';
        default: return 'Add';
      }
  };

  // --- Render Logic ---
   const renderContent = () => {
        if (loading) {
            return (
                <div className="loading-indicator-container">
                    <div className="loading-spinner"></div>
                    <p>Loading Dashboard...</p>
                </div>
            );
        }

        if (activeTab === 'pcap') {
            if (selectedPcapId) {
                return <PcapAnalysisView pcapId={selectedPcapId} onBack={handleBackToList} />;
            } else {
                return <PCAPTable pcapMetadata={pcaps} onRowClick={handlePcapRowClick} />;
            }
        }
        
        if (showAddForm) {
             switch (activeTab) {
               case 'roles': return <AddRoleForm onAdd={handleAddRole} onCancel={() => setShowAddForm(false)} />;
               case 'users': return <AddUserForm onAdd={handleAddUser} onCancel={() => setShowAddForm(false)} roles={roles} />;
               case 'history': return <AddServiceForm onDetect={handleDetectService} onCancel={() => setShowAddForm(false)} users={users} />;
               default: return null;
             }
        } else {
             switch (activeTab) {
               case 'roles': return <RoleTable roles={roles} />;
               case 'users': return <UserTable users={users} />;
               case 'history': return <> <ServiceHistoryCharts history={services} /> <ServiceTable history={services} /> </>;
               default: return null;
             }
        }
    };


  return (
    <div className="dashboard-container">
      {/* Header remains the same */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">AD scanner</h1>
          <div className="header-user-actions">
            <span className="user-welcome-message">
              Welcome, {currentUser?.first_name || currentUser?.user_name}
            </span>
            <button onClick={handleLogout} className="button button-danger button-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main-content">
         {/* Notifications */}
         {error && (
           <div className="notification-message error-message">
             {error.split('\n').map((line, i) => <p key={i}>{line}</p>)}
             <button className="notification-close-button" onClick={() => setError('')}>×</button>
           </div>
         )}
         {successMessage && (
           <div className="notification-message success-message">
             {successMessage}
             <button className="notification-close-button" onClick={() => setSuccessMessage('')}>×</button>
           </div>
         )}

        {/* Main Tabs */}
        <div className="dashboard-tabs-container">
          <nav className="dashboard-tabs-nav">
            <button onClick={() => handleTabChange('roles')} className={`dashboard-tab ${activeTab === 'roles' ? 'active' : ''}`}>Roles</button>
            <button onClick={() => handleTabChange('users')} className={`dashboard-tab ${activeTab === 'users' ? 'active' : ''}`}>Users</button>
            <button onClick={() => handleTabChange('history')} className={`dashboard-tab ${activeTab === 'history' ? 'active' : ''}`}>Service Detection</button>
            <button onClick={() => handleTabChange('pcap')} className={`dashboard-tab ${activeTab === 'pcap' ? 'active' : ''}`}> PCAP Analysis </button>
          </nav>
        </div>

         {/* Action Button (Conditionally Rendered) */}
         { getActionButtonText() && !loading && ( // Don't show button while loading or if text is null
            <div className="dashboard-action-button-container">
              <button onClick={handleActionButtonClick} className="button button-primary">
                {getActionButtonText()}
              </button>
            </div>
          )}

         {/* Main Content Area */}
         <div className="dashboard-content-area">
             {renderContent()}
         </div>

      </main>

      {/* PCAP Upload Modal (Rendered conditionally based on isPcapModalOpen) */}
      <PcapUploadModal
        isOpen={isPcapModalOpen}
        onClose={() => setIsPcapModalOpen(false)}
        onUploadSuccess={handlePcapUploadSuccess}
        apiUploadFunction={api.uploadPCAPFile} // Ensure correct function name from api.js
      />
    </div>
  );
};

export default Dashboard;