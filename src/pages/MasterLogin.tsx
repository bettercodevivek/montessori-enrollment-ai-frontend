import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Globe, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const MasterLogin = () => {
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

            if (user?.role !== 'admin') {
                setError('This portal is for system administrators only.');
                logout(); // Log out if they are a school user trying to use the master portal
                setLoading(false);
                return;
            }

            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || t('invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans selection:bg-primary-600 selection:text-white">
            <div className="w-full max-w-md animate-soft">
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck className="w-40 h-40 text-primary-400" />
                    </div>

                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-lg">BB</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white leading-tight">
                                    {t('enrollment_ai')}
                                </h1>
                                <p className="text-xs text-primary-400 font-bold uppercase tracking-wider mt-0.5">{t('admin_card')}</p>
                            </div>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {i18n.language === 'en' ? t('spanish') : t('english')}
                        </button>
                    </div>

                    <div className="mb-8 relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-1">System Access</h2>
                        <p className="text-sm text-slate-400 font-medium">Verify your administrative credentials.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-rose-900/40 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Master Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all placeholder:text-slate-600"
                                placeholder="master@system.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Access Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold h-11 rounded-lg transition-all shadow-lg shadow-primary-900/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            <span className="font-bold text-sm">
                                {loading ? t('signing_in') : "Verify Identity"}
                            </span>
                            {!loading ? <ArrowRight className="w-4 h-4" /> : null}
                        </button>

                        <div className="pt-2 text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-xs text-slate-500 hover:text-primary-400 transition-colors"
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
