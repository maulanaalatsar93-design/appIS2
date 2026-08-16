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
    <div className="flex h-screen bg-gray-50 text-ink font-sans overflow-hidden">
      {/* Sidebar (Dual-Sidebar component handles its own state) */}
      {user && (
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 relative">
        <Header 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
        <main className="flex-1 p-4 md:px-6 md:py-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Chat Widget untuk personnel online */}
      {user && <OnlineChatWidget />}
    </div>
  );
}
