import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Image, Trash2, Edit3, Clock, CheckCircle, FileText, Sparkles, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import Loader from '../Common/Loader';
import PinterestConnect from '../Pinterest/PinterestConnect';

function Dashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [pinterestConnected, setPinterestConnected] = useState(false);

  useEffect(() => {
    fetchPosts();
    checkPinterestConnection();
  }, []);

  const checkPinterestConnection = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setPinterestConnected(userData.pinterest_connected || false);
    }
  };

  const handleConnectionChange = (isConnected) => {
    setPinterestConnected(isConnected);
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data.posts);
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: 'Draft' },
      scheduled: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, label: 'Scheduled' },
      published: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Published' },
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badge.color}`}>
        <Icon className="h-3.5 w-3.5" />
        <span>{badge.label}</span>
      </span>
    );
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const getStats = () => {
    return {
      total: posts.length,
      draft: posts.filter(p => p.status === 'draft').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
      published: posts.filter(p => p.status === 'published').length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" data-testid="dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Your Content Hub
              </h1>
              <p className="text-lg text-gray-600">Create, schedule, and manage your Pinterest posts with AI</p>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-pinterest-red to-pink-600 text-white rounded-xl hover:from-pinterest-hover hover:to-pink-700 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Post</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-in">
          {[
            { label: 'Total Posts', value: stats.total, icon: TrendingUp, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
            { label: 'Drafts', value: stats.draft, icon: FileText, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50' },
            { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
            { label: 'Published', value: stats.published, icon: CheckCircle, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="glass rounded-2xl p-6 border border-white/20 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} rounded-xl p-3`}>
                    <div className={`bg-gradient-to-br ${stat.color} rounded-lg p-2`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl mb-6 animate-shake">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Pinterest Connection */}
        <div className="mb-8 animate-scale-in">
          <PinterestConnect onConnectionChange={handleConnectionChange} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 animate-slide-in">
          {[
            { value: 'all', label: 'All Posts', count: stats.total },
            { value: 'draft', label: 'Drafts', count: stats.draft },
            { value: 'scheduled', label: 'Scheduled', count: stats.scheduled },
            { value: 'published', label: 'Published', count: stats.published },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                filter === filterOption.value
                  ? 'bg-gradient-to-r from-pinterest-red to-pink-600 text-white shadow-lg'
                  : 'glass text-gray-700 hover:bg-white border border-white/20'
              }`}
            >
              <span>{filterOption.label}</span>
              <span className={`ml-2 text-xs ${filter === filterOption.value ? 'opacity-90' : 'opacity-75'}`}>
                ({filterOption.count})
              </span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center border border-white/20 animate-scale-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8">
                  <Image className="h-16 w-16 text-purple-500" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">
              {filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {filter === 'all' 
                ? 'Start creating amazing Pinterest posts with AI assistance. Let\'s bring your ideas to life!'
                : `You don't have any ${filter} posts at the moment.`
              }
            </p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-pinterest-red to-pink-600 text-white rounded-xl hover:from-pinterest-hover hover:to-pink-700 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition"
              data-testid="create-first-post-button"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Post</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Posts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <div
                key={post._id}
                className="glass rounded-2xl overflow-hidden border border-white/20 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid="post-card"
              >
                {/* Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full h-full object-cover transition transform hover:scale-110"
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No image</p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(post.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {post.title && (
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                      {post.title}
                    </h3>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {post.caption || post.description || 'No caption'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.ai_generated_caption && (
                      <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Caption</span>
                      </span>
                    )}
                    {post.ai_generated_image && (
                      <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Image className="h-3 w-3" />
                        <span>AI Image</span>
                      </span>
                    )}
                  </div>

                  {post.scheduled_time && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 mb-4 bg-blue-50 px-3 py-2 rounded-lg">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-medium">{new Date(post.scheduled_time).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/create?edit=${post._id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition font-semibold"
                      data-testid="edit-post-button"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-semibold"
                      data-testid="delete-post-button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
