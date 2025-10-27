import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layout, AlertCircle, RefreshCw } from 'lucide-react';

function BoardSelector({ selectedBoards, onBoardsChange }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/pinterest/boards');
      setBoards(response.data.boards || []);
      setIsMock(response.data.is_mock);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  };

  const toggleBoard = (boardId) => {
    const newSelection = selectedBoards.includes(boardId)
      ? selectedBoards.filter(id => id !== boardId)
      : [...selectedBoards, boardId];
    
    onBoardsChange(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 text-pinterest-red animate-spin" />
        <span className="ml-2 text-gray-600">Loading boards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Error Loading Boards</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchBoards}
              className="mt-2 text-sm text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Layout className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No boards found</p>
        <p className="text-sm text-gray-500 mt-1">Create some boards on Pinterest first</p>
      </div>
    );
  }

  return (
    <div>
      {isMock && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium">Mock Boards</p>
          <p className="mt-1">These are sample boards for testing. Connect real Pinterest to see your actual boards.</p>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => toggleBoard(board.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedBoards.includes(board.id)
                ? 'border-pinterest-red bg-red-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            data-testid={`board-option-${board.id}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{board.name}</h4>
                {board.description && (
                  <p className="text-sm text-gray-500 mt-1">{board.description}</p>
                )}
                {board.pin_count !== undefined && (
                  <p className="text-xs text-gray-400 mt-1">{board.pin_count} pins</p>
                )}
              </div>
              <div className="ml-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedBoards.includes(board.id)
                    ? 'bg-pinterest-red border-pinterest-red'
                    : 'border-gray-300'
                }`}>
                  {selectedBoards.includes(board.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBoards.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <p className="font-medium">{selectedBoards.length} board(s) selected</p>
          <p className="mt-1">Your post will be published to {selectedBoards.length === 1 ? 'this board' : 'these boards'}</p>
        </div>
      )}
    </div>
  );
}

export default BoardSelector;