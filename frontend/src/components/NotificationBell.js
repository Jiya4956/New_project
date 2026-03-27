import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const TYPE_ICON = {
  application_submitted: '✅',
  status_changed:        '📋',
  forum_comment:         '💬',
  forum_upvote:          '👍',
  new_scholarship:       '🎓',
  new_user:              '👤',
  new_application:       '📩',
};

const NotificationBell = () => {
  const [open, setOpen]       = useState(false);
  const [items, setItems]     = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(false);
  const ref  = useRef(null);
  const nav  = useNavigate();

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications');
      setItems(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch {}
  }, []);

  // Poll every 30 s
  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, [fetch]);

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markRead = async (id) => {
    try { await api.put(`/api/notifications/${id}/read`); } catch {}
    setItems(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    setLoading(true);
    try { await api.put('/api/notifications/read-all'); } catch {}
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    setLoading(false);
  };

  const remove = async (e, id) => {
    e.stopPropagation();
    try { await api.delete(`/api/notifications/${id}`); } catch {}
    setItems(prev => prev.filter(n => n._id !== id));
    setUnread(prev => {
      const wasUnread = items.find(n => n._id === id && !n.isRead);
      return wasUnread ? Math.max(0, prev - 1) : prev;
    });
  };

  const handleClick = async (n) => {
    if (!n.isRead) await markRead(n._id);
    setOpen(false);
    if (n.link) nav(n.link.replace(window.location.origin, ''));
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        id="notification-bell"
        onClick={() => { setOpen(!open); if (!open) fetch(); }}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-fade-in overflow-hidden"
          style={{ maxHeight: '480px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800 dark:text-slate-100">Notifications</span>
              {unread > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs font-semibold rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
            {items.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-slate-400 text-sm">You're all caught up!</p>
              </div>
            ) : (
              items.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0
                    ${!n.isRead
                      ? 'bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-100/60 dark:hover:bg-blue-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 
                    ${!n.isRead ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {TYPE_ICON[n.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Unread dot + delete */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                    )}
                    <button
                      onClick={(e) => remove(e, n._id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-400 transition-colors text-xs"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
