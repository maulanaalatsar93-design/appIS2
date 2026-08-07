import React, { useState, useContext } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';

export default function MainLayout({ activeTab, setActiveTab, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-industrial-background text-industrial-text font-sans">
      {/* Sidebar hanya tampil bila sudah login */}
      {user && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
