import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-page-bg">
      <AppSidebar />
      <main className="md:ml-[68px] pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}