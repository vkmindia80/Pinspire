import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Image, Trash2, Eye, Clock, CheckCircle, FileText } from 'lucide-react';
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
      draft: { color: 'bg-gray-100 text-gray-700', icon: FileText },
      scheduled: { color: 'bg-blue-100 text-blue-700', icon: Clock },
      published: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Posts</h1>
        <p className="text-gray-600">Create, schedule, and manage your Pinterest posts</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Pinterest Connection Section */}
      <div className="mb-8">
        <PinterestConnect onConnectionChange={handleConnectionChange} />
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">{['all', 'draft', 'scheduled', 'published'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === filterOption
                ? 'bg-pinterest-red text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="capitalize">{filterOption}</span>
            <span className="ml-2 text-xs opacity-75">
              ({posts.filter((p) => filterOption === 'all' || p.status === filterOption).length})
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-full p-6">
              <Image className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
          </h3>
          <p className="text-gray-600 mb-6">
            Start creating amazing Pinterest posts with AI assistance
          </p>
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-pinterest-red text-white rounded-lg hover:bg-pinterest-hover transition"
            data-testid="create-first-post-button"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First Post</span>
          </button>
        </div>
      ) : (
        /* Posts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
              data-testid="post-card"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="h-12 w-12 text-gray-400" />
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(post.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                  {post.caption || 'No caption'}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-3">
                    {post.ai_generated_caption && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">AI Caption</span>
                    )}
                    {post.ai_generated_image && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">AI Image</span>
                    )}
                  </div>
                </div>

                {post.scheduled_time && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.scheduled_time).toLocaleString()}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/create?edit=${post._id}`)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
                    data-testid="edit-post-button"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
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
  );
}

export default Dashboard;