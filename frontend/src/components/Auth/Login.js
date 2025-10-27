import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pin, Sparkles, Lock, User, ArrowRight } from 'lucide-react';
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
      const response = await api.post('/auth/login', formData);
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
      username: 'demo',
      password: 'demo123',
    };
    
    setFormData(demoCredentials);
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', demoCredentials);
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" data-testid="login-page">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-pinterest-red to-pink-600 rounded-2xl p-4 shadow-xl">
                <Pin className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome to Pinspire</h2>
          <p className="text-lg text-gray-600 font-medium">
            Create stunning Pinterest posts with AI
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake" data-testid="error-message">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Demo Button */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-[2px]">
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Try Demo Account</p>
                      <p className="text-xs text-gray-600 mt-0.5">Experience all features instantly</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center space-x-2"
                    data-testid="demo-login-button"
                  >
                    <span>{loading ? 'Loading...' : 'Use Demo'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  data-testid="username-input"
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pinterest-red focus:border-transparent transition text-gray-900 placeholder-gray-400"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  data-testid="password-input"
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pinterest-red focus:border-transparent transition text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              data-testid="login-button"
              className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-gradient-to-r from-pinterest-red to-pink-600 hover:from-pinterest-hover hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-pinterest-red hover:text-pink-700 transition">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;