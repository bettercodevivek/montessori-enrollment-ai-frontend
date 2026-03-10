import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Globe, ArrowRight, Loader2, School } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SchoolLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuthStore();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError(t('please_enter_credentials'));
            setLoading(false);
            return;
        }

        try {
            await login(email, password);
            const user = useAuthStore.getState().user;

            if (user?.role !== 'school') {
                setError('This portal is for schools only.');
                logout(); // Log out if they are an admin trying to use the school portal
                setLoading(false);
                return;
            }

            navigate('/school/dashboard');
        } catch (err) {
            setError(t('invalid_credentials'));
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
            <div className="w-full max-w-md animate-soft">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <School className="w-32 h-32" />
                    </div>

                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-lg">BB</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                                    {t('enrollment_ai')}
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">{t('school_card')}</p>
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

                    <div className="mb-8 relative z-10">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-1">{t('welcome')}</h2>
                        <p className="text-sm text-slate-500">Sign in to your school institution portal.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="ui-input h-11"
                                placeholder="you@school.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('password')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="ui-input h-11"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 ui-button-primary h-11 rounded-lg"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            <span className="font-medium text-sm">
                                {loading ? t('signing_in') : t('signin_btn')}
                            </span>
                            {!loading ? <ArrowRight className="w-4 h-4" /> : null}
                        </button>

                        <div className="pt-2 text-center flex flex-col gap-2">
                            <p className="text-xs text-slate-500">
                                New here?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/register/school')}
                                    className="text-primary-600 font-semibold hover:underline"
                                >
                                    Register your school
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
            </div>
        </div>
    );
};
