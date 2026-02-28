import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Globe, ArrowRight, Zap, PhoneCall, Laptop, FileText } from 'lucide-react';

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-slate-100">
            {icon}
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

export const Landing = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                        </div>
                        <span className="text-base font-semibold text-slate-900">{t('enrollment_ai')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium"
                        >
                            <Globe className="w-4 h-4" />
                            {i18n.language === 'en' ? t('spanish') : t('english')}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="ui-button-primary text-sm"
                        >
                            {t('signin_btn')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-28 pb-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-5 leading-tight">
                        {t('hero_title')}
                    </h1>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        {t('hero_subtitle')}
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-6 bg-slate-50 border-y border-slate-200">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-semibold text-slate-900 text-center mb-10">{t('features_title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureCard icon={<PhoneCall className="w-5 h-5 text-slate-500" />} title={t('feat_voice_title')} desc={t('feat_voice_desc')} />
                        <FeatureCard icon={<Zap className="w-5 h-5 text-slate-500" />} title={t('feat_auto_title')} desc={t('feat_auto_desc')} />
                        <FeatureCard icon={<FileText className="w-5 h-5 text-slate-500" />} title={t('feat_forms_title')} desc={t('feat_forms_desc')} />
                    </div>
                </div>
            </section>

            {/* Access Portals */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">{t('role_selection')}</h2>
                        <p className="text-sm text-slate-500">{t('role_selection_desc')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* School card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 hover:border-blue-400 hover:shadow-md transition-all group">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-5">
                                <Laptop className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('school_card')}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">{t('school_card_desc')}</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                {t('access_portal')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Admin card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 hover:border-slate-400 hover:shadow-md transition-all group">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-5">
                                <Shield className="w-5 h-5 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('admin_card')}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">{t('admin_card_desc')}</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                            >
                                {t('access_portal')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-slate-100">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">AI</span>
                        </div>
                        <span className="font-medium text-slate-700">Enrollment AI</span>
                    </div>
                    <span>&copy; 2026 Enrollment AI. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
};
