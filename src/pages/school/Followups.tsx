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
  addressed: boolean;
  addressedNote: string;
  addressedAt: string | null;
  timestamp: string;
}

export const SchoolFollowups = () => {
  const { t } = useTranslation();
  const [followups, setFollowups] = useState<FollowupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressingId, setAddressingId] = useState<string | null>(null);
  const [addressNote, setAddressNote] = useState('');
  const [addressingSaving, setAddressingSaving] = useState(false);

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

  const refresh = async () => {
    try {
      const res = await api.get('/school/followups');
      setFollowups(res.data);
    } catch (err) {
      console.error('Failed to load followups:', err);
    }
  };

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

                    <div className="mt-2 flex flex-col gap-2">
                      {followup.addressed ? (
                        <div>
                          <span className="ui-badge text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Addressed
                          </span>
                          {followup.addressedNote ? (
                            <p className="text-[11px] text-emerald-900/80 mt-1 line-clamp-2">
                              Note: {followup.addressedNote}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAddressingId(followup.id);
                            setAddressNote('');
                          }}
                          className="ui-button-primary !rounded-lg !px-3 !py-2 !text-xs !shadow-none"
                        >
                          Mark as Addressed
                        </button>
                      )}
                    </div>
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

      {/* Address modal */}
      {addressingId && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAddressingId(null);
          }}
        >
          <div className="w-[90vw] max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Mark as Addressed</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Add a short note so the team can track resolution.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddressingId(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Resolution Note</label>
              <textarea
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                rows={4}
                className="ui-input w-full"
                placeholder="e.g., Parent replied, scheduled tour, or issue resolved..."
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddressingId(null)}
                className="ui-button-primary !rounded-lg !px-3 !py-2 !text-xs !shadow-none !bg-white !text-slate-700 !border !border-slate-200 hover:!bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!addressingId) return;
                  const trimmed = addressNote.trim();
                  if (!trimmed) {
                    alert('Please add a note before marking as addressed.');
                    return;
                  }
                  setAddressingSaving(true);
                  try {
                    await api.post(`/school/followups/${addressingId}/addressed`, { note: trimmed });
                    setAddressingId(null);
                    await refresh();
                  } catch (err: any) {
                    const msg = err?.response?.data?.error || 'Failed to mark addressed.';
                    alert(msg);
                  } finally {
                    setAddressingSaving(false);
                  }
                }}
                disabled={addressingSaving}
                className="ui-button-primary !rounded-lg !px-4 !py-2 !text-xs !shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addressingSaving ? 'Saving...' : 'Mark as Addressed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
