import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pin, Plus, LayoutDashboard, Settings, LogOut } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-pinterest-red rounded-full p-2">
                <Pin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Pinspire</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              data-testid="dashboard-link"
            >
              <LayoutDashboard className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Dashboard</span>
            </Link>

            <Link
              to="/create"
              className="flex items-center space-x-2 px-4 py-2 bg-pinterest-red text-white rounded-lg hover:bg-pinterest-hover transition"
              data-testid="create-post-link"
            >
              <Plus className="h-5 w-5" />
              <span>Create Post</span>
            </Link>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-sm">
                <p className="font-medium text-gray-900" data-testid="user-username">{user?.username}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-pinterest-red transition"
                data-testid="logout-button"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;