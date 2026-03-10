import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Globe, ArrowRight, Loader2, School, User, Mail, Lock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

export const SchoolRegister = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        schoolName: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { email, password, name, schoolName, address } = formData;

        if (!email || !password || !name || !schoolName) {
            setError('All fields except address are required.');
            setLoading(false);
            return;
        }

        try {
            // 1. Register
            await api.post('/auth/register', { email, password, name, schoolName, address });

            // 2. Auto-login after registration
            await login(email, password);

            navigate('/school/dashboard');
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
                            />
                        </div>

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
