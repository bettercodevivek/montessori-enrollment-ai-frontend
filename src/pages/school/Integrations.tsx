import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { Loader2, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import type { Integration } from '../../types';

const INTEGRATION_INFO: Record<string, { label: string; description: string; setupSteps: string[]; docsUrl: string }> = {
  google: {
    label: 'Google Workspace',
    description: 'Connect Google Calendar to let the AI book and check tour availability automatically.',
    setupSteps: [
      'Go to console.cloud.google.com and create a project.',
      'Enable the Google Calendar API for your project.',
      'Create OAuth 2.0 credentials (Web Application type).',
      'Add your server callback URL as an authorized redirect URI.',
      'Download the credentials JSON and add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your server .env file.',
      'Click Connect below to initiate the OAuth flow.',
    ],
    docsUrl: 'https://developers.google.com/calendar/api/quickstart/nodejs',
  },
  outlook: {
    label: 'Microsoft Outlook / 365',
    description: 'Connect Outlook Calendar to let the AI schedule and manage tour bookings.',
    setupSteps: [
      'Go to portal.azure.com and register a new application (App registrations).',
      'Under Authentication, add a Redirect URI pointing to your server callback endpoint.',
      'Under API permissions, add Calendar.ReadWrite and Mail.Send (delegated).',
      'Copy the Application (client) ID and create a client secret.',
      'Add OUTLOOK_CLIENT_ID and OUTLOOK_CLIENT_SECRET to your server .env file.',
      'Click Connect below to initiate the Microsoft OAuth flow.',
    ],
    docsUrl: 'https://learn.microsoft.com/en-us/graph/auth-register-app-v2',
  },
};

export const SchoolIntegrations = () => {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
      // Clean up the URL
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
      console.error('Failed to toggle integration:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t('integrations_title')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('integrations_desc')}</p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => {
          const info = INTEGRATION_INFO[integration.type];
          const isExpanded = expanded === integration.type;

          return (
            <div key={integration.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${integration.type === 'google' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {integration.type === 'google' ? 'G' : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{info?.label || integration.name}</h3>
                      {integration.connected
                        ? <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> {t('connected')}</span>
                        : <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> {t('not_connected')}</span>
                      }
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{info?.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : integration.type)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {isExpanded ? t('hide_setup') : t('how_to_set_up')}
                  </button>
                  <button
                    onClick={() => handleToggle(integration.type, integration.connected)}
                    disabled={actionLoading === integration.type}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${integration.connected
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {actionLoading === integration.type
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : integration.connected ? <RefreshCw className="w-3.5 h-3.5" /> : null
                    }
                    {integration.connected ? t('disconnect') : t('connect')}
                  </button>
                </div>
              </div>

              {isExpanded && info && (
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">{t('setup_instructions')}</h4>
                  <ol className="space-y-2">
                    {info.setupSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <a
                    href={info.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline mt-3"
                  >
                    Official Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}

        {integrations.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
            No integrations available. Contact your admin to provision integrations.
          </div>
        )}
      </div>
    </div>
  );
};
