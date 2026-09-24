/*
  =====================================================
  ORIGINAL ADMIN DASHBOARD LAYOUT
  Preserved for future re-integration.
  Original file: src/app/admin/dashboard/layout.jsx
  =====================================================
  
  This layout handled:
  - Authentication guard via useAppContext (user, isAuthenticated, loading)
  - Role-based access (admin only)
  - Loading skeleton states
  - Mobile sidebar overlay with backdrop
  - AdminHeader & AdminSidebar components from @/components/Admin/
  
  To restore: import this logic back into the layout file and 
  uncomment the auth checks below.
*/

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NewAdminSidebar from '@/components/NewAdmin/NewAdminSidebar'
import NewAdminHeader from '@/components/NewAdmin/NewAdminHeader'
import { useAppContext } from '@/context/AppContext'

export default function AdminLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAppContext();

    useEffect(() => {
        // Only run checks after AppContext finishes its initial loading
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'admin' && user?.role !== 'superadmin' && user?.role !== 'staff') {
                // If the user is a normal customer, redirect to homepage or customer dashboard
                router.push('/');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    // Show a loading screen while auth is being checked
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F4F6FA]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Don't render the dashboard layout if not authorized to prevent flickering
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin' && user?.role !== 'staff')) {
        return null;
    }

    return (
        <div className="flex h-screen bg-[#F4F6FA] font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-col h-screen w-[220px] flex-shrink-0 print:hidden">
                <NewAdminSidebar />
            </div>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-black/40 z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="md:hidden fixed inset-y-0 left-0 w-[220px] z-50 print:hidden">
                        <NewAdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
                    </div>
                </>
            )}

            {/* Main content */}
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                <NewAdminHeader onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
                    <div className="w-full max-w-full mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}