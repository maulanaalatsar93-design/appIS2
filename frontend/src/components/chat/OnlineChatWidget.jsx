import React, { useState, useEffect, useContext } from 'react';
import { MessageSquare, X, Circle, Minus } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function OnlineChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, user } = useContext(AuthContext);

  const fetchOnlineUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/auth/online', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out current user
        setOnlineUsers(data.filter(u => u.id !== user?.id));
      }
    } catch (error) {
      console.error('Failed to fetch online users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      fetchOnlineUsers();
      // Poll every 30 seconds
      const interval = setInterval(fetchOnlineUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isMinimized, token]);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          className={`bg-white border border-gray-200 rounded-t-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col w-80 sm:w-96 ${isMinimized ? 'h-12' : 'h-96'}`}
          style={{ marginBottom: isOpen ? '16px' : '0' }}
        >
          {/* Header */}
          <div className="bg-industrial-blue text-white px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Online Personnel</h3>
              {!isMinimized && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full ml-2">
                  {onlineUsers.length}
                </span>
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
            <div className="flex-1 bg-gray-50 overflow-y-auto p-2">
              {loading && onlineUsers.length === 0 ? (
                <div className="flex justify-center items-center h-full text-industrial-muted text-sm">
                  Loading...
                </div>
              ) : onlineUsers.length === 0 ? (
                <div className="flex justify-center items-center h-full text-industrial-muted text-sm">
                  Tidak ada personil lain yang online.
                </div>
              ) : (
                <ul className="space-y-1">
                  {onlineUsers.map(u => (
                    <li key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                      <div className="relative">
                        <div className="w-10 h-10 bg-industrial-blue/10 text-industrial-blue rounded-full flex items-center justify-center font-bold text-sm">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <Circle className="w-3 h-3 absolute bottom-0 right-0 text-green-500 fill-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {u.man_power?.position || u.role}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="bg-industrial-blue text-white p-3 rounded-full shadow-lg hover:bg-industrial-blue-light transition-all hover:scale-105"
          title="Online Personnel"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
