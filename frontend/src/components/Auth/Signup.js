import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pin, User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      const { access_token, user } = response.data;
      onLogin(access_token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'AI-powered caption generation',
    'DALL-E image creation',
    'Smart scheduling',
    'Pinterest integration'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" data-testid="signup-page">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-5xl w-full relative z-10 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 pr-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-pinterest-red to-pink-600 rounded-2xl p-4 shadow-xl">
                    <Pin className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-pinterest-red to-pink-600 bg-clip-text text-transparent">
                    Pinspire
                  </h1>
                  <p className="text-sm font-semibold text-purple-600">AI-Powered Pinterest Tool</p>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Create Stunning Pinterest Posts with AI
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of creators who are already using AI to elevate their Pinterest game.
              </p>
            </div>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-700">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex flex-col justify-center">
            <div className="text-center lg:hidden mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-pinterest-red to-pink-600 rounded-2xl p-3 shadow-xl">
                    <Pin className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Join Pinspire</h2>
              <p className="text-gray-600">
                Start creating amazing content today
              </p>
            </div>

            <div className="glass rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">Create your account</h3>
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake" data-testid="error-message">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {/* Username */}
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
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pinterest-red focus:border-transparent transition"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      data-testid="email-input"
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pinterest-red focus:border-transparent transition"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password */}
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
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pinterest-red focus:border-transparent transition"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      data-testid="confirm-password-input"
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pinterest-red focus:border-transparent transition"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="signup-button"
                  className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-gradient-to-r from-pinterest-red to-pink-600 hover:from-pinterest-hover hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-pinterest-red hover:text-pink-700 transition">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;