import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import OnlineChatWidget from '../chat/OnlineChatWidget';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-industrial-background text-industrial-text font-sans">
      {/* Sidebar hanya tampil bila sudah login */}
      {user && (
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
      {/* Chat Widget untuk personnel online */}
      {user && <OnlineChatWidget />}
    </div>
  );
}
