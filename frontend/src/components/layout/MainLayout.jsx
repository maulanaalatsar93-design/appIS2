import React, { useState, useEffect, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import OnlineChatWidget from '../chat/OnlineChatWidget';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-industrial-primaryBase text-industrial-primaryBase font-sans overflow-hidden">
      {/* Sidebar hanya tampil bila sudah login */}
      {user && (
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      )}
      <div className={`flex-1 flex flex-col min-w-0 bg-industrial-bgEggshell transition-all duration-300 ${user ? 'rounded-l-[2.5rem] my-2 mr-2 overflow-hidden' : ''}`}>
        <Header 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto relative bg-transparent">
          <Outlet />
        </main>
      </div>
      {/* Chat Widget untuk personnel online */}
      {user && <OnlineChatWidget />}
    </div>
  );
}
