
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EnvelopeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const VerifyEmail: React.FC = () => {
    const location = useLocation();
    const email = location.state?.email || "your email address";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-electric-indigo p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm animate-pulse">
                        <EnvelopeIcon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="inline-flex flex-col items-start select-none mb-2">
                        <div className="text-3xl font-black tracking-tighter text-white leading-none">
                            BELMOBILE<span className="text-cyber-citron">.BE</span>
                        </div>
                    </div>

                    <p className="text-indigo-100 mt-2 text-sm font-medium">Verification Required</p>
                </div>
                
                <div className="p-8 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Check your Inbox</h2>
                    
                    <p className="text-gray-600 leading-relaxed">
                        We have sent you a verification email to <br/>
                        <span className="font-bold text-slate-900">{email}</span>.
                    </p>
                    
                    <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100">
                        Please click the link in the email to verify your account, then log in to access the dashboard.
                    </div>

                    <Link 
                        to="/admin/login" 
                        className="flex items-center justify-center w-full bg-electric-indigo text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg shadow-indigo-500/30 active:scale-95"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
