import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import OnlineChatWidget from '../chat/OnlineChatWidget';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-gray-50 text-ink font-sans overflow-hidden">
      {/* Sidebar (Dual-Sidebar component handles its own state) */}
      {user && (
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 bg-gray-50/50 relative transition-all duration-300 ${user ? (isCollapsed ? 'md:pl-[84px]' : 'md:pl-[364px]') : 'pl-0'}`}>
        {user && (
          <Header
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        )}
        <main className={`flex-1 overflow-y-auto ${user ? 'p-4 md:px-6 md:py-4' : 'p-0'}`}>
          <Outlet />
        </main>
      </div>

      {/* Chat Widget untuk personnel online */}
      {user && <OnlineChatWidget />}
    </div>
  );
}
