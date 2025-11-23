
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Check if email is verified
            if (!userCredential.user.emailVerified) {
                // Resend verification email to ensure they have a link
                await sendEmailVerification(userCredential.user);
                // Sign out immediately to prevent access
                await signOut(auth);
                // Redirect to verification screen
                navigate('/admin/verify-email', { state: { email: email } });
                return;
            }

            navigate('/admin/dashboard', { replace: true });
        } catch (err: any) {
            setError("Password or Email Incorrect");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-white p-8 text-center flex flex-col items-center border-b border-gray-100">
                    <div className="w-16 h-16 bg-electric-indigo/10 rounded-full flex items-center justify-center mb-4">
                        <LockClosedIcon className="h-8 w-8 text-electric-indigo" />
                    </div>
                    
                    <div className="inline-flex flex-col items-start select-none mb-2">
                        <div className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
                            BELMOBILE<span className="text-cyber-citron">.BE</span>
                        </div>
                        <div className="text-[0.65rem] font-bold tracking-[0.34em] text-slate-400 mt-1.5 uppercase whitespace-nowrap ml-0.5">
                            BUYBACK & REPAIR
                        </div>
                    </div>

                    <p className="text-slate-500 mt-2 text-sm">Admin Portal</p>
                </div>
                
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center animate-pulse">
                            <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-slate-900"
                            placeholder="admin@belmobile.be"
                        />
                    </div>
                    <div>
                         <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                         <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-slate-900 pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-electric-indigo text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing In...' : 'Secure Login'}
                    </button>
                    
                    <div className="text-center mt-4">
                        <p className="text-xs text-slate-400">Don't have an account?</p>
                        <Link to="/admin/register" className="text-sm font-bold text-electric-indigo hover:underline mt-1 block">
                            Register New Admin
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
