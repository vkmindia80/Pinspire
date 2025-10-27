import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Link2, Check, AlertCircle } from 'lucide-react';

function PinterestConnect({ onConnectionChange }) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modeInfo, setModeInfo] = useState(null);
  const [error, setError] = useState('');
  const hasFetchedMode = useRef(false);

  useEffect(() => {
    checkConnection();
    
    // Only fetch mode info once
    if (!hasFetchedMode.current) {
      fetchModeInfo();
      hasFetchedMode.current = true;
    }
  }, []);

  const fetchModeInfo = async () => {
    try {
      const response = await api.get('/api/pinterest/mode');
      setModeInfo(response.data);
    } catch (err) {
      console.error('Error fetching Pinterest mode:', err);
    }
  };

  const checkConnection = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsConnected(userData.pinterest_connected || false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/pinterest/connect');
      
      if (response.data.is_mock) {
        // In mock mode, simulate OAuth flow
        await handleMockCallback(response.data.state);
      } else {
        // Real mode: redirect to Pinterest
        window.location.href = response.data.auth_url;
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to Pinterest');
      setLoading(false);
    }
  };

  const handleMockCallback = async (state) => {
    try {
      // Simulate OAuth callback with mock code
      const mockCode = 'mock_auth_code_' + Math.random().toString(36).substr(2, 9);
      const response = await api.post('/api/pinterest/callback', {
        code: mockCode,
        state: state
      });

      if (response.data.success) {
        setIsConnected(true);
        
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        user.pinterest_connected = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        if (onConnectionChange) {
          onConnectionChange(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete connection');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Pinterest?')) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/pinterest/disconnect');
      setIsConnected(false);
      
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      user.pinterest_connected = false;
      localStorage.setItem('user', JSON.stringify(user));
      
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-pinterest-red rounded-lg flex items-center justify-center">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pinterest Connection</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Connected and ready to post' : 'Connect to start posting'}
            </p>
          </div>
        </div>
        
        {isConnected && (
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        )}
      </div>

      {modeInfo && modeInfo.is_mock && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Mock Mode Active</p>
            <p className="mt-1">Pinterest integration is in testing mode. Posts won't be published to real Pinterest. Update credentials in settings to enable real posting.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex space-x-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex-1 bg-pinterest-red text-white px-6 py-3 rounded-lg font-medium hover:bg-pinterest-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="connect-pinterest-btn"
          >
            {loading ? 'Connecting...' : 'Connect Pinterest'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="disconnect-pinterest-btn"
          >
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        )}
      </div>
    </div>
  );
}

export default PinterestConnect;