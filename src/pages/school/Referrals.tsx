import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, CheckCircle2, Loader2, Users } from 'lucide-react';
import api from '../../api/axios';

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  referrals: Array<{
    id: string;
    referrerSchool: string;
    newSchool: string;
    date: string;
    status: string;
  }>;
}

export const SchoolReferrals = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/school/referrals')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load referrals:', err))
      .finally(() => setLoading(false));
  }, []);

  const generateLink = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/school/referrals/generate');
      setData(prev => prev ? { ...prev, referralCode: res.data.referralCode, referralLink: res.data.referralLink } : prev);
    } catch (err) {
      console.error('Failed to generate link:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('referrals_title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('referrals_desc')}</p>
        </div>
        <button onClick={generateLink} disabled={generating} className="ui-button-primary flex items-center gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          {generating ? t('generating') : t('generate_new_link')}
        </button>
      </div>

      {/* Current referral link */}
      {data?.referralLink && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <p className="text-xs font-medium text-slate-500 mb-2">{t('your_referral_link')}</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-sm text-slate-700 font-mono truncate">
              {data.referralLink}
            </code>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">{t('code')}: <span className="font-mono">{data.referralCode}</span></p>
        </div>
      )}

      {/* Referral history */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">{t('referral_history')}</h2>
          <span className="text-xs text-slate-500">{data?.referrals.length || 0} {t('records')}</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3">{t('referred_school')}</th>
              <th className="px-5 py-3">{t('date')}</th>
              <th className="px-5 py-3">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.referrals.map((ref) => (
              <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-900">{ref.newSchool}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{new Date(ref.date).toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ref.status === 'converted' ? 'bg-green-50 text-green-700' :
                    ref.status === 'active' ? 'bg-blue-50 text-blue-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                    {ref.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!data?.referrals || data.referrals.length === 0) && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">{t('no_referrals_yet')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
