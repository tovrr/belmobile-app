
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlusIcon, ExclamationCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../firebase';

const AdminRegister: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            // 1. Create User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            let photoURL = "";

            // 2. Upload Photo if exists
            if (photo) {
                const storageRef = ref(storage, `profile_photos/${user.uid}`);
                await uploadBytes(storageRef, photo);
                photoURL = await getDownloadURL(storageRef);
            }

            // 3. Update Profile
            await updateProfile(user, {
                displayName: name,
                photoURL: photoURL
            });

            // 4. Send Email Verification
            await sendEmailVerification(user);

            // 5. Sign Out immediately to force login after verification
            await signOut(auth);

            // 6. Redirect to verification page
            navigate('/admin/verify-email', { state: { email: email } });

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("User already exists. Sign in?");
            } else {
                setError(err.message || "Failed to create account.");
            }
        } finally {
            setLoading(false);
        }
    };

    const showSignInLink = error === "User already exists. Sign in?";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-electric-indigo p-6 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                        <UserPlusIcon className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Create Admin Account</h2>
                    <p className="text-indigo-100 text-sm">Join the Belmobile Management Team</p>
                </div>
                
                <form onSubmit={handleRegister} className="p-8 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex flex-col items-start animate-pulse">
                            <div className="flex items-center">
                                <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                            {showSignInLink && (
                                <Link to="/admin/login" className="ml-7 mt-1 font-bold underline hover:text-red-800">
                                    Go to Sign In
                                </Link>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col items-center">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-electric-indigo hover:bg-indigo-50 transition-all overflow-hidden relative group"
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <PhotoIcon className="h-8 w-8 mx-auto mb-1" />
                                    <span className="text-[10px] font-bold uppercase">Upload</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PhotoIcon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoChange} 
                            className="hidden" 
                            accept="image/*" 
                        />
                        <p className="text-xs text-gray-400 mt-2">Profile Photo (Optional)</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                            placeholder="admin@belmobile.be"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                                placeholder="••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Repeat Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-electric-indigo text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/admin/login" className="text-sm text-gray-500 hover:text-electric-indigo">
                            Already have an account? <span className="font-bold">Sign In</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminRegister;
