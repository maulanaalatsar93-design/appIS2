import React, { useState, useEffect, useContext, useRef } from 'react';
import { MessageSquare, X, Circle, Minus, Search, ArrowLeft, Send } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function OnlineChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadDetails, setUnreadDetails] = useState({});
  const prevUnreadCountRef = useRef(0);

  // Chat state
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { token, user, logout } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/chat/unread', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Jika token expired/invalid, hentikan polling dan logout
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.count > prevUnreadCountRef.current) {
          playNotificationSound();
        }
        prevUnreadCountRef.current = data.count;
        setUnreadCount(data.count);
        setUnreadDetails(data.details || {});
      }
    } catch (error) {
      // Network error — jangan logout, mungkin server sementara tidak bisa diakses
      console.warn('Failed to fetch unread count (network error)');
    }
  };

  const fetchOnlineUsers = async () => {
    if (!token) return;
    try {
      setLoadingUsers(true);
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/auth/online', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Jika token expired/invalid, hentikan polling dan logout
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOnlineUsers(data.filter(u => u.id !== user?.id));
      }
    } catch (error) {
      // Network error — jangan logout
      console.warn('Failed to fetch online users (network error)');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async () => {
    if (!token || !activeChatUser) return;
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + `/api/chat/${activeChatUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;

    const textToSend = newMessage;
    setNewMessage('');

    // Optimistic UI update
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: activeChatUser.id,
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: activeChatUser.id,
          content: textToSend
        })
      });
      if (res.ok) {
        fetchMessages(); // refresh messages immediately to get real IDs
      }
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOnlineUsers();
      const interval = setInterval(fetchOnlineUsers, 30000); // 30s poll for online users & heartbeat
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      const unreadInterval = setInterval(fetchUnreadCount, 10000); // 10s poll for unread
      return () => clearInterval(unreadInterval);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && !isMinimized && activeChatUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // 3s poll for messages
      return () => clearInterval(interval);
    }
  }, [isOpen, isMinimized, activeChatUser, token]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!user) return null;

  const filteredUsers = onlineUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div
          className={`bg-white border border-gray-200 rounded-t-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col w-80 sm:w-96 ${isMinimized ? 'h-12' : 'h-[28rem]'}`}
          style={{ marginBottom: isOpen ? '16px' : '0' }}
        >
          {/* Header */}
          <div className="bg-industrial-blue text-white px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="flex items-center gap-2">
              {activeChatUser ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveChatUser(null); }}
                    className="hover:bg-white/20 p-1 rounded transition-colors mr-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">
                    {activeChatUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-sm truncate max-w-[120px]">{activeChatUser.name}</h3>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-semibold text-sm">Online Personnel</h3>
                  {!isMinimized && (
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full ml-2">
                      {onlineUsers.length}
                    </span>
                  )}
                  {isMinimized && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 animate-pulse">
                      {unreadCount} New
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden relative">
              {activeChatUser ? (
                /* CHAT VIEW */
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="text-center pb-2">
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                        Riwayat chat dalam 24 jam terakhir
                      </span>
                    </div>
                    {messages.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 mt-4">Belum ada pesan.</p>
                    ) : (
                      messages.map((msg, idx) => {
                        const isMe = msg.senderId === user.id;
                        return (
                          <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMe ? 'bg-industrial-blue text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                              <p className="break-words">{msg.content}</p>
                              <span className={`text-[10px] mt-1 block ${isMe ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                      placeholder="Ketik pesan..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-industrial-blue text-white p-2 rounded-full hover:bg-industrial-blue-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                /* USER LIST VIEW */
                <>
                  <div className="p-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari nama personil..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 border-transparent rounded-md pl-9 pr-4 py-2 text-sm focus:bg-white focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {loadingUsers && onlineUsers.length === 0 ? (
                      <div className="flex justify-center items-center h-20 text-industrial-muted text-sm">
                        Loading...
                      </div>
                    ) : onlineUsers.length === 0 ? (
                      <div className="flex justify-center items-center h-20 text-industrial-muted text-sm">
                        Tidak ada personil lain yang online.
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="flex justify-center items-center h-20 text-industrial-muted text-sm">
                        Personil tidak ditemukan.
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {filteredUsers.map(u => {
                          const userUnread = unreadDetails[u.id] || 0;
                          return (
                            <li
                              key={u.id}
                              onClick={() => setActiveChatUser(u)}
                              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                            >
                              <div className="relative">
                                <div className="w-10 h-10 bg-industrial-blue/10 text-industrial-blue rounded-full flex items-center justify-center font-bold text-sm">
                                  {u.name.substring(0, 2).toUpperCase()}
                                </div>
                                <Circle className="w-3 h-3 absolute bottom-0 right-0 text-green-500 fill-green-500 border-2 border-white rounded-full" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${userUnread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>{u.name}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {u.man_power?.position || u.role}
                                </p>
                              </div>
                              {userUnread > 0 && (
                                <div className="bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                                  {userUnread > 99 ? '99+' : userUnread}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="bg-industrial-blue text-white p-2.5 rounded-full shadow-lg hover:bg-industrial-blue-light transition-all hover:scale-105 relative"
          title="Online Personnel"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-sm border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
