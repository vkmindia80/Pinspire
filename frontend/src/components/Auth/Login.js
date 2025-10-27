import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pin, Sparkles } from 'lucide-react';
import api from '../../services/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', formData);
      const { access_token, user } = response.data;
      
      onLogin(access_token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoCredentials = {
      username: 'testuser',
      password: 'test123',
    };
    
    setFormData(demoCredentials);
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', demoCredentials);
      const { access_token, user } = response.data;
      
      onLogin(access_token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="login-page">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-pinterest-red rounded-full p-3">
              <Pin className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Pinspire</h2>
          <p className="mt-2 text-sm text-gray-600">
            AI-Powered Pinterest Post Creator
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" data-testid="error-message">
                {error}
              </div>
            )}

            {/* Demo Credentials Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Try Demo Account</p>
                    <p className="text-xs text-blue-700 mt-1">Click to autofill demo credentials</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                  data-testid="demo-login-button"
                >
                  <span>Use Demo</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                data-testid="username-input"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pinterest-red focus:border-pinterest-red"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                data-testid="password-input"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pinterest-red focus:border-pinterest-red"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-button"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pinterest-red hover:bg-pinterest-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pinterest-red disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-pinterest-red hover:text-pinterest-hover">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;