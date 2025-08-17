'use client';
import { useState, useEffect } from 'react';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // Mock data for demo - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setTags([
        { id: '1', name: 'tech-house', predictions: 45 },
        { id: '2', name: 'disco-house', predictions: 32 },
        { id: '3', name: 'uk-garage', predictions: 28 },
        { id: '4', name: 'mainstage-edm', predictions: 67 },
        { id: '5', name: 'deep-house', predictions: 89 },
        { id: '6', name: 'progressive-house', predictions: 54 },
        { id: '7', name: 'acid-house', predictions: 23 },
        { id: '8', name: 'minimal-techno', predictions: 41 },
        { id: '9', name: 'trance', predictions: 38 },
        { id: '10', name: 'drum-and-bass', predictions: 29 },
        { id: '11', name: 'ambient', predictions: 15 },
        { id: '12', name: 'breakbeat', predictions: 33 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const newTag = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTagName.trim().toLowerCase(),
        predictions: 0
      };
      setTags(prev => [...prev, newTag]);
      setNewTagName('');
      setShowCreateModal(false);
    }
  };

  const handleDeleteTag = (tagId) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    if (selectedTag?.id === tagId) {
      setSelectedTag(null);
    }
  };

  const getTagColor = (tagName) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500',
      'from-orange-500 to-red-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-teal-500',
      'from-violet-500 to-purple-500',
      'from-rose-500 to-pink-500'
    ];
    
    const index = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Music Tags</h1>
            <p className="text-xl text-gray-400">
              Discover and manage AI-generated music tags
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl mt-4 md:mt-0"
          >
            Create New Tag
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tags</p>
                <p className="text-3xl font-bold text-white">{tags.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Predictions</p>
                <p className="text-3xl font-bold text-white">
                  {tags.reduce((sum, tag) => sum + tag.predictions, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Most Popular</p>
                <p className="text-xl font-bold text-white">
                  {tags.reduce((max, tag) => tag.predictions > max.predictions ? tag : max, tags[0])?.name || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors pl-12"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTags.map((tag) => (
            <div 
              key={tag.id}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer group"
              onClick={() => setSelectedTag(tag)}
            >
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${getTagColor(tag.name)} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-bold text-xl">
                    {tag.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {tag.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-gray-400 text-sm">Predictions:</span>
                  <span className="text-purple-400 font-semibold">{tag.predictions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTags.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">No tags found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm ? `No tags match "${searchTerm}". Try a different search term.` : 'No tags have been created yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Create Your First Tag
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Tag</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tag Name
            </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., tech-house, deep-techno"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  newTagName.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Detail Modal */}
      {selectedTag && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${getTagColor(selectedTag.name)} rounded-2xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-2xl">
                    {selectedTag.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedTag.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h2>
                  <p className="text-gray-400">
                    {selectedTag.predictions} predictions
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTag(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tag Information</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{selectedTag.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Predictions:</span>
                    <span className="text-white">{selectedTag.predictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">Recently</span>
                  </div>
                </div>
            </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Usage Statistics</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Prediction Count</span>
                    <span className="text-white font-semibold">{selectedTag.predictions}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${Math.min((selectedTag.predictions / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedTag.predictions} out of {tags.reduce((sum, t) => sum + t.predictions, 0)} total predictions
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Edit Tag
                </button>
                <button 
                  onClick={() => {
                    handleDeleteTag(selectedTag.id);
                    setSelectedTag(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Delete Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    );
}