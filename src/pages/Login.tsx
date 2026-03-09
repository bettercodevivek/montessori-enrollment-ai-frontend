import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Globe, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
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
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/school/dashboard');
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">BB</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                  {t('enrollment_ai')}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">{t('montessori_enrollment_ai')}</p>
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

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-1">{t('welcome')}</h2>
            <p className="text-sm text-slate-500">{t('sign_in_portal')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
          </form>
        </div>
      </div>
    </div>
  );
};
