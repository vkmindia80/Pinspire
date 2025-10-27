import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, Calendar, Save, Send, Loader2, Hash, Upload } from 'lucide-react';
import api from '../../services/api';
import Loader from '../Common/Loader';
import BoardSelector from '../Pinterest/BoardSelector';

function PostCreator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  // Form data state
  const [formData, setFormData] = useState({
    caption: '',
    image_url: '',
    scheduled_time: '',
    boards: [],
  });

  // AI settings state
  const [aiSettings, setAiSettings] = useState({
    topic: '',
    tone: 'engaging',
    keywords: '',
  });

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSettings, setImageSettings] = useState({
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid'
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [pinterestConnected, setPinterestConnected] = useState(false);
  const [postingToPinterest, setPostingToPinterest] = useState(false);

  // Check Pinterest connection on mount only
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setPinterestConnected(userData.pinterest_connected || false);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch post if editing (only when editId changes)
  useEffect(() => {
    if (editId) {
      const fetchPost = async () => {
        try {
          const response = await api.get(`/posts/${editId}`);
          const post = response.data.post;
          setFormData({
            caption: post.caption || '',
            image_url: post.image_url || '',
            scheduled_time: post.scheduled_time || '',
            boards: post.boards || [],
          });
        } catch (err) {
          setError('Failed to fetch post');
        }
      };
      fetchPost();
    }
  }, [editId]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleCaptionChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, caption: e.target.value }));
  }, []);

  const handleImageUrlChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, image_url: e.target.value }));
  }, []);

  const handleScheduleTimeChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, scheduled_time: e.target.value }));
  }, []);

  const handleTopicChange = useCallback((e) => {
    setAiSettings(prev => ({ ...prev, topic: e.target.value }));
  }, []);

  const handleToneChange = useCallback((e) => {
    setAiSettings(prev => ({ ...prev, tone: e.target.value }));
  }, []);

  const handleKeywordsChange = useCallback((e) => {
    setAiSettings(prev => ({ ...prev, keywords: e.target.value }));
  }, []);

  const handleImagePromptChange = useCallback((e) => {
    setImagePrompt(e.target.value);
  }, []);

  const handleImageSizeChange = useCallback((e) => {
    setImageSettings(prev => ({ ...prev, size: e.target.value }));
  }, []);

  const handleImageQualityChange = useCallback((e) => {
    setImageSettings(prev => ({ ...prev, quality: e.target.value }));
  }, []);

  const handleImageStyleChange = useCallback((e) => {
    setImageSettings(prev => ({ ...prev, style: e.target.value }));
  }, []);

  const handleGenerateCaption = async () => {
    if (!aiSettings.topic.trim()) {
      setError('Please enter a topic for caption generation');
      return;
    }

    setGeneratingCaption(true);
    setError('');

    try {
      const response = await api.post('/ai/generate-caption', {
        topic: aiSettings.topic,
        tone: aiSettings.tone,
        keywords: aiSettings.keywords.split(',').map(k => k.trim()).filter(k => k),
      });

      setFormData(prev => ({ ...prev, caption: response.data.caption }));
      setSuccess('Caption generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate caption');
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError('Please enter an image prompt');
      return;
    }

    setGeneratingImage(true);
    setError('');

    try {
      const response = await api.post('/ai/generate-image', {
        prompt: imagePrompt,
        size: imageSettings.size,
        quality: imageSettings.quality,
        style: imageSettings.style
      });

      setFormData(prev => ({ ...prev, image_url: response.data.image_url }));
      
      if (response.data.revised_prompt && response.data.revised_prompt !== imagePrompt) {
        setSuccess(`Image generated successfully! DALL-E refined your prompt: "${response.data.revised_prompt.substring(0, 100)}..."`);
      } else {
        setSuccess('Image generated successfully with DALL-E 3!');
      }
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.caption.trim()) {
      setError('Please add a caption');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editId) {
        await api.put(`/posts/${editId}`, formData);
        setSuccess('Post updated successfully!');
      } else {
        await api.post('/posts', {
          ...formData,
          ai_generated_caption: !!aiSettings.topic,
          ai_generated_image: !!imagePrompt,
        });
        setSuccess('Post saved as draft!');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!formData.caption.trim()) {
      setError('Please add a caption');
      return;
    }

    if (!formData.scheduled_time) {
      setError('Please select a schedule time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editId) {
        await api.put(`/api/posts/${editId}`, formData);
      } else {
        await api.post('/api/posts', {
          ...formData,
          ai_generated_caption: !!aiSettings.topic,
          ai_generated_image: !!imagePrompt,
        });
      }

      setSuccess('Post scheduled successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  const handlePostToPinterest = async () => {
    if (!pinterestConnected) {
      setError('Please connect your Pinterest account first from the Dashboard');
      return;
    }

    if (!formData.caption.trim()) {
      setError('Please add a caption');
      return;
    }

    if (!formData.image_url) {
      setError('Please add an image URL to post to Pinterest');
      return;
    }

    if (selectedBoards.length === 0) {
      setError('Please select at least one board');
      return;
    }

    setPostingToPinterest(true);
    setError('');

    try {
      let postId = editId;
      if (!editId) {
        const saveResponse = await api.post('/api/posts', {
          ...formData,
          ai_generated_caption: !!aiSettings.topic,
          ai_generated_image: !!imagePrompt,
        });
        postId = saveResponse.data.post._id;
      }

      const response = await api.post(`/api/pinterest/post/${postId}`, {
        board_ids: selectedBoards
      });

      if (response.data.success) {
        setSuccess(`Posted to Pinterest successfully! ${response.data.is_mock ? '(Mock Mode)' : ''}`);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post to Pinterest');
    } finally {
      setPostingToPinterest(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="post-creator">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {editId ? 'Edit Post' : 'Create New Post'}
        </h1>
        <p className="text-gray-600">Use AI to create engaging Pinterest content</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" data-testid="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6" data-testid="success-message">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - AI Tools */}
        <div className="space-y-6">
          {/* AI Caption Generator */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Caption Generator</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic / Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red"
                  rows="3"
                  placeholder="E.g., Healthy breakfast recipes, Summer fashion trends..."
                  value={aiSettings.topic}
                  onChange={handleTopicChange}
                  data-testid="caption-topic-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red"
                  value={aiSettings.tone}
                  onChange={handleToneChange}
                  data-testid="caption-tone-select"
                >
                  <option value="engaging">Engaging</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="informative">Informative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red"
                  placeholder="E.g., recipe, healthy, breakfast"
                  value={aiSettings.keywords}
                  onChange={handleKeywordsChange}
                  data-testid="caption-keywords-input"
                />
              </div>

              <button
                onClick={handleGenerateCaption}
                disabled={generatingCaption || !aiSettings.topic.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                data-testid="generate-caption-button"
              >
                {generatingCaption ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Caption</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Image Generator */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Image Generator</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">DALL-E 3</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Prompt
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red"
                  rows="3"
                  placeholder="Describe the image you want to create..."
                  value={imagePrompt}
                  onChange={handleImagePromptChange}
                  data-testid="image-prompt-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red text-sm"
                    value={imageSettings.size}
                    onChange={handleImageSizeChange}
                    data-testid="image-size-select"
                  >
                    <option value="1024x1024">Square (1024x1024)</option>
                    <option value="1792x1024">Landscape (1792x1024)</option>
                    <option value="1024x1792">Portrait (1024x1792)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red text-sm"
                    value={imageSettings.quality}
                    onChange={handleImageQualityChange}
                    data-testid="image-quality-select"
                  >
                    <option value="standard">Standard</option>
                    <option value="hd">HD (Higher Quality)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red"
                  value={imageSettings.style}
                  onChange={handleImageStyleChange}
                  data-testid="image-style-select"
                >
                  <option value="vivid">Vivid (More dramatic, colorful)</option>
                  <option value="natural">Natural (More realistic, subtle)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={generatingImage || !imagePrompt.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                data-testid="generate-image-button"
              >
                {generatingImage ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating with DALL-E 3...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    <span>Generate Image with AI</span>
                  </>
                )}
              </button>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter image URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={handleImageUrlChange}
                  data-testid="image-url-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Post Preview & Details */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>

            <div className="border rounded-lg overflow-hidden">
              {/* Image Preview */}
              <div className="relative h-64 bg-gray-200 flex items-center justify-center">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    data-testid="image-preview"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No image yet</p>
                  </div>
                )}
              </div>

              {/* Caption Preview */}
              <div className="p-4 bg-white">
                <p className="text-sm text-gray-700 whitespace-pre-wrap" data-testid="caption-preview">
                  {formData.caption || 'Your caption will appear here...'}
                </p>
              </div>
            </div>
          </div>

          {/* Caption Editor */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Caption</h2>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red"
              rows="6"
              placeholder="Write or generate your caption..."
              value={formData.caption}
              onChange={handleCaptionChange}
              data-testid="caption-editor"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.caption.length} / 500 characters
            </p>
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Schedule</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Time (Optional)
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinterest-red"
                value={formData.scheduled_time}
                onChange={handleScheduleTimeChange}
                data-testid="schedule-time-input"
              />
            </div>
          </div>

          {/* Pinterest Board Selection */}
          {pinterestConnected && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Pinterest Boards</h2>
                <button
                  onClick={() => setShowBoardSelector(!showBoardSelector)}
                  className="text-sm text-pinterest-red hover:text-pinterest-hover font-medium"
                >
                  {showBoardSelector ? 'Hide' : 'Select Boards'}
                </button>
              </div>

              {showBoardSelector && (
                <BoardSelector
                  selectedBoards={selectedBoards}
                  onBoardsChange={setSelectedBoards}
                />
              )}

              {!showBoardSelector && selectedBoards.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <p className="font-medium">{selectedBoards.length} board(s) selected</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  data-testid="save-draft-button"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : 'Save Draft'}</span>
                </button>

                <button
                  onClick={handleSchedulePost}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  data-testid="schedule-post-button"
                >
                  <Calendar className="h-5 w-5" />
                  <span>{loading ? 'Scheduling...' : 'Schedule Post'}</span>
                </button>
              </div>

              {pinterestConnected && (
                <button
                  onClick={handlePostToPinterest}
                  disabled={postingToPinterest || selectedBoards.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-pinterest-red text-white rounded-lg hover:bg-pinterest-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="post-to-pinterest-button"
                >
                  <Upload className="h-5 w-5" />
                  <span>
                    {postingToPinterest
                      ? 'Posting to Pinterest...'
                      : `Post to Pinterest ${selectedBoards.length > 0 ? `(${selectedBoards.length} boards)` : ''}`}
                  </span>
                </button>
              )}

              {!pinterestConnected && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <p className="font-medium">Connect Pinterest</p>
                  <p className="mt-1">Connect your Pinterest account from the Dashboard to post directly to Pinterest.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCreator;
