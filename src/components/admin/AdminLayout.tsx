import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAdmin, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAdmin) {
            navigate('/admin/login');
        }
    }, [user, isAdmin, loading, navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin/login');
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-indigo"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 text-slate-800 font-sans">
            <Sidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Bar */}
                <header className="h-20 flex justify-between items-center px-8 bg-white/50 backdrop-blur-sm z-10 border-b border-gray-200/50">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                        <p className="text-sm text-slate-500">Welcome back, {user?.displayName || user?.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        )}
                        
                        <button 
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                        >
                            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-8 pb-8 pt-4">
                    {/* Content Container */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 min-h-full p-8 relative">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;