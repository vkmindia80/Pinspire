import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Check, X, Loader } from 'lucide-react';

function PinterestCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Connecting to Pinterest...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      setStatus('error');
      setMessage(`Pinterest authorization failed: ${error}`);
      setTimeout(() => navigate('/dashboard'), 3000);
      return;
    }

    // Validate parameters
    if (!code || !state) {
      setStatus('error');
      setMessage('Invalid callback parameters');
      setTimeout(() => navigate('/dashboard'), 3000);
      return;
    }

    try {
      // Exchange code for tokens
      const response = await api.post('/api/pinterest/callback', {
        code,
        state
      });

      if (response.data.success) {
        setStatus('success');
        setMessage('Pinterest connected successfully!');
        
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        user.pinterest_connected = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Failed to connect Pinterest');
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {status === 'processing' && (
            <div>
              <Loader className="w-16 h-16 text-pinterest-red mx-auto animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Connecting...</h2>
              <p className="text-gray-600 mt-2">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Success!</h2>
              <p className="text-gray-600 mt-2">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Connection Failed</h2>
              <p className="text-gray-600 mt-2">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PinterestCallback;