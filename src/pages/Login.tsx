import { useNavigate } from 'react-router-dom';
import { Globe, School, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl animate-soft">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-200">
              <span className="text-white font-black text-lg">BB</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              {t('enrollment_ai')}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('role_selection')}</h2>
          <p className="text-slate-500 max-w-md mx-auto">{t('role_selection_desc')}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-sm mx-auto">
          {/* School Login Card */}
          <div
            onClick={() => navigate('/login/school')}
            className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary-400 p-8 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <School className="w-24 h-24" />
            </div>

            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
              <School className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
              {t('school_card')}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {t('school_card_desc')}
            </p>

            <div className="flex items-center gap-2 text-sm font-bold text-primary-600">
              {t('access_portal')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Admin/Master Login Card */}
          {/* <div
            onClick={() => navigate('/login/master')}
            className="group bg-slate-900 border border-slate-800 rounded-2xl shadow-sm hover:shadow-2xl hover:border-primary-500 p-8 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-primary-400" />
            </div>

            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
              <ShieldCheck className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
              {t('admin_card')}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {t('admin_card_desc')}
            </p>

            <div className="flex items-center gap-2 text-sm font-bold text-primary-400">
              {t('access_portal')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div> */}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-primary-600 hover:bg-white hover:shadow-sm rounded-full transition-all border border-transparent hover:border-slate-200"
          >
            <Globe className="w-4 h-4" />
            {i18n.language === 'en' ? 'En Español' : 'In English'}
          </button>

          <p className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-widest">
            System Security Protocols Active
          </p>
          <div className="mt-8 text-center animate-soft" style={{ animationDelay: '200ms' }}>
            <p className="text-slate-500 text-sm">
              Don't have an account yet?{' '}
              <button
                onClick={() => navigate('/register/school')}
                className="text-primary-600 font-bold hover:underline"
              >
                Register your school here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

