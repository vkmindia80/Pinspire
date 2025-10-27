import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pin, Plus, LayoutDashboard, Settings, LogOut, Menu, X, Sparkles } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', testId: 'dashboard-link' },
    { path: '/create', icon: Plus, label: 'Create Post', testId: 'create-post-link', highlight: true },
    { path: '/settings', icon: Settings, label: 'Settings', testId: 'settings-link' },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-lg" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pinterest-red to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-pinterest-red to-pink-600 rounded-xl p-2.5 shadow-lg transform group-hover:scale-110 transition">
                  <Pin className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-pinterest-red to-pink-600 bg-clip-text text-transparent">
                  Pinspire
                </span>
                <div className="flex items-center space-x-1 -mt-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wide">AI Powered</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              
              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative group px-5 py-2.5 rounded-xl overflow-hidden"
                    data-testid={link.testId}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pinterest-red to-pink-600 opacity-100 group-hover:opacity-90 transition"></div>
                    <div className="relative flex items-center space-x-2 text-white font-bold">
                      <Icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-pinterest-red to-pink-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  data-testid={link.testId}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* User Profile */}
            <div className="flex items-center space-x-4 pl-4 ml-4 border-l-2 border-gray-200">
              <div className="relative group">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm" data-testid="user-username">
                      {user?.username}
                    </p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg shadow-md">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition group"
                data-testid="logout-button"
                title="Logout"
              >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition transform" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/20 animate-slide-in">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition ${
                    active
                      ? 'bg-gradient-to-r from-pinterest-red to-pink-600 text-white'
                      : link.highlight
                      ? 'bg-gradient-to-r from-pinterest-red to-pink-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  data-testid={`${link.testId}-mobile`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{user?.username}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition"
                data-testid="logout-button-mobile"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;