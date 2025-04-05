import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';


import Button from '../common/Button';
import Input from '../common/Input';
import Dropdown from '../common/Dropdown';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    first_name: '',
    last_name: '',
    email: '',
    role_id: '',
    password: '',
    contact_number: ''
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.getAllRoles();
        if (response.status === 'success') {
          setRoles(response.role);
          if (response.role.length > 0) {
            setFormData(prev => ({ ...prev, role_id: response.role[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Failed to load roles. Please try again later.');
      }
    };

    fetchRoles();
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.user_name.trim()) {
      errors.user_name = 'Username is required';
    } else if (formData.user_name.length < 3) {
      errors.user_name = 'Username must be at least 3 characters';
    }
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.role_id) {
      errors.role_id = 'Role selection is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 5) {
      errors.password = 'Password must be at least 5 characters';
    }
    
    if (!formData.contact_number) {
      errors.contact_number = 'Contact number is required';
    } else if (!/^\d+$/.test(String(formData.contact_number))) {
      errors.contact_number = 'Contact number must contain only digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'contact_number' ? parseInt(value) || '' : value
    });
    
    // Clear the specific error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous error
    setError('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.registerUser(formData);
      if (response.status === 'success') {
        // Assuming the API returns a token upon successful registration
        login(formData, response.token);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="user_name"
            name="user_name"
            label="Username"
            value={formData.user_name}
            onChange={handleChange}
            required
            error={formErrors.user_name}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="first_name"
              name="first_name"
              label="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
              error={formErrors.first_name}
            />
            
            <Input
              id="last_name"
              name="last_name"
              label="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
              error={formErrors.last_name}
            />
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            required
            error={formErrors.email}
          />

          <Dropdown
            id="role_id"
            name="role_id"
            label="Role"
            value={formData.role_id}
            onChange={handleChange}
            options={roles.map(role => ({ value: role._id, label: role.name }))}
            placeholder="Select a role"
            required
            error={formErrors.role_id}
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
            error={formErrors.password}
            helpText="Password must be at least 5 characters long."
          />

          <Input
            id="contact_number"
            name="contact_number"
            type="number"
            label="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            required
            error={formErrors.contact_number}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;