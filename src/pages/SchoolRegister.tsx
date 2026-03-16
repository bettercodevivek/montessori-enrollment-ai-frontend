import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Globe, ArrowRight, Loader2, School, User, Mail, Lock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

export const SchoolRegister = () => {
    const location = useLocation();
    const isGoogleOAuth = location.state?.mode === 'google';
    const googleData = location.state || {};
    
    const [formData, setFormData] = useState({
        email: googleData.email || '',
        password: '',
        name: googleData.name || '',
        schoolName: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuthStore();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // Pre-fill form if coming from Google OAuth
    useEffect(() => {
        if (isGoogleOAuth && googleData.email) {
            setFormData(prev => ({
                ...prev,
                email: googleData.email,
                name: googleData.name || prev.name
            }));
        }
    }, [isGoogleOAuth, googleData]);

    const handleGoogleSignUp = async () => {
        try {
            setError('');
            setLoading(true);
            
            // Get Google OAuth URL
            const response = await api.get('/auth/google/url?mode=signup');
            const { authUrl } = response.data;
            
            // Store mode in sessionStorage to remember it's signup
            sessionStorage.setItem('googleAuthMode', 'signup');
            
            // Redirect to Google OAuth
            window.location.href = authUrl;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to initiate Google sign up');
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { email, password, name, schoolName, address } = formData;

        if (!email || (!isGoogleOAuth && !password) || !name || !schoolName) {
            setError('All fields except address are required.');
            setLoading(false);
            return;
        }

        try {
            if (isGoogleOAuth && googleData.googleId) {
                // Complete Google OAuth signup
                const response = await api.post('/auth/google/complete-signup', {
                    email: formData.email,
                    name: formData.name,
                    googleId: googleData.googleId,
                    schoolName: formData.schoolName,
                    address: formData.address
                });

                const { token, user } = response.data;
                loginWithGoogle(token, user);
                navigate('/school/dashboard');
            } else {
                // Regular email/password registration
                await api.post('/auth/register', { email, password, name, schoolName, address });
                await login(email, password);
                navigate('/school/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-lg animate-soft">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 md:p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <School className="w-32 h-32" />
                    </div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-lg">BB</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                                    {t('enrollment_ai')}
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">School Registration</p>
                            </div>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {i18n.language === 'en' ? t('spanish') : t('english')}
                        </button>
                    </div>

                    <div className="mb-6 relative z-10">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Create Account</h2>
                        <p className="text-sm text-slate-500">Register your school institution to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="ui-input h-10 text-sm"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <School className="w-3.5 h-3.5" /> School Name
                                </label>
                                <input
                                    type="text"
                                    name="schoolName"
                                    value={formData.schoolName}
                                    onChange={handleChange}
                                    className="ui-input h-10 text-sm"
                                    placeholder="Sunshine Montessori"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="ui-input h-10 text-sm"
                                placeholder="you@school.com"
                                required
                                disabled={isGoogleOAuth}
                            />
                            {isGoogleOAuth && (
                                <p className="text-xs text-slate-500">Email from Google account</p>
                            )}
                        </div>

                        {!isGoogleOAuth && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5" /> Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="ui-input h-10 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> School Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="ui-input h-10 text-sm"
                                placeholder="123 Education Way, City, ST 12345"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 ui-button-primary h-11 rounded-lg"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            <span className="font-medium text-sm">
                                {loading ? 'Creating Account...' : 'Register School Institution'}
                            </span>
                            {!loading ? <ArrowRight className="w-4 h-4" /> : null}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium h-11 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="font-medium text-sm">Sign up with Google</span>
                        </button>

                        <div className="pt-4 text-center border-t border-slate-100 flex flex-col gap-2">
                            <p className="text-xs text-slate-500">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login/school')}
                                    className="text-primary-600 font-semibold hover:underline"
                                >
                                    Login here
                                </button>
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-xs text-slate-400 hover:text-primary-600 transition-colors"
                            >
                                Back to selection
                            </button>
                        </div>
                    </form>
                </div>
                <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Secure Registration Protocol Active
                </p>
            </div>
        </div>
    );
};
