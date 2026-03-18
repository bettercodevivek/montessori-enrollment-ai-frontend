import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { Loader2, CheckCircle, XCircle, RefreshCw, Zap } from 'lucide-react';
import type { Integration } from '../../types';

export const SchoolIntegrations = () => {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      const res = await api.get('/school/integrations');
      setIntegrations(res.data);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      alert(`Successfully connected ${params.get('success')}!`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleToggle = async (type: string, currentlyConnected: boolean) => {
    setActionLoading(type);
    try {
      if (currentlyConnected) {
        await api.post(`/school/integrations/${type}/disconnect`);
        await fetchIntegrations();
      } else {
        const res = await api.post(`/school/integrations/${type}/connect`);
        if (res.data.authUrl) {
          window.location.href = res.data.authUrl;
        } else {
          await fetchIntegrations();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to toggle integration.';
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Ecosystem...</span>
    </div>
  );

  return (
    <div className="w-full animate-soft">
      <div className="mb-10 flex items-baseline justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('integrations_title')}</h1>
          <p className="text-xs text-slate-500 mt-1">Sychronize your institutional workspace with the AI core.</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
           <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Active Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {integrations.map((integration) => {
          const isGoogle = integration.type === 'google';
          return (
            <div key={integration.id} className="ui-card flex flex-col p-8 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm">
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 rounded-lg border border-slate-100 flex items-center justify-center bg-white shadow-sm shrink-0">
                   <img 
                    src={isGoogle ? "https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" : "/outlook_logo.svg"} 
                    alt={integration.type} 
                    className="w-7 h-7 object-contain"
                   />
                </div>
                {integration.connected ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                    <CheckCircle className="w-3 h-3" />
                    CONNECTED
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                    <XCircle className="w-3 h-3" />
                    DISCONNECTED
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{isGoogle ? 'Google Workspace' : 'Microsoft Office 365'}</h3>
                {integration.connected && integration.email && (
                  <p className="text-[11px] font-bold text-blue-600 mt-1">{integration.email}</p>
                )}
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  {isGoogle 
                    ? 'Sync Google Calendar and Gmail to enable automated tour scheduling and parent follow-ups.' 
                    : 'Integrate Outlook Calendar and Mail to manage school visits and official communications.'}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-end">
                <button
                  onClick={() => handleToggle(integration.type, integration.connected)}
                  disabled={actionLoading === integration.type}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-widest ${integration.connected
                    ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                    }`}
                >
                  {actionLoading === integration.type ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : integration.connected ? (
                    <RefreshCw className="w-3.5 h-3.5" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  )}
                  {integration.connected ? 'Disconnect Sync' : 'Initialize Sync'}
                </button>
              </div>
            </div>
          );
        })}

        {integrations.length === 0 && (
          <div className="col-span-full py-20 text-center ui-card bg-slate-50 border-dashed border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Access Restricted</p>
          </div>
        )}
      </div>

      <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-lg">
         <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
               <Zap className="w-4 h-4 text-slate-400" />
            </div>
            <div>
               <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Protocol Information</h4>
               <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                 By initializing a sync, you authorize BrightBridge to read/write to your calendar and send emails on behalf of the institutional assistant. Connection status is monitored periodically to ensure operational integrity.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
