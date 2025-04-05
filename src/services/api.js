const API_URL = 'http://localhost:4444/api/v1';

const api = {
  registerUser: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  loginUser: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },


  getAllRoles: async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
  },

  addRole: async (roleData) => {
    try {
      const response = await fetch(`${API_URL}/roles/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData),
      });
      return await response.json();
    } catch (error) {
      console.error('Add role error:', error);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/users/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  addUser: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Add user error:', error);
      throw error;
    }
  },

  getUserByID: async (userID) => {
    try {
      const response = await fetch(`${API_URL}/user/${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Get uesr by ID error:', error);
      throw error;
    }
  },


  addPortDetection: async (portData) => {
    try {
      const respones = await fetch(`${API_URL}/scan/service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portData)
      });

      return await respones.json();
    } catch (error) {
      console.error("Add port detection error: ", error)
      throw error
    }
  },

  getAllServiceDetectionHistory: async () => {
    try {
      const response = await fetch(`${API_URL}/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await response.json();
    } catch (error) {
      console.error('unable to get all service detection history: ', error)
      throw error;
    }
  },

  getAllPCAPMetaHistory: async () => {
    try{
      const response = await fetch(`${API_URL}/pcap/metas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await response.json();
    } catch(error){
      console.error('unable to get all pcap metadata: ', error)
      throw error;
    }
  },

  uploadPCAPFile: async (pcapFile) => {
    const formData = new FormData();
    formData.append('pcap_file', pcapFile);
    try{
      const response = await fetch(`${API_URL}/pcap/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.json();
    } catch(error){
      console.log("unable to upload pcap file: ", error)
      throw error;
    }
  },

  getDetailedPcapAnalysis: async (id) => {
    try{
      const response = await fetch(`${API_URL}/pcap/scan/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
      return response.json();
    } catch(error){
      console.log('unable to get single pcap file: ', error)
      throw error;
    }
  }

  
};

export default api;