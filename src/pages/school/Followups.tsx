import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageSquare, Loader2, History } from 'lucide-react';
import api from '../../api/axios';

interface FollowupData {
  id: string;
  leadName: string;
  type: 'SMS' | 'Email';
  status: 'sent' | 'pending' | 'failed';
  message: string;
  recipient: string;
  timestamp: string;
}

export const SchoolFollowups = () => {
  const { t } = useTranslation();
  const [followups, setFollowups] = useState<FollowupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const res = await api.get('/school/followups');
        setFollowups(res.data);
      } catch (err) {
        console.error('Failed to load followups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-slate-500 text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="animate-soft">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">{t('followups_title')}</h1>
        <p className="text-sm text-slate-500">{t('followups_desc')}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            {t('followup_history')}
          </h2>
          <span className="text-xs text-slate-500">{followups.length} {t('records')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-500 text-xs font-medium border-b border-slate-100">
                <th className="px-6 py-3">{t('lead')}</th>
                <th className="px-6 py-3">{t('type')}</th>
                <th className="px-6 py-3">{t('recipient')}</th>
                <th className="px-6 py-3">{t('status')}</th>
                <th className="px-6 py-3 text-right">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {followups.map((followup) => (
                <tr key={followup.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="text-sm font-medium text-slate-900">{followup.leadName}</div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${followup.type === 'SMS' ? 'bg-indigo-50 text-indigo-600' : 'bg-primary-50 text-primary-600'}`}>
                        {followup.type === 'SMS' ? <MessageSquare className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm text-slate-600">{followup.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600 font-mono">
                    {followup.recipient || '—'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`ui-badge text-xs ${followup.status === 'sent'
                      ? 'bg-emerald-50 text-emerald-700'
                      : followup.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                      }`}>
                      {followup.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-slate-500">
                    {new Date(followup.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {followups.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm">{t('no_followups_yet')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
