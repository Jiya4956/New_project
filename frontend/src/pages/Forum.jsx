import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const TAGS = ['General', 'Eligibility', 'Application', 'Documents', 'International', 'Government', 'BTech', 'MBA', 'Medicine', 'Tips'];

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', tag: 'General' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTag, setActiveTag] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => { fetchPosts(); }, [activeTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = activeTag ? { tag: activeTag } : {};
      const res = await api.get('/api/forum', { params });
      setPosts(res.data || []);
    } catch {
      // fallback to empty
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/forum', formData);
      setPosts(prev => [res.data, ...prev]);
      setFormData({ title: '', content: '', tag: 'General' });
      setShowForm(false);
      showToast('🎉 Post created successfully!');
    } catch {
      showToast('❌ Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (postId) => {
    if (!user) return;
    try {
      const res = await api.post(`/api/forum/${postId}/upvote`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, upvotes: res.data.upvotes } : p));
    } catch {}
  };

  const handleComment = async (postId) => {
    if (!user || !commentText.trim()) return;
    try {
      const res = await api.post(`/api/forum/${postId}/comment`, { content: commentText });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: res.data.comments } : p));
      setCommentText('');
      showToast('💬 Comment added!');
    } catch {}
  };

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  const TAG_COLORS = {
    General: 'badge-gray', Eligibility: 'badge-blue', Application: 'badge-purple',
    Documents: 'badge-yellow', International: 'badge-green', Government: 'badge-green',
    BTech: 'badge-blue', MBA: 'badge-purple', Medicine: 'badge-red', Tips: 'badge-yellow',
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {toastMsg && <div className="toast toast-success">{toastMsg}</div>}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Discussion Forum</h1>
            <p className="text-slate-500 dark:text-slate-400">Ask questions, share tips, and connect with fellow students</p>
          </div>
          {user ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
              id="new-post-btn"
            >
              {showForm ? '✕ Cancel' : '✏️ New Post'}
            </button>
          ) : (
            <Link to="/login" className="btn-primary">
              🔐 Login to Post
            </Link>
          )}
        </div>

        {/* New Post Form */}
        {showForm && (
          <div className="card p-6 mb-8 border-2 border-blue-200 dark:border-blue-800 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Post</h2>
            <form onSubmit={handlePost} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="input" placeholder="What's your question or topic?" required
                  id="post-title"
                />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                  className="input" rows={4} placeholder="Share more details..." required
                  id="post-content"
                />
              </div>
              <div>
                <label className="label">Tag</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button
                      key={tag} type="button"
                      onClick={() => setFormData(p => ({ ...p, tag }))}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        formData.tag === tag
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary" id="post-submit">
                {submitting ? '⏳ Posting...' : '🚀 Publish Post'}
              </button>
            </form>
          </div>
        )}

        {/* Tag Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTag('')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              !activeTag ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            All Posts
          </button>
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                activeTag === tag ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="shimmer h-5 rounded w-3/4 mb-3" />
                <div className="shimmer h-4 rounded w-full mb-2" />
                <div className="shimmer h-4 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-20 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No posts yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Be the first to start a discussion!</p>
            {user && <button onClick={() => setShowForm(true)} className="btn-primary">✏️ Create First Post</button>}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="forum-post">
                {/* Post Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {post.author?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{post.author?.name || 'Anonymous'}</span>
                      <span className="text-xs text-slate-400 ml-2">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                  {post.tag && (
                    <span className={`badge ${TAG_COLORS[post.tag] || 'badge-gray'} flex-shrink-0`}>
                      {post.tag}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {post.title}
                </h3>

                {/* Content preview / expanded */}
                <p className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed ${expandedPost === post._id ? '' : 'truncate-2'}`}>
                  {post.content}
                </p>
                {post.content?.length > 200 && (
                  <button
                    onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                    className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:underline"
                  >
                    {expandedPost === post._id ? 'Show less' : 'Read more'}
                  </button>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => handleUpvote(post._id)}
                    className={`flex items-center gap-1.5 text-sm transition-all ${
                      user ? 'hover:text-blue-600 text-slate-500 dark:text-slate-400' : 'text-slate-400 cursor-default'
                    }`}
                  >
                    <span>👍</span>
                    <span className="font-medium">{post.upvotes || 0}</span>
                  </button>
                  <button
                    onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                    className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <span>💬</span>
                    <span className="font-medium">{post.comments?.length || 0} comments</span>
                  </button>
                  <span className="text-xs text-slate-300 dark:text-slate-600 ml-auto">
                    by {post.author?.name}
                  </span>
                </div>

                {/* Comments Section */}
                {expandedPost === post._id && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    {post.comments?.length > 0 && (
                      <div className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                        {post.comments.map((c, i) => (
                          <div key={i} className="flex gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {c.author?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.author?.name || 'User'}</span>
                                <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {user && (
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1.5">
                          {user.name?.charAt(0)}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="input text-sm flex-1 py-2"
                            onKeyDown={e => { if (e.key === 'Enter') handleComment(post._id); }}
                            id={`comment-${post._id}`}
                          />
                          <button
                            onClick={() => handleComment(post._id)}
                            className="btn-primary text-sm py-2 px-4"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                    {!user && (
                      <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Login to comment
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
