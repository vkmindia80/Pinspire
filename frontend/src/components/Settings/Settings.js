import React, { useState, useEffect } from 'react';
import { User, Key, Link2, Save, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

function Settings({ user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Pinterest credentials form state
  const [pinterestForm, setPinterestForm] = useState({
    app_id: '',
    app_secret: '',
    redirect_uri: 'http://localhost:3000/pinterest/callback'
  });

  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    fetchPinterestCredentials();
  }, []);

  const fetchPinterestCredentials = async () => {
    try {
      const response = await api.get('/pinterest/credentials');
      if (response.data.credentials) {
        setPinterestForm({
          app_id: response.data.credentials.app_id || '',
          app_secret: response.data.credentials.app_secret || '',
          redirect_uri: response.data.credentials.redirect_uri || 'http://localhost:3000/pinterest/callback'
        });
        setHasCredentials(response.data.credentials.app_id ? true : false);
      }
    } catch (err) {
      console.error('Error fetching Pinterest credentials:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/auth/update-profile', profileForm);
      
      // Update local storage
      const updatedUser = { ...user, ...profileForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      await api.put('/auth/update-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to update password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinterestCredentialsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/pinterest/credentials', pinterestForm);
      setHasCredentials(true);
      setMessage({ 
        type: 'success', 
        text: 'Pinterest credentials saved successfully! Reconnect Pinterest to use real API.' 
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to save credentials' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCredentials = async () => {
    if (!window.confirm('Are you sure you want to delete your Pinterest credentials? The app will switch to mock mode.')) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.delete('/pinterest/credentials');
      setPinterestForm({
        app_id: '',
        app_secret: '',
        redirect_uri: 'http://localhost:3000/pinterest/callback'
      });
      setHasCredentials(false);
      setMessage({ type: 'success', text: 'Pinterest credentials deleted successfully!' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to delete credentials' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="settings-page-title">Settings</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setMessage({ type: '', text: '' });
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'profile'
                    ? 'border-pinterest-red text-pinterest-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="profile-tab"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('password');
                  setMessage({ type: '', text: '' });
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'password'
                    ? 'border-pinterest-red text-pinterest-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="password-tab"
              >
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>Password</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('pinterest');
                  setMessage({ type: '', text: '' });
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'pinterest'
                    ? 'border-pinterest-red text-pinterest-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="pinterest-tab"
              >
                <div className="flex items-center space-x-2">
                  <Link2 className="w-4 h-4" />
                  <span>Pinterest API</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`m-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`} data-testid="settings-message">
              {message.text}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent"
                    required
                    data-testid="username-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent"
                    required
                    data-testid="email-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-pinterest-red text-white rounded-lg hover:bg-pinterest-red-dark transition disabled:opacity-50"
                  data-testid="save-profile-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent pr-10"
                      required
                      data-testid="current-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent pr-10"
                      required
                      minLength={6}
                      data-testid="new-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent"
                    required
                    minLength={6}
                    data-testid="confirm-password-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-pinterest-red text-white rounded-lg hover:bg-pinterest-red-dark transition disabled:opacity-50"
                  data-testid="save-password-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Pinterest API Tab */}
          {activeTab === 'pinterest' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Pinterest API Credentials</h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter your Pinterest App credentials to enable real posting. Without credentials, the app runs in mock mode.
                {' '}
                <a 
                  href="https://developers.pinterest.com/apps/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pinterest-red hover:underline"
                >
                  Get credentials from Pinterest Developers
                </a>
              </p>

              <form onSubmit={handlePinterestCredentialsUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={pinterestForm.app_id}
                    onChange={(e) => setPinterestForm({ ...pinterestForm, app_id: e.target.value })}
                    placeholder="Enter your Pinterest App ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent"
                    data-testid="app-id-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Secret
                  </label>
                  <input
                    type="password"
                    value={pinterestForm.app_secret}
                    onChange={(e) => setPinterestForm({ ...pinterestForm, app_secret: e.target.value })}
                    placeholder="Enter your Pinterest App Secret"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent"
                    data-testid="app-secret-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redirect URI
                  </label>
                  <input
                    type="url"
                    value={pinterestForm.redirect_uri}
                    onChange={(e) => setPinterestForm({ ...pinterestForm, redirect_uri: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinterest-red focus:border-transparent"
                    data-testid="redirect-uri-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This must match the redirect URI configured in your Pinterest App settings
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-2 bg-pinterest-red text-white rounded-lg hover:bg-pinterest-red-dark transition disabled:opacity-50"
                    data-testid="save-credentials-btn"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Credentials'}</span>
                  </button>

                  {hasCredentials && (
                    <button
                      type="button"
                      onClick={handleDeleteCredentials}
                      disabled={loading}
                      className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                      data-testid="delete-credentials-btn"
                    >
                      Delete Credentials
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to get Pinterest credentials:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://developers.pinterest.com/apps/" target="_blank" rel="noopener noreferrer" className="underline">Pinterest Developers</a></li>
                  <li>Create a new app or select an existing one</li>
                  <li>Copy the App ID and App Secret</li>
                  <li>Add <code className="bg-blue-100 px-1 rounded">http://localhost:3000/pinterest/callback</code> to Redirect URIs</li>
                  <li>Paste credentials here and save</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
